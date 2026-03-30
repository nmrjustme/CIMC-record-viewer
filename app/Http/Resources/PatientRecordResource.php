<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class PatientRecordResource extends JsonResource
{
      public function toArray($request)
      {
            // Get the first file record from the relationship
            $firstFile = $this->file->first();

            return [
                  'id'           => $this->id,
                  'file_name'    => $this->record_type ?? 'Unnamed File',
                  'updated_at'   => $this->updated_at,
                  'created_at'   => $this->created_at,
                  'pdf_url'      => $firstFile ? asset($firstFile->file_path) : null,
                  'file_count'   => $this->file->count(),

                  /* |--------------------------------------------------------------------------
            | Record Pages (Images)
            |--------------------------------------------------------------------------
            | We map the 'pages' relationship from the first file. 
            | We use asset() to ensure the React frontend gets a full URL.
            */
                  'pages' => ($firstFile && $firstFile->pages)
                        ? $firstFile->pages->map(function ($page) {
                              return [
                                    'id'          => $page->id,
                                    'file_id'     => $page->file_id,
                                    'image_path'  => asset($page->image_path),
                                    'total_pages' => $page->total_pages,
                              ];
                        })
                        : [],
            ];
      }
}
