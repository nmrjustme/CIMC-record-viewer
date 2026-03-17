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
    protected $nationalities = [
        'Afghan',
        'Albanian',
        'Algerian',
        'American',
        'Andorran',
        'Angolan',
        'Antiguan',
        'Argentine',
        'Armenian',
        'Australian',
        'Austrian',
        'Azerbaijani',
        'Bahamian',
        'Bahraini',
        'Bangladeshi',
        'Barbadian',
        'Belarusian',
        'Belgian',
        'Belizean',
        'Beninese',
        'Bhutanese',
        'Bolivian',
        'Bosnian',
        'Brazilian',
        'British',
        'Bruneian',
        'Bulgarian',
        'Burkinese',
        'Burundian',
        'Cambodian',
        'Cameroonian',
        'Canadian',
        'Cape Verdean',
        'Central African',
        'Chadian',
        'Chilean',
        'Chinese',
        'Colombian',
        'Comoran',
        'Congolese',
        'Costa Rican',
        'Croatian',
        'Cuban',
        'Cypriot',
        'Czech',
        'Danish',
        'Djiboutian',
        'Dominican',
        'Dutch',
        'East Timorese',
        'Ecuadorean',
        'Egyptian',
        'Emirati',
        'Equatorial Guinean',
        'Eritrean',
        'Estonian',
        'Ethiopian',
        'Fijian',
        'Filipino',
        'Finnish',
        'French',
        'Gabonese',
        'Gambian',
        'Georgian',
        'German',
        'Ghanaian',
        'Greek',
        'Grenadian',
        'Guatemalan',
        'Guinean',
        'Guyanese',
        'Haitian',
        'Honduran',
        'Hungarian',
        'Icelandic',
        'Indian',
        'Indonesian',
        'Iranian',
        'Iraqi',
        'Irish',
        'Israeli',
        'Italian',
        'Ivory Coast',
        'Jamaican',
        'Japanese',
        'Jordanian',
        'Kazakhstani',
        'Kenyan',
        'Kiribati',
        'Kuwaiti',
        'Kyrgyz',
        'Laotian',
        'Latvian',
        'Lebanese',
        'Lesothan',
        'Liberian',
        'Libyan',
        'Liechtensteiner',
        'Lithuanian',
        'Luxembourger',
        'Macedonian',
        'Malagasy',
        'Malawian',
        'Malaysian',
        'Maldivian',
        'Malian',
        'Maltese',
        'Marshallese',
        'Mauritanian',
        'Mauritian',
        'Mexican',
        'Micronesian',
        'Moldovan',
        'Monacan',
        'Mongolian',
        'Montenegrin',
        'Moroccan',
        'Mozambican',
        'Namibian',
        'Nauruan',
        'Nepalese',
        'New Zealander',
        'Nicaraguan',
        'Nigerian',
        'Nigerien',
        'North Korean',
        'Norwegian',
        'Omani',
        'Pakistani',
        'Palauan',
        'Panamanian',
        'Papua New Guinean',
        'Paraguayan',
        'Peruvian',
        'Polish',
        'Portuguese',
        'Qatari',
        'Romanian',
        'Russian',
        'Rwandan',
        'Saint Lucian',
        'Salvadoran',
        'Samoan',
        'San Marinese',
        'Sao Tomean',
        'Saudi Arabian',
        'Senegalese',
        'Serbian',
        'Seychellois',
        'Sierra Leonean',
        'Singaporean',
        'Slovak',
        'Slovenian',
        'Solomon Islander',
        'Somali',
        'South African',
        'South Korean',
        'Spanish',
        'Sri Lankan',
        'Sudanese',
        'Surinamese',
        'Swazi',
        'Swedish',
        'Swiss',
        'Syrian',
        'Taiwanese',
        'Tajik',
        'Tanzanian',
        'Thai',
        'Togolese',
        'Tongan',
        'Trinidadian',
        'Tunisian',
        'Turkish',
        'Turkmen',
        'Tuvaluan',
        'Ugandan',
        'Ukrainian',
        'Uruguayan',
        'Uzbekistani',
        'Vanuatuan',
        'Vatican City',
        'Venezuelan',
        'Vietnamese',
        'Yemeni',
        'Zambian',
        'Zimbabwean'
    ];

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
            'patients' => $query->latest()->paginate(5)->withQueryString(),
            'filters' => $request->only(['first', 'last', 'mid', 'hrn']),
            'currentUser' => [
                'id' => Auth::id(),
                'role' => Auth::user()->role, // Make sure your users table has a 'role' column
            ],
        ]);
    }

    public function getFiles($hrn)
    {
        $patient = patients::with(['information.address'])
            ->where('hrn', $hrn)
            ->firstOrFail();

        // Paginate the records relationship
        $paginatedRecords = $patient->records()
            ->latest()
            ->paginate(10); // Adjust number per page as needed

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
            'records' => $paginatedRecords
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
