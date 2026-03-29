<?php

namespace App\Traits;

use App\Models\ActivityLog;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Request;

trait Loggable
{
      public function logActivity($action, $description, $module)
      {
            $userId = Auth::id();

            // Check if an identical log was created by this user in the last 5 seconds
            $exists = \App\Models\ActivityLog::where('user_id', $userId)
                  ->where('action', $action)
                  ->where('description', $description)
                  ->where('created_at', '>=', now()->subSeconds(5))
                  ->exists();
            
            if (!$exists) {
                  return \App\Models\ActivityLog::create([
                        'user_id' => $userId,
                        'action' => $action,
                        'description' => $description,
                        'module' => $module,
                        'ip_address' => Request::ip(),
                        
                  ]);
            }
      }
}
