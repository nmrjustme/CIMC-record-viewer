<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class PatientStoreRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->role === 'admin' || $this->user()->role === 'staff';
    }

    public function rules(): array
    {
        // If we are just adding an HRN, we only care about these two fields
        if ($this->has('hrns') && !$this->has('firstname')) {
            return [
                'patient_id' => 'required|exists:patients,id',
                'hrns'       => 'required|string|size:15', // Exact 15 digits
            ];
        }
        
        // Full Patient Creation Rules
        return [
            'firstname'      => 'required|string|max:50',
            'lastname'       => 'required|string|max:50',
            'middlename'     => 'nullable|string|max:50',
            'hrn'            => ['required', 'string', Rule::unique('patients', 'hrn')],
            'sex'            => 'required|in:Male,Female',
            'civil_status'   => 'required|string|max:20',
            'nationality'    => 'required|string|max:50',
            'birthdate'      => 'required|string|max:50',
            'place_of_birth' => 'required|string|max:255',
            'phone_number'   => 'nullable|string|max:20',
            'religion'       => 'nullable|string|max:255',
            'street'         => 'required|string|max:100',
            'barangay'       => 'required|string|max:100',
            'municipality'   => 'required|string|max:100',
            'province'       => 'required|string|max:100',
        ];
    }
}