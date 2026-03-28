<?php

namespace App\Http\Controllers;

use App\Http\Requests\PatientStoreRequest;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\patients;
use App\Models\patientsRecord;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;
use App\Models\patientsInfo;
use App\Models\patientsAddress;
use Illuminate\Support\Facades\DB;
use App\Traits\Loggable;
use App\Models\PatientHRN;

class patientsController extends Controller
{
    use Loggable;
    private $paginate_number;

    public function __construct()
    {
        $this->paginate_number = 10; // Default pagination number
    }

    public function index(Request $request)
    {
        // 1. Build the base query
        $query = patients::query()
            ->withCount('records')
            ->with('hrns'); // Eager load HRNs for display

        $query->when($request->filled('first'), fn($q) => $q->where('firstname', 'like', "%{$request->first}%"))
            ->when($request->filled('last'), fn($q) => $q->where('lastname', 'like', "%{$request->last}%"))
            ->when($request->filled('mid'), fn($q) => $q->where('middlename', 'like', "%{$request->mid}%"))
            ->when($request->filled('hrn'), function ($q) use ($request) {
                // Search in both the main table and the related hrns table
                $q->where('hrn', 'like', "%{$request->hrn}%")
                    ->orWhereHas('hrns', fn($sub) => $sub->where('hrn', 'like', "%{$request->hrn}%"));
            });

        // if ($request->anyFilled(['first', 'last', 'mid', 'hrn'])) {
        //     $details = array_filter($request->only(['first', 'last', 'mid', 'hrn']));
        //     $this->logActivity('SEARCH', "Searched patients with criteria: " . json_encode($details), 'Patients');
        // }

        $patients = $query->orderBy('created_at', 'desc')->paginate($this->paginate_number)->withQueryString();

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

        $patient = patients::with(['information.address', 'hrns'])
            ->where('hrn', $hrn)
            ->firstOrFail();

        if ($patient) {
            $this->logActivity('VIEW', "Accessed folder for patient: {$patient->firstname} {$patient->lastname} (HRN: {$hrn})", 'Patient Records');
        }

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
        $query = patients::query()->withCount('records')->with('hrns');

        // Add search functionality
        if ($request->has('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('lastname', 'like', "%{$search}%")
                    ->orWhere('firstname', 'like', "%{$search}%")
                    ->orWhere('hrn', 'like', "%{$search}%");
            });
        }

        $patients = $query->latest()->paginate($this->paginate_number)->withQueryString();

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
    public function store(PatientStoreRequest $request)
    {
        $validated = $request->validated();

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

        $this->logActivity(
            'CREATE',
            "Registered new patient: {$validated['firstname']} {$validated['lastname']} (HRN: {$validated['hrn']})",
            'Patient Management'
        );

        return redirect()->route('patients.create')->with('success', 'Patient record created across all tables.');
    }

    public function addHRN(PatientStoreRequest $request)
    {
        $validated = $request->validated();
        
        // Create the HRN and manually handle the search index
        $hrn = PatientHRN::create([
            'patient_id' => $validated['patient_id'],
            'hrn'        => $validated['hrns'], // Encrypted by Model Cast
            // 'hrn_index'  => hash_hmac('sha256', $validated['hrn'], config('app.key')), // Searchable Hash
            'is_primary' => false,
        ]);
        
        $this->logActivity(
            'CREATE',
            "Added new HRN ({$validated['hrns']}) to patient ID {$validated['patient_id']}",
            'Patient HRN'
        );
        
        return back()->with('success', 'New HRN added successfully.');
    }
}
