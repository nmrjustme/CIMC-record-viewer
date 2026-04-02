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
                'created_by'  => Auth::id(),
            ]);

            // --- FIXED: Do not look for existing images here ---
            $imageSrc = null;
            $importedImagePath = 'N/A';

            // Generate PDF
            $pdf = Pdf::loadView('pdf.patient-archive', [
                'category'    => $request->category,
                'date'        => now()->format('m/d/Y'),
                'patient'     => $patient,
                'importImage' => $imageSrc, // Will be null
                'records'     => []
            ])->setPaper('a4');

            $fileName = "{$request->category}_HRN-{$patient->hrn}_" . time() . ".pdf";
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
                'image_path'  => $importedImagePath, // Will be 'N/A'
                'uploaded_by' => Auth::id(),
            ]);

            DB::commit();

            return redirect()->back()->with('flash', [
                'success'  => true,
                'message'  => "{$request->category} created successfully.",
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
        $request->validate([
            'image' => 'required|image|mimes:jpeg,png,jpg|max:10240',
        ]);

        DB::beginTransaction();

        try {
            $fileRecord = PatientsRecordsFileModel::with('records.patient')->findOrFail($fileId);
            $patient = $fileRecord->records->patient;

            // 1. Handle Image Storage
            $imageFile = $request->file('image');
            $extension = $imageFile->getClientOriginalExtension();
            $imageName = 'img_' . time() . '_' . uniqid() . '.' . $extension;
            $pathOnDisk = $imageFile->storeAs('pdf_image', $imageName, 'public');
            $databaseImagePath = "storage/" . $pathOnDisk;

            // 2. Create a NEW Page Record (Don't updateOrCreate, just create to append)
            RecordsPageModel::create([
                'file_id'    => $fileId,
                'image_path' => $databaseImagePath,
                'total_pages' => 1,
                'uploaded_by' => Auth::id()
            ]);

            // 3. Fetch ALL images for this file to render them in order
            $allPages = RecordsPageModel::where('file_id', $fileId)
                ->orderBy('created_at', 'desc')
                ->get();

            $base64Images = [];
            foreach ($allPages as $page) {
                // Strip 'storage/' to find the file in the actual storage/app/public folder
                $diskPath = str_replace('storage/', '', $page->image_path);
                $fullPath = storage_path('app/public/' . $diskPath);


                if (file_exists($fullPath)) {
                    $imageData = base64_encode(file_get_contents($fullPath));
                    $mime = mime_content_type($fullPath);
                    $base64Images[] = 'data:' . $mime . ';base64,' . $imageData;
                }
            }

            // 4. Regenerate PDF with the ARRAY of images
            $pdf = Pdf::loadView('pdf.patient-archive', [
                'category'     => $fileRecord->records->record_type,
                'date'         => now()->format('m/d/Y'),
                'patient'      => $patient,
                'importImages' => $base64Images,
                'records'      => []
            ])->setPaper('a4');

            // 5. Update the actual PDF file on disk
            $relativePdfPath = str_replace('storage/', '', $fileRecord->file_path);
            Storage::disk('public')->put($relativePdfPath, $pdf->output());

            $fileRecord->touch(); // Update the timestamp to reflect the new PDF version

            DB::commit();
            return redirect()->back()->with('success', 'Image appended and PDF updated successfully.');
        } catch (\Exception $e) {
            DB::rollBack();
            if (isset($pathOnDisk)) {
                Storage::disk('public')->delete($pathOnDisk);
            }
            Log::error("uploadImage Append Failed: " . $e->getMessage());
            return redirect()->back()->withErrors(['error' => $e->getMessage()]);
        }
    }
}
