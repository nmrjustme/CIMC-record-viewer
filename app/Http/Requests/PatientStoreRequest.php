<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class PatientStoreRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()->role === 'admin';
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            // patients table
            'firstname'      => 'required|string|max:50',
            'lastname'       => 'required|string|max:50',
            'middlename'     => 'nullable|string|max:50',
            'hrn'            => ['required', 'string', Rule::unique('patients', 'hrn')],

            // patients_info table
            'sex'            => 'required|in:Male,Female',
            'civil_status'   => 'required|string|max:20',
            'nationality'    => 'required|string|max:50',
            'birthdate'      => 'required|date',
            'place_of_birth' => 'required|string|max:255',
            'phone_number'   => 'nullable|string|max:20',
            'religion'       => 'nullable|string|max:255',

            // patient_address table
            'street'         => 'required|string|max:100',
            'barangay'       => 'required|string|max:100',
            'municipality'   => 'required|string|max:100',
            'province'       => 'required|string|max:100',
        ];
    }
}
