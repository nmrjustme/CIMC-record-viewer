<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class PatientRecordResource extends JsonResource
{
    public function toArray($request)
    {
        // Get the file with the absolute latest update time (including milliseconds)
        $latestFile = $this->file->sortByDesc('updated_at')->first();

        return [
            'id'            => $this->id,
            'file_name'     => $this->record_type ?? 'Unnamed File',

            // CRITICAL: We take the updated_at from the file, not just the record
            // This ensures 2026-04-02 16:49:32.763 is sent correctly
            'updated_at'    => $latestFile ? $latestFile->updated_at->toISOString() : $this->updated_at->toISOString(),

            'created_at'    => $this->created_at->toISOString(),
            'pdf_url'       => $latestFile ? asset($latestFile->file_path) : null,
            'total'         => $this->file->count(),

            'pages' => ($latestFile && $latestFile->pages)
                ? $latestFile->pages
                ->sortByDesc('created_at') // Ensures Page 1 is the oldest upload (Ascending)
                ->values()             // Resets keys after sorting
                ->map(function ($page) {
                    return [
                        'id'          => $page->id,
                        'file_id'     => $page->file_id,
                        'image_path'  => asset($page->image_path),
                        'total_pages' => $page->total_pages,
                        'created_at'  => $page->created_at, // Useful for debugging if needed
                    ];
                })
                : [],
        ];
    }
}
