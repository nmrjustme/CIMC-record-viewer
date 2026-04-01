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


            // --- NEW: Check for duplicate PDF ---
            $existingFile = PatientsRecordsFileModel::whereHas('records', function ($q) use ($patient, $request) {
                $q->where('patients_id', $patient->id)
                ->where('record_type', $request->category);
            })->first();

            if ($existingFile) {
                return redirect()->back()->with('flash', [
                    'success' => false,
                    'message' => "A PDF for {$request->category} already exists for this patient!",
                    'pdf_path' => asset($existingFile->file_path)
                ]);
            }

            $record = patientsRecord::create([
                'patients_id' => $patient->id,
                'record_type' => $request->category,
                'description' => "System generated PDF with imported image",
                'created_by'  => Auth::id(),
            ]);

            // Logic to find existing image
            $existingImage = RecordsPageModel::whereHas('file.records', function ($q) use ($patient) {
                $q->where('patients_id', $patient->id);
            })->where('image_path', '!=', 'N/A')->latest()->first();

            $imageSrc = null;
            $importedImagePath = 'N/A';

            if ($existingImage) {
                $importedImagePath = $existingImage->image_path;
                // createBlank logic: strip 'storage/' to check disk
                $cleanPath = str_replace('storage/', '', $importedImagePath);

                if (Storage::disk('public')->exists($cleanPath)) {
                    $fullPath = storage_path('app/public/' . $cleanPath);
                    $imageData = base64_encode(file_get_contents($fullPath));
                    $imageSrc = 'data:image/jpeg;base64,' . $imageData;
                }
            }

            $pdf = Pdf::loadView('pdf.patient-archive', [
                'category'    => $request->category,
                'date'        => now()->format('m/d/Y'),
                'patient'     => $patient,
                'importImage' => $imageSrc,
                'records'     => []
            ])->setPaper('a4');

            // $fileName = "{$request->category}_" . time() . ".pdf";
            $fileName = "{$request->category}_HRN-{$patient->hrn}.pdf";
            $storagePath = "pdfs/{$fileName}";
            Storage::disk('public')->put($storagePath, $pdf->output());

            $fileRecord = PatientsRecordsFileModel::create([
                'records_id'  => $record->id,
                'file_path'   => "storage/{$storagePath}",
                'total_pages' => 1,
            ]);

            RecordsPageModel::create([
                'file_id'     => $fileRecord->id,
                'total_pages' => 1,
                'image_path'  => $importedImagePath,
                'uploaded_by' => Auth::id(),
            ]);

            DB::commit();

            return redirect()->back()->with('flash', [
                'success'  => true,
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
            'image' => 'required|image|mimes:jpeg,png,jpg|max:10240', // 10240 KB = 10MB
        ]);
        DB::beginTransaction();

        try {
            $fileRecord = PatientsRecordsFileModel::with('records.patient')->findOrFail($fileId);
            $patient = $fileRecord->records->patient;

            // 1. Handle Image Storage (Following createBlank style)
            $imageFile = $request->file('image');
            $extension = $imageFile->getClientOriginalExtension();
            $imageName = 'img_' . time() . '_' . uniqid() . '.' . $extension;

            // This returns 'pdf_image/filename.jpg'
            $pathOnDisk = $imageFile->storeAs('pdf_image', $imageName, 'public');

            // Following createBlank: path is stored as "storage/pdf_image/filename.jpg"
            $databaseImagePath = "storage/" . $pathOnDisk;

            // 2. Prepare Base64 for DomPDF rendering
            $fullPhysicalPath = storage_path('app/public/' . $pathOnDisk);
            $imageData = base64_encode(file_get_contents($fullPhysicalPath));
            $base64Image = 'data:image/' . $extension . ';base64,' . $imageData;

            // 3. Update the Page Record
            // IMPORTANT: If this still saves 'N/A', you MUST check if 'image_path' is in $fillable in the Model
            RecordsPageModel::updateOrCreate(
                ['file_id' => $fileId],
                [
                    'image_path'  => $databaseImagePath,
                    'total_pages' => 1,
                    'uploaded_by' => Auth::id()
                ]
            );

            // 4. Regenerate PDF with the NEW image
            $pdf = Pdf::loadView('pdf.patient-archive', [
                'category'    => $fileRecord->records->record_type,
                'date'        => now()->format('m/d/Y'),
                'patient'     => $patient,
                'importImage' => $base64Image,
                'records'     => []
            ])->setPaper('a4');

            // Strip 'storage/' to get the disk-relative path for writing
            $relativePdfPath = str_replace('storage/', '', $fileRecord->file_path);
            Storage::disk('public')->put($relativePdfPath, $pdf->output());

            $fileRecord->touch();

            DB::commit();

            return redirect()->back()->with('success', 'Image uploaded and PDF updated successfully.');
        } catch (\Exception $e) {
            DB::rollBack();
            if (isset($pathOnDisk)) {
                Storage::disk('public')->delete($pathOnDisk);
            }
            Log::error("uploadImage Failed: " . $e->getMessage());
            return redirect()->back()->withErrors(['error' => $e->getMessage()]);
        }
    }
}
