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

        $patient = patients::with(['information.address', 'hrns'])
            ->where('hrn', $hrn)
            ->firstOrFail();

        // $this->logActivity('VIEW', "Accessed folder for: {$patient->firstname} {$patient->lastname}", 'Patient Records');

        // We eager load 'file' and its nested 'pages' (dbo.record_pages)
        $records = $patient->records()
            ->with(['file.pages'])
            ->latest()
            ->paginate(50);

        // dd($records->toArray());

        return Inertia::render('PatientFolder', [
            'patient'  => $patient,
            // Ensure the Resource can handle the nested 'pages'
            'records'  => PatientRecordResource::collection($records),
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
    
    public function update_hrns(Request $request, $id)
    {
        $request->validate([
            'hrn' => 'required|digits:15|unique:patient_hrns,hrn,' . $id,
        ]);
        
        $hrn = PatientHRN::with('patient')->findOrFail($id);
        $oldHrn = $hrn->hrn;
        $hrn->update([
            'hrn' => $request->hrn,
        ]);
        
        $this->logActivity(
            'UPDATE',
            "Updated secondary HRN from {$oldHrn} to {$request->hrn} (Name: {$hrn->patient->lastname} {$hrn->patient->firstname})",
            'Patient HRN'
        );
        
        return back()->with('success', 'HRN updated successfully.');
    }
    
    public function update_primary(Request $request, $id)
    {
        $patient = patients::findOrFail($id);

        $request->validate([
            'hrn' => 'required|string|max:15|unique:patients,hrn,' . $patient->id,
        ]);
        $oldHrn = $patient->hrn;

        $newHrn = $request->hrn;

        $patient->update([
            'hrn' => $newHrn
        ]);

        $this->logActivity(
            'UPDATE',
            "Updated primary HRN for {$patient->lastname} {$patient->firstname} from {$oldHrn} to {$newHrn}",
            'Patient Management'
        );

        session(['active_hrn' => $newHrn]);

        return back()->with('message', 'Primary HRN updated successfully.');
    }
    
    public function update(PatientStoreRequest $request, $id)
    {
        $validated = $request->validated();
        $patient = patients::findOrFail($id);
        
        DB::transaction(function () use ($validated, $patient) {
            // 1. Update Basic Info
            $patient->update([
                'firstname'  => $validated['firstname'],
                'middlename' => $validated['middlename'],
                'lastname'   => $validated['lastname'],
            ]);
            
            // 2. Update Information
            $patient->information()->update([
                'sex'            => $validated['sex'],
                'civil_status'   => $validated['civil_status'],
                'nationality'    => $validated['nationality'],
                'birthdate'      => $validated['birthdate'],
                'place_of_birth' => $validated['place_of_birth'],
                'phone_number'   => $validated['phone_number'],
                'religion'       => $validated['religion'],
            ]);

            // 3. Update Address
            $patient->information->address()->update([
                'street'       => $validated['street'],
                'barangay'     => $validated['barangay'],
                'municipality' => $validated['municipality'],
                'province'     => $validated['province'],
            ]);
        });

        $this->logActivity('UPDATE', "Updated details for: {$patient->lastname}, {$patient->firstname}", 'Patient Management');

        return back()->with('success', 'Patient information updated successfully.');
    }
}
