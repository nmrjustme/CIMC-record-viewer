<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class patientsInfo extends Model
{
    protected $table = 'patients_info';
    
    protected $fillable = [
        'patient_id', 'civil_status', 'nationality', 'birthdate', 'place_of_birth', 'religion', 'phone_number'
    ];
    
    public function address() {
        return $this->hasOne(patientsAddress::class, 'patient_info_id');
    }
}