<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Dompdf\Dompdf;
use Illuminate\Support\Facades\Storage;
use App\Models\PatientsRecord; // <-- make sure you have this model
use Illuminate\Support\Facades\Auth;

class PdfController extends Controller
{
    /**
     * Create a blank PDF file and store record
     */
    public function createBlankPdf(Request $request)
    {
        $category = $request->input('category', 'LABORATORY'); // default category
        $patientId = $request->input('patient_id'); // must be sent from frontend
        $description = $request->input('description', ''); // optional description
        $filename = strtoupper($category) . '_' . time() . '.pdf';

        // --- 1. Generate PDF ---
        $dompdf = new Dompdf();
        $html = '<html><body></body></html>'; // blank PDF
        $dompdf->loadHtml($html);
        $dompdf->setPaper('A4', 'portrait');
        $dompdf->render();
        $output = $dompdf->output();

        // --- 2. Save PDF to public disk ---
        $path = 'pdfs/' . $filename;
        Storage::disk('public')->put($path, $output);

        // Get the public URL
        $publicUrl = Storage::disk('public')->url($path);

        // --- 3. Store record in patients_records ---
        if ($patientId) {
            PatientsRecord::create([
                'patients_id' => $patientId,
                'record_type' => strtoupper($category),
                'description' => $description,
                'created_by' => Auth::id(), // logged in user
                'pdf_url' => $publicUrl,
            ]);
        }

        return response()->json([
            'success' => true,
            'file_name' => $filename,
            'path' => $publicUrl,
        ]);
    }
}
