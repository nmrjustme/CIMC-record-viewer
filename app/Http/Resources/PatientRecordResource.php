<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class PatientRecordResource extends JsonResource
{
      public function toArray($request)
      {
            $firstFile = $this->file->first();
            return [
                  'id'         => $this->id,
                  'file_name'  => $this->record_type ?? 'Unnamed File',
                  'updated_at' => $this->updated_at,
                  'created_at' => $this->created_at,
                  'pdf_url'    => $firstFile ? asset($firstFile->file_path) : null,
                  'file_count' => $this->file->count(),
            ];
      }
}
