<?php

namespace App\Http\Controllers;

use App\Http\Requests\PatientStoreRequest;
use App\Http\Resources\PatientRecordResource;
use App\Models\patients; // Changed to Singular

use App\Models\PatientHRN;
use App\Traits\Loggable;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class PatientsController extends Controller
{
    use Loggable;

    private int $paginate_number = 10;

    public function index(Request $request)
    {
        $patients = patients::query()
            ->withCount('records')
            ->with('hrns')
            ->filter($request->only(['first', 'last', 'mid', 'hrn'])) // Using Scope
            ->orderBy('created_at', 'desc')
            ->paginate($this->paginate_number)
            ->withQueryString();

        return Inertia::render('clientsList', [
            'patients' => $patients,
            'filters'  => $request->only(['first', 'last', 'mid', 'hrn']),
            'currentUser' => [
                'id'   => Auth::id(),
                'role' => Auth::user()->role,
            ],
        ]);
    }

    public function initFolder(Request $request)
    {
        session([
            'active_hrn'    => $request->hrn,
            'folder_source' => $request->input('from', 'search')
        ]);

        return redirect()->route('patients.folder');
    }

    public function getFiles(Request $request)
    {
        $hrn = $request->input('hrn') ?? session('active_hrn');

        if (!$hrn) {
            return redirect()->route('patients.index')
                ->with('error', 'Patient record not found or session expired.');
        }

        // Eager load everything needed for the view to avoid N+1
        $patient = patients::with(['information.address', 'hrns'])
            ->where('hrn', $hrn)
            ->firstOrFail();

        $this->logActivity('VIEW', "Accessed folder for: {$patient->firstname} {$patient->lastname}", 'Patient Records');
        
        $records = $patient->records()
            ->with('file') // Eager load files for the Resource
            ->latest()
            ->paginate(10);

        return Inertia::render('PatientFolder', [
            'patient'  => $patient,
            'records'  => PatientRecordResource::collection($records), // Clean transformation
            'fromPage' => session('folder_source', 'search')
        ]);
    }

    public function create(Request $request)
    {
        $patients = patients::query()
            ->withCount('records')
            ->with('hrns')
            ->filter($request->only(['search'])) // Reusing the Scope
            ->latest()
            ->paginate($this->paginate_number)
            ->withQueryString();

        return Inertia::render('admin/addPatient', [
            'patients'      => $patients,
            'filters'       => $request->only(['search']),
            'nationalities' => ['Filipino', 'American', 'Chinese', 'Japanese', 'Others'],
            'flash'         => ['success' => session('success')],
        ]);
    }

    public function store(PatientStoreRequest $request)
    {
        $validated = $request->validated();

        $patient = DB::transaction(function () use ($validated) {
            $patient = patients::create([
                'hrn'        => $validated['hrn'],
                'firstname'  => $validated['firstname'],
                'middlename' => $validated['middlename'],
                'lastname'   => $validated['lastname'],
                'created_by' => Auth::id(),
            ]);

            $info = $patient->information()->create([ // Using relationship
                'sex'            => $validated['sex'],
                'civil_status'   => $validated['civil_status'],
                'nationality'    => $validated['nationality'],
                'birthdate'      => $validated['birthdate'],
                'place_of_birth' => $validated['place_of_birth'],
                'phone_number'   => $validated['phone_number'],
                'religion'       => $validated['religion'],
            ]);

            $info->address()->create([ // Using relationship chain
                'street'       => $validated['street'],
                'barangay'     => $validated['barangay'],
                'municipality' => $validated['municipality'],
                'province'     => $validated['province'],
            ]);
            
            return $patient;
        });

        $this->logActivity('CREATE', "Registered patient: {$patient->fullname}", 'Patient Management');

        return redirect()->route('patients.create')->with('success', 'Patient record created.');
    }

    public function addHRN(PatientStoreRequest $request)
    {
        $validated = $request->validated();

        PatientHRN::create([
            'patient_id' => $validated['patient_id'],
            'hrn'        => $validated['hrns'],
            'is_primary' => false,
        ]);

        $this->logActivity('CREATE', "Added HRN to ID {$validated['patient_id']}", 'Patient HRN');

        return back()->with('success', 'New HRN added successfully.');
    }
}
