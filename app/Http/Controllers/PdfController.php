<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Dompdf\Dompdf;
use Illuminate\Support\Facades\Storage;
use App\Models\PatientsRecord;
use Illuminate\Support\Facades\Auth;
use App\Models\Patient;
use App\Models\PatientHrn;

class PdfController extends Controller
{
    /**
     * Create a blank PDF file and store record
     */
    public function createBlankPdf(Request $request)
    {
        $category = $request->input('category', 'LABORATORY');
        $patientId = $request->input('patient_id');
        $description = $request->input('description', '');

        // --- 1. Get Patient ---
        $patient = Patient::find($patientId);

        if (!$patient) {
            return response()->json([
                'success' => false,
                'message' => 'Patient not found'
            ], 404);
        }

        // --- 2. Get HRN from patient_hrns table ---
        $hrnRecord = PatientHrn::where('patient_id', $patientId)->first();

        if (!$hrnRecord) {
            return response()->json([
                'success' => false,
                'message' => 'HRN not found for this patient'
            ], 404);
        }

        $hrn = $hrnRecord->hrn;

        // --- 3. Generate filename (SAFE & UNIQUE) ---
        $filename = strtoupper($category) . '_HRN-' . $hrn . '_' . time() . '.pdf';

        // --- 4. Generate PDF ---
        $dompdf = new Dompdf();
        $html = '<html><body></body></html>'; // blank PDF
        $dompdf->loadHtml($html);
        $dompdf->setPaper('A4', 'portrait');
        $dompdf->render();
        $output = $dompdf->output();

        // --- 5. Save PDF ---
        $path = 'pdfs/' . $filename;
        Storage::disk('public')->put($path, $output);

        $publicUrl = Storage::disk('public')->url($path);

        // --- 6. Store record ---
        PatientsRecord::create([
            'patients_id' => $patientId,
            'record_type' => strtoupper($category),
            'description' => $description,
            'created_by' => Auth::id(),
            'pdf_url' => $publicUrl,
        ]);

        return response()->json([
            'success' => true,
            'file_name' => $filename,
            'path' => $publicUrl,
        ]);
    }
}
