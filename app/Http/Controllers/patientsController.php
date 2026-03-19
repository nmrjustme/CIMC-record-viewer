<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\patients;
use App\Models\patientsRecord;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;
use App\Models\patientsInfo;
use App\Models\patientsAddress;
use Illuminate\Support\Facades\DB;

class patientsController extends Controller
{

    public function index(Request $request)
    {
        // 1. Build the base query
        $query = patients::query()
            ->withCount('records');
        $query->when($request->filled('first'), fn($q) => $q->where('firstname', 'like', "%{$request->first}%"))
            ->when($request->filled('last'), fn($q) => $q->where('lastname', 'like', "%{$request->last}%"))
            ->when($request->filled('mid'), fn($q) => $q->where('middlename', 'like', "%{$request->mid}%"))
            ->when($request->filled('hrn'), fn($q) => $q->where('hrn', 'like', "%{$request->hrn}%"));


        $patients = $query->latest()->paginate(5)->withQueryString();

        return Inertia::render('clientsList', [
            'patients' => $patients,
            'filters' => $request->only(['first', 'last', 'mid', 'hrn']),
            'currentUser' => [
                'id' => Auth::id(),
                'role' => Auth::user()->role,
            ],

        ]);
    }

    public function initFolder(Request $request)
    {
        session(['active_hrn' => $request->hrn]);

        // Capture the source from the request, default to 'search'
        $source = $request->input('from', 'search');
        session(['folder_source' => $source]);

        return redirect()->route('patients.folder');
    }

    public function getFiles(Request $request)
    {
        $hrn = $request->input('hrn') ?? session('active_hrn');

        // Retrieve the source we saved in initFolder
        $fromPage = session('folder_source', 'search');

        if (!$hrn) {
            return redirect()->route('patients.index')
                ->with('error', 'Patient record not found or session expired.');
        }

        $patient = patients::with(['information.address'])
            ->where('hrn', $hrn)
            ->firstOrFail();

        $paginatedRecords = $patient->records()
            ->latest()
            ->paginate(10);

        $paginatedRecords->getCollection()->transform(function ($record) {
            $firstFile = $record->file->first();
            return [
                'id' => $record->id,
                'file_name' => $record->record_type ?? 'Unnamed File',
                'updated_at' => $record->updated_at,
                'created_at' => $record->created_at,
                'pdf_url' => $firstFile ? asset($firstFile->file_path) : null,
                'file_count' => $record->file->count(),
            ];
        });

        return Inertia::render('PatientFolder', [
            'patient' => $patient,
            'records' => $paginatedRecords,
            'fromPage' => $fromPage // Pass it here!
        ]);
    }

    // Show create patient form
    public function create(Request $request)
    {
        $query = patients::query()->withCount('records');

        // Add search functionality
        if ($request->has('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('lastname', 'like', "%{$search}%")
                    ->orWhere('firstname', 'like', "%{$search}%")
                    ->orWhere('hrn', 'like', "%{$search}%");
            });
        }

        $patients = $query->latest()->paginate(5)->withQueryString();

        return Inertia::render('admin/addPatient', [
            'patients' => $patients,
            'filters' => $request->only(['search']), // Pass the search value back to the frontend
            'nationalities' => ['Filipino', 'American', 'Chinese', 'Japanese', 'Others'], // Example data
            'flash' => [
                'success' => session('success')
            ],
        ]);
    }

    // Store new patient
    public function store(Request $request)
    {
        $validated = $request->validate([
            // patients table
            'firstname' => 'required|string|max:50',
            'lastname' => 'required|string|max:50',
            'middlename' => 'nullable|string|max:50',
            'hrn' => 'required|string|unique:patients,hrn',

            // patients_info table
            'sex' => 'required|in:Male,Female',
            'civil_status' => 'required|string|max:20',
            'nationality' => 'required|string|max:50',
            'birthdate' => 'required|date',
            'place_of_birth' => 'required|string|max:255',
            'phone_number' => 'nullable|string|max:20',
            'religion' => 'nullable|string|max:255',

            // patient_address table
            'street' => 'required|string|max:100',
            'barangay' => 'required|string|max:100',
            'municipality' => 'required|string|max:100',
            'province' => 'required|string|max:100',
        ]);

        DB::transaction(function () use ($validated) {
            // 1. Create Patient
            $patient = patients::create([
                'hrn' => $validated['hrn'],
                'firstname' => $validated['firstname'],
                'middlename' => $validated['middlename'],
                'lastname' => $validated['lastname'],
                'created_by' => Auth::id(),
            ]);

            // 2. Create Patient Info
            $info = patientsInfo::create([
                'patient_id' => $patient->id,
                'sex' => $validated['sex'],
                'civil_status' => $validated['civil_status'],
                'nationality' => $validated['nationality'],
                'birthdate' => $validated['birthdate'],
                'place_of_birth' => $validated['place_of_birth'],
                'phone_number' => $validated['phone_number'],
                'religion' => $validated['religion'],
            ]);

            // 3. Create Patient Address
            patientsAddress::create([
                'patient_info_id' => $info->id,
                'street' => $validated['street'],
                'barangay' => $validated['barangay'],
                'municipality' => $validated['municipality'],
                'province' => $validated['province'],
            ]);
        });

        return redirect()->route('patients.create')->with('success', 'Patient record created across all tables.');
    }
}
