<?php


namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PatientHRN extends Model
{
    protected $table = 'patient_hrns';
    
    protected $fillable = [
        'patient_id',
        'hrn',
        'is_primary'
    ];

    public function patient()
    {
        return $this->belongsTo(patients::class, 'patient_id');
    }
}
