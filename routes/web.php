<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\patientsController;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Laravel\Fortify\Features;

// Route::inertia('/', 'welcome', [
//     'canRegister' => Features::enabled(Features::registration()),
// ])->name('home');

Route::get('/', function () {
    if (Auth::check()) {
        return redirect()->route('dashboard');
    }
    return redirect()->route('login');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {

    //Public Records
    Route::prefix('/viewer')->name('patients.')->group(function () {
        Route::get('/record-finder', [patientsController::class, 'index'])->name('index');
        Route::get('/{hrn}/folder', [patientsController::class, 'getFiles'])->name('folder');
    });

    // Admin Routes
    Route::middleware(['role:admin'])->group(function () {
        Route::inertia('dashboard', 'dashboard')->name('dashboard');

        Route::get('/register', function () {
            return Inertia::render('auth/register');
        })->name('register');
        Route::post('/register', [\App\Http\Controllers\Auth\RegisterController::class, 'store']);

        // Admin add patient page
        Route::get('patients/create', [patientsController::class, 'create'])
            ->name('patients.create');
        // Store new patient
        Route::post('patients', [patientsController::class, 'store'])
            ->name('patients.store');

    });

    // Staff Routes
    Route::middleware(['role:staff'])->group(function () {

    });
});



require __DIR__ . '/settings.php';
