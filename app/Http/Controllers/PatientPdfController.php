<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\patients;
use App\Models\patientsRecord;
use App\Models\PatientsRecordsFileModel;
use App\Models\RecordsPageModel;
use Illuminate\Support\Facades\Storage;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Intervention\Image\Laravel\Facades\Image;
use App\Traits\Loggable;

class PatientPdfController extends Controller
{
    use Loggable;

    public function createBlank(Request $request)
    {
        $request->validate([
            'category' => 'required|string',
            'records_id' => 'required|integer',
        ]);

        DB::beginTransaction();

        try {
            $patient = patients::findOrFail($request->records_id);

            // Check for duplicates (Keep this logic)
            $existingRecord = patientsRecord::where('patients_id', $patient->id)
                ->where('record_type', $request->category)
                ->first();

            if ($existingRecord) {
                $existingFile = PatientsRecordsFileModel::where('records_id', $existingRecord->id)->first();
                DB::rollBack();
                return redirect()->back()->with('flash', [
                    'success' => false,
                    'message' => "A record for {$request->category} already exists.",
                    'pdf_path' => $existingFile ? asset($existingFile->file_path) : null
                ]);
            }

            $record = patientsRecord::create([
                'patients_id' => $patient->id,
                'record_type' => $request->category,
                'description' => "System generated PDF",
                'created_by' => Auth::id(),
            ]);

            // --- FIXED: Do not look for existing images here ---
            $imageSrc = null;
            $importedImagePath = 'N/A';

            // Generate PDF
            $pdf = Pdf::loadView('pdf.patient-archive', [
                'category' => $request->category,
                'date' => now()->format('m/d/Y'),
                'patient' => $patient,
                'importImage' => $imageSrc, // Will be null
                'records' => []
            ])->setPaper('a4');

            $fileName = "{$request->category}_HRN-{$patient->hrn}_" . time() . ".pdf";
            $storagePath = "pdfs/{$fileName}";
            Storage::disk('public')->put($storagePath, $pdf->output());

            $fileRecord = PatientsRecordsFileModel::create([
                'records_id' => $record->id,
                'file_path' => "storage/{$storagePath}",
                'total_pages' => 1,
            ]);

            RecordsPageModel::create([
                'file_id' => $fileRecord->id,
                'total_pages' => 1,
                'image_path' => $importedImagePath, // Will be 'N/A'
                'uploaded_by' => Auth::id(),
            ]);

            DB::commit();

            $this->logActivity('CREATE', "Generated blank PDF ({$request->category}) for Patient HRN: {$patient->hrn}", 'Medical Records');

            return redirect()->back()->with('flash', [
                'success' => true,
                'message' => "{$request->category} created successfully.",
                'pdf_path' => asset($fileRecord->file_path)
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error("createBlank Failed: " . $e->getMessage());
            return redirect()->back()->with('flash', [
                'success' => false,
                'message' => "Critical Error: " . $e->getMessage()
            ]);
        }
    }

    public function uploadImage(Request $request, $fileId)
    {
        // 1. Validation for multiple images
        $request->validate([
            'images' => 'required|array',
            'images.*' => 'image|mimes:jpeg,png,jpg|max:102400', // 20MB per image
        ], [
            'images.*.image' => 'You uploaded multiple files, but at least one file type is not accepted.',
            'images.*.mimes' => 'Only JPEG, PNG, and JPG files are supported.',
        ]);

        DB::beginTransaction();
        
        try {
            $fileRecord = PatientsRecordsFileModel::with('records.patient')->findOrFail($fileId);
            $patient = $fileRecord->records->patient;
            $directory = 'pdf_image';
            
            $count = count($request->file('images'));

            // Ensure directory exists
            if (!Storage::disk('public')->exists($directory)) {
                Storage::disk('public')->makeDirectory($directory);
            }

            // 2. Loop through each uploaded image
            foreach ($request->file('images') as $imageFile) {
                $imageName = 'img_' . time() . '_' . uniqid() . '.jpg';
                $pathOnDisk = $directory . '/' . $imageName;

                /**
                 * OPTIMIZATION STEP:
                 * Scale to 1200px width, encode as JPG 75% quality
                 */
                $optimizedImage = Image::read($imageFile)
                    ->scale(width: 1200)
                    ->toJpeg(75);

                // Store binary to disk
                Storage::disk('public')->put($pathOnDisk, $optimizedImage);

                $databaseImagePath = "storage/" . $pathOnDisk;

                // 3. Log each page in the database
                RecordsPageModel::create([
                    'file_id' => $fileId,
                    'image_path' => $databaseImagePath,
                    'total_pages' => 1,
                    'uploaded_by' => Auth::id()
                ]);
            }

            // 4. Fetch ALL images for this file (including new ones) to render PDF
            // Using orderBy('created_at', 'asc') so they appear in the order uploaded
            $allPages = RecordsPageModel::where('file_id', $fileId)
                ->orderBy('created_at', 'desc')
                ->get();

            $base64Images = [];
            foreach ($allPages as $page) {
                $relativePath = str_replace('storage/', '', $page->image_path);

                if (Storage::disk('public')->exists($relativePath)) {
                    $fullPath = storage_path('app/public/' . $relativePath);
                    $imageData = base64_encode(file_get_contents($fullPath));
                    $mime = mime_content_type($fullPath);
                    $base64Images[] = 'data:' . $mime . ';base64,' . $imageData;
                }
            }

            // 5. Regenerate PDF with all images
            $pdf = Pdf::loadView('pdf.patient-archive', [
                'category' => $fileRecord->records->record_type,
                'date' => now()->format('m/d/Y'),
                'patient' => $patient,
                'importImages' => $base64Images,
                'records' => []
            ])->setPaper('a4');

            // 6. Update the existing PDF file on disk
            $relativePdfPath = str_replace('storage/', '', $fileRecord->file_path);
            Storage::disk('public')->put($relativePdfPath, $pdf->output());

            // Update timestamp on the parent record
            $fileRecord->touch();

            DB::commit();

            $this->logActivity('UPDATE', "Uploaded $count images to record ID: {$fileId} (Patient: {$patient->lastname})", 'Medical Records');
            
            return redirect()->back()->with('success', count($request->file('images')) . ' images processed and PDF updated.');
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error("uploadImage Failed: " . $e->getMessage());
            return redirect()->back()->withErrors(['error' => 'Failed to process images: ' . $e->getMessage()]);
        }
    }
    
    public function deleteFile($id)
    {
        // 1. Find the file record with its parent relation
        $file = PatientsRecordsFileModel::with('records')->findOrFail($id);
        $recordType = $file->records->record_type;
        $patientHrn = $file->records->patient->hrn ?? 'Unknown';
        $recordType = $file->records->record_type;
        // Get the parent record ID before we start deleting
        $parentRecordId = $file->records_id;

        DB::beginTransaction();

        try {
            // 2. DISK CLEANUP: Delete the actual PDF file
            // Your other methods use 'file_path' and prefix it with 'storage/'
            if ($file->file_path) {
                $relativePdfPath = str_replace('storage/', '', $file->file_path);
                if (Storage::disk('public')->exists($relativePdfPath)) {
                    Storage::disk('public')->delete($relativePdfPath);
                }
            }

            // 3. IMAGE CLEANUP: Delete associated optimized images from disk
            $pages = RecordsPageModel::where('file_id', $id)->get();
            foreach ($pages as $page) {
                if ($page->image_path && $page->image_path !== 'N/A') {
                    $relativeImgPath = str_replace('storage/', '', $page->image_path);
                    Storage::disk('public')->delete($relativeImgPath);
                }
            }

            // 4. DATABASE CLEANUP: Delete the records
            // This will delete the file entry and the page entries
            $file->delete();

            // Also delete the parent 'patientsRecord' entry so it's fully gone
            if ($parentRecordId) {
                patientsRecord::where('id', $parentRecordId)->delete();
            }

            DB::commit();

            $this->logActivity('DELETE', "Deleted entire $recordType record for Patient HRN: $patientHrn", 'Medical Records');

            return redirect()->back()->with('flash', [
                'success' => true,
                'message' => 'Record and associated files deleted successfully.'
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error("Delete File Failed: " . $e->getMessage());
            return redirect()->back()->with('flash', [
                'success' => false,
                'message' => 'Failed to delete file: ' . $e->getMessage()
            ]);
        }
    }

    public function deleteImage($pageId)
    {
        DB::beginTransaction();
        try {
            // 1. Locate the specific page
            $page = RecordsPageModel::findOrFail($pageId);
            $fileId = $page->file_id;
            $fileRecord = PatientsRecordsFileModel::with('records.patient')->findOrFail($fileId);

            // 2. Physical File Deletion
            if ($page->image_path && $page->image_path !== 'N/A') {
                $relativeImgPath = str_replace('storage/', '', $page->image_path);
                if (Storage::disk('public')->exists($relativeImgPath)) {
                    Storage::disk('public')->delete($relativeImgPath);
                }
            }

            // 3. Database Row Deletion
            $page->delete();

            // 4. PDF REGENERATION (Ascending Order: Page 1 = First Uploaded)
            $remainingPages = RecordsPageModel::where('file_id', $fileId)
                ->orderBy('created_at', 'asc')
                ->get();

            $base64Images = [];
            foreach ($remainingPages as $p) {
                $path = str_replace('storage/', '', $p->image_path);
                if (Storage::disk('public')->exists($path)) {
                    $fullPath = storage_path('app/public/' . $path);
                    $imageData = base64_encode(file_get_contents($fullPath));
                    $mime = mime_content_type($fullPath);
                    $base64Images[] = 'data:' . $mime . ';base64,' . $imageData;
                }
            }

            // 5. Update PDF on Disk
            $pdf = Pdf::loadView('pdf.patient-archive', [
                'category' => $fileRecord->records->record_type,
                'patient' => $fileRecord->records->patient,
                'importImages' => $base64Images,
                'date' => now()->format('m/d/Y'),
                'records' => []
            ])->setPaper('a4');

            $relativePdfPath = str_replace('storage/', '', $fileRecord->file_path);
            Storage::disk('public')->put($relativePdfPath, $pdf->output());

            DB::commit();
            
            $this->logActivity('DELETE', "Deleted image page from {$fileRecord->records->record_type} (Patient: {$fileRecord->records->patient->lastname})", 'Medical Records');

            return redirect()->back();
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error("deleteImage Error: " . $e->getMessage());
            return redirect()->back()->withErrors(['error' => 'Deletion failed.']);
        }
    }
}
