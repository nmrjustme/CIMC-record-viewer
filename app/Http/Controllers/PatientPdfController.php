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

    /**
     * Centralized function to regenerate the PDF file based on stored images.
     * Ensures descending order (newest uploads first).
     */
    private function regeneratePdf($fileId)
    {
        $fileRecord = PatientsRecordsFileModel::with('records.patient')->findOrFail($fileId);
        $patient = $fileRecord->records->patient;

        // Fetch images in DESCENDING order (Newest first)
        $pages = RecordsPageModel::where('file_id', $fileId)
            ->orderBy('created_at', 'desc') 
            ->get();

        $base64Images = [];
        foreach ($pages as $page) {
            $relativePath = str_replace('storage/', '', $page->image_path);

            if ($page->image_path !== 'N/A' && Storage::disk('public')->exists($relativePath)) {
                $fullPath = storage_path('app/public/' . $relativePath);
                $imageData = base64_encode(file_get_contents($fullPath));
                $mime = mime_content_type($fullPath);
                $base64Images[] = 'data:' . $mime . ';base64,' . $imageData;
            }
        }

        // Generate PDF
        $pdf = Pdf::loadView('pdf.patient-archive', [
            'category'     => $fileRecord->records->record_type,
            'date'         => now()->format('m/d/Y'),
            'patient'      => $patient,
            'importImages' => $base64Images,
            'records'      => []
        ])->setPaper('a4');

        // Update the file on disk
        $relativePdfPath = str_replace('storage/', '', $fileRecord->file_path);
        Storage::disk('public')->put($relativePdfPath, $pdf->output());

        // Update timestamp
        $fileRecord->touch();

        return $fileRecord;
    }

    public function createBlank(Request $request)
    {
        $request->validate([
            'category' => 'required|string',
            'records_id' => 'required|integer',
        ]);

        DB::beginTransaction();

        try {
            $patient = patients::findOrFail($request->records_id);

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

            $pdf = Pdf::loadView('pdf.patient-archive', [
                'category' => $request->category,
                'date' => now()->format('m/d/Y'),
                'patient' => $patient,
                'importImage' => null, 
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
                'image_path' => 'N/A',
                'uploaded_by' => Auth::id(),
            ]);

            DB::commit();
            $this->logActivity('CREATE', "Generated blank PDF ({$request->category})", 'Medical Records');

            return redirect()->back()->with('flash', [
                'success' => true,
                'message' => "{$request->category} created successfully.",
                'pdf_path' => asset($fileRecord->file_path)
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error("createBlank Failed: " . $e->getMessage());
            return redirect()->back()->withErrors(['error' => $e->getMessage()]);
        }
    }

    public function uploadImage(Request $request, $fileId)
    {
        $request->validate([
            'images' => 'required|array',
            'images.*' => 'image|mimes:jpeg,png,jpg|max:102400',
        ]);

        DB::beginTransaction();
        try {
            $directory = 'pdf_image';
            if (!Storage::disk('public')->exists($directory)) {
                Storage::disk('public')->makeDirectory($directory);
            }

            foreach ($request->file('images') as $imageFile) {
                $imageName = 'img_' . time() . '_' . uniqid() . '.jpg';
                $pathOnDisk = $directory . '/' . $imageName;

                $optimizedImage = Image::read($imageFile)->scale(width: 1200)->toJpeg(75);
                Storage::disk('public')->put($pathOnDisk, $optimizedImage);

                RecordsPageModel::create([
                    'file_id' => $fileId,
                    'image_path' => "storage/" . $pathOnDisk,
                    'total_pages' => 1,
                    'uploaded_by' => Auth::id()
                ]);
            }

            // Call the regeneration helper
            $this->regeneratePdf($fileId);

            DB::commit();
            return redirect()->back()->with('success', count($request->file('images')) . ' images uploaded and PDF updated in descending order.');
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error("uploadImage Failed: " . $e->getMessage());
            return redirect()->back()->withErrors(['error' => $e->getMessage()]);
        }
    }

    public function deleteImage($pageId)
    {
        DB::beginTransaction();
        try {
            $page = RecordsPageModel::findOrFail($pageId);
            $fileId = $page->file_id;

            if ($page->image_path && $page->image_path !== 'N/A') {
                $relativeImgPath = str_replace('storage/', '', $page->image_path);
                Storage::disk('public')->delete($relativeImgPath);
            }

            $page->delete();

            // Regenerate PDF after deletion
            $this->regeneratePdf($fileId);

            DB::commit();
            return redirect()->back()->with('success', 'Image deleted and PDF updated.');
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error("deleteImage Error: " . $e->getMessage());
            return redirect()->back()->withErrors(['error' => 'Deletion failed.']);
        }
    }

    public function deleteFile($id)
    {
        $file = PatientsRecordsFileModel::with('records.patient')->findOrFail($id);
        $parentRecordId = $file->records_id;

        DB::beginTransaction();
        try {
            // Delete PDF file
            $relativePdfPath = str_replace('storage/', '', $file->file_path);
            Storage::disk('public')->delete($relativePdfPath);

            // Delete Image files
            $pages = RecordsPageModel::where('file_id', $id)->get();
            foreach ($pages as $page) {
                if ($page->image_path !== 'N/A') {
                    Storage::disk('public')->delete(str_replace('storage/', '', $page->image_path));
                }
            }

            $file->delete();
            if ($parentRecordId) {
                patientsRecord::where('id', $parentRecordId)->delete();
            }

            DB::commit();
            return redirect()->back()->with('success', 'Full record deleted.');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->withErrors(['error' => $e->getMessage()]);
        }
    }
}