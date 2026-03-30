<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class patientsRecord extends Model
{
    protected $table = 'patients_records';

    protected $fillable = [
        'patients_id',
        'record_type',
        'description',
        'created_by'
    ];

    public function file()
    {
        return $this->hasMany(PatientsRecordsFileModel::class, 'records_id');
    }

    public function patients()
    {
        return $this->BelongsTo(patients::class, 'patients_id');
    }

    // In patientsRecord.php
    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function patient(): BelongsTo
    {
        // 'patients_id' is the foreign key in your table
        return $this->belongsTo(patients::class, 'patients_id');
    }
}
