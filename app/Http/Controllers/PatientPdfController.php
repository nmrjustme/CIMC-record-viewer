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


class PatientPdfController extends Controller
{
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
            'images.*' => 'image|mimes:jpeg,png,jpg|max:10240', // 10MB per image
        ]);

        DB::beginTransaction();

        try {
            $fileRecord = PatientsRecordsFileModel::with('records.patient')->findOrFail($fileId);
            $patient = $fileRecord->records->patient;
            $directory = 'pdf_image';

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
            return redirect()->back()->with('success', count($request->file('images')) . ' images processed and PDF updated.');

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error("uploadImage Failed: " . $e->getMessage());
            return redirect()->back()->withErrors(['error' => 'Failed to process images: ' . $e->getMessage()]);
        }
    }
}
