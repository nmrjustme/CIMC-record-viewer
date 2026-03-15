<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\patients;
use App\Models\patientsRecord;
use Illuminate\Support\Facades\Auth;

class patientsController extends Controller
{
    public function index(Request $request)
    {
        $query = patients::withCount(['records', 'records as records_count' => function ($query) {
            $query->withCount('file');
        }]);

        $query->when($request->first, fn($q, $v) => $q->where('firstname', 'like', "%$v%"))
            ->when($request->last, fn($q, $v) => $q->where('lastname', 'like', "%$v%"))
            ->when($request->mid, fn($q, $v) => $q->where('middlename', 'like', "%$v%"))
            ->when($request->hrn, fn($q, $v) => $q->where('hrn', 'like', "%$v%"));

        return Inertia::render('clientsList', [
            // Ensuring an empty array is sent if no data exists to prevent .map() errors
            'patients' => $query->latest()->get() ?? [],
            'filters' => $request->only(['first', 'last', 'mid', 'hrn']),
            'currentUser' => [
                'id' => Auth::id(),
                'role' => Auth::user()->role, // Make sure your users table has a 'role' column
            ],
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

    // Show create patient form
    public function create()
    {
        $patients = patients::withCount('records')->latest()->get(); // fetch patients

        return Inertia::render('admin/addPatient', [
            'patients' => $patients,
            'flash' => [
                'success' => session('success')
            ],
        ]);
    }

    // Store new patient
    public function store(Request $request)
    {
        $validated = $request->validate([
            'firstname' => 'required|string|max:50',
            'lastname' => 'required|string|max:50',
            'middlename' => 'nullable|string|max:50',
            'hrn' => 'required|string|unique:patients,hrn', // if you use HRN as unique identifier
        ]);

        // Add created_by automatically
        $validated['created_by'] = Auth::id();

        patients::create($validated);

        return redirect()->route('patients.create')->with('success', 'Patient added successfully!');
    }

}
