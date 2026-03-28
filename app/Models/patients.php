<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class patients extends Model
{
    protected $table = 'patients';
    protected $fillable = [
        'hrn', 'firstname', 'middlename', 'lastname', 'created_by'
    ];
    
    public function records() {
        return $this->hasMany(patientsRecord::class, 'patients_id');
    }

    public function information() {
        return $this->hasOne(patientsInfo::class, 'patient_id');
    }

    public function hrns()
    {
        return $this->hasMany(PatientHRN::class, 'patient_id');
    }

}
