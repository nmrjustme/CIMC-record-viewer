<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RecordsPageModel extends Model
{
    protected $table = 'record_pages';
    
    protected $fillable = [
        'file_id',
        'total_pages',
        'image_path',
        'uploaded_by'
    ];

    public function files()
    {
        return $this->belongsTo(PatientsRecordsFileModel::class, 'file_id', 'id');
    }
}
