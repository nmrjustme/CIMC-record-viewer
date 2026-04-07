<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class patients extends Model
{
    protected $table = 'patients';
    protected $fillable = [
        'hrn',
        'firstname',
        'middlename',
        'lastname',
        'created_by'
    ];

    public function records()
    {
        return $this->hasMany(patientsRecord::class, 'patients_id');
    }

    public function information()
    {
        return $this->hasOne(patientsInfo::class, 'patient_id');
    }
    
    public function hrns()
    {
        return $this->hasMany(PatientHRN::class, 'patient_id');
    }
    
    public function scopeFilter($query, array $filters)
    {
        $query->when($filters['first'] ?? null, fn($q, $f) => $q->where('firstname', 'like', "%{$f}%"))
            ->when($filters['last'] ?? null,  fn($q, $l) => $q->where('lastname', 'like', "%{$l}%"))
            ->when($filters['mid'] ?? null,   fn($q, $m) => $q->where('middlename', 'like', "%{$m}%"))
            ->when($filters['hrn'] ?? null, function ($q, $h) {
                $q->where('hrn', 'like', "%{$h}%")
                    ->orWhereHas('hrns', fn($sub) => $sub->where('hrn', 'like', "%{$h}%"));
            })
            ->when($filters['search'] ?? null, function ($q, $s) {
                $q->where(fn($sub) => $sub->where('lastname', 'like', "%{$s}%")
                    ->orWhere('firstname', 'like', "%{$s}%")
                    ->orWhere('hrn', 'like', "%{$s}%"));
            });
    }
}
