<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\patients;
use App\Models\patientsRecord;

class patientsController extends Controller
{
    public function index(Request $request)
    {
        $query = patients::with('records');

        $query->when($request->first, fn($q, $v) => $q->where('firstname', 'like', "%$v%"))
            ->when($request->last, fn($q, $v) => $q->where('lastname', 'like', "%$v%"))
            ->when($request->mid, fn($q, $v) => $q->where('middlename', 'like', "%$v%"))
            ->when($request->hrn, fn($q, $v) => $q->where('hrn', 'like', "%$v%"));

        return Inertia::render('clientsList', [
            // Ensuring an empty array is sent if no data exists to prevent .map() errors
            'patients' => $query->latest()->get() ?? [],
            'filters' => $request->only(['first', 'last', 'mid', 'hrn']),
        ]);
    }

    public function getFiles($hrn)
    {
        // Note the plural 'records.files'
        $patient = patients::with(['records.file'])
            ->where('hrn', $hrn)
            ->firstOrFail();
        
        $patient->records->transform(function ($record) {
            // Get the first file from the collection
            $firstFile = $record->file->first();
            
            return [
                'id' => $record->id,
                'file_name' => $record->record_type ?? 'Unnamed File',
                'updated_at' => $record->updated_at,
                'created_at' => $record->created_at,
                // Access the first file's path
                'pdf_url' => $firstFile ? asset($firstFile->file_path) : null,
                // Optional: count how many files are in this record
                'file_count' => $record->file->count(),
            ];
        });

        return Inertia::render('PatientFolder', [
            'patient' => $patient
        ]);
    }
}
