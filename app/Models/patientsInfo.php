<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class patientsInfo extends Model
{
    protected $table = 'patients_info';

    protected $fillable = [
        'patient_id', 'sex', 'civil_status', 'nationality', 'birthdate', 'place_of_birth', 'religion', 'phone_number'
    ];

    // protected function casts(): array
    // {
    //     return [
    //         'civil_status' => 'encrypted',
    //         'nationality' => 'encrypted',
    //         'birthdate' => 'encrypted',
    //         'place_of_birth' => 'encrypted',
    //         'religion' => 'encrypted',
    //         'phone_number' => 'encrypted',
    //     ];
    // }

    public function address() {
        return $this->hasOne(patientsAddress::class, 'patient_info_id');
    }
}
