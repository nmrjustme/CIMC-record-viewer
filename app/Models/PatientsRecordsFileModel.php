<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PatientsRecordsFileModel extends Model
{
    protected $table = 'patients_records_file';
    
    protected $fillable = [
        'records_id',
        'file_name',
        'file_path',
        'total_pages'
    ];

    public function records()
    {
        return $this->BelongsTo(patientsRecord::class, 'records_id', 'id');
    }

    public function pages()
    {
        return $this->BelongsTo(RecordsPageModel::class, 'file_id');
    }

}
