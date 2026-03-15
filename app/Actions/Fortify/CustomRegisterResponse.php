<?php

namespace App\Actions\Fortify;

use Laravel\Fortify\Contracts\RegisterResponse as RegisterResponseContract;
use Illuminate\Support\Facades\Auth;

class CustomRegisterResponse implements RegisterResponseContract
{
    /**
     * Handle the response after registration.
     */
    public function toResponse($request)
    {
        $user = Auth::user();

        if ($user->role === 'admin') {
            $redirect = '/dashboard';
        } elseif ($user->role === 'staff') {
            $redirect = '/viewer/record-finder';
        } else {
            $redirect = '/viewer/record-finder';
        }

        return redirect()->intended($redirect);
    }
}
