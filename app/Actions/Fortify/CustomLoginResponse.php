<?php

namespace App\Actions\Fortify;

use Laravel\Fortify\Contracts\LoginResponse as LoginResponseContract;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CustomLoginResponse implements LoginResponseContract
{
    public function toResponse($request)
    {
        $user = Auth::user();

        if ($user->role === 'admin') {
            return redirect()->route('dashboard');
        } elseif ($user->role === 'staff') {
            return redirect()->route('patients.index');
        } elseif ($user->role === 'viewer') {
            return redirect()->route('patients.index');
        }

        return redirect()->route('home');
    }
}
