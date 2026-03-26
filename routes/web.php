<?php

use App\Http\Controllers\Auth\RegisterController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\patientsController;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Laravel\Fortify\Features;
use App\Http\Controllers\ActivityLogsController;

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\PatientHRNController;
use App\Http\Controllers\PdfController;

// Route::inertia('/', 'welcome', [
//     'canRegister' => Features::enabled(Features::registration()),
// ])->name('home');

Route::get('/', function () {
    if (Auth::check()) {
        Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
    }
    return redirect()->route('login');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {



    Route::prefix('/viewer')->name('patients.')->group(function () {
        Route::get('/record-finder', [patientsController::class, 'index'])->name('index');

        // This receives the POST from the button
        Route::post('/folder', [patientsController::class, 'initFolder']);

        // This handles the display and the browser REFRESH (GET)
        Route::get('/folder', [patientsController::class, 'getFiles'])->name('folder');
    });

    Route::middleware(['role:admin,staff'])->group(function () {
        Route::post('/patients/add-hrn', [patientsController::class, 'addHRN'])
                ->name('patients.add-hrn');

        Route::post('/pdf/create-blank', [PdfController::class, 'createBlankPdf'])
                ->name('pdf.create-blank');
    });

    // Admin Routes
    Route::middleware(['role:admin'])->group(function () {
        Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');



        Route::get('/register', [RegisterController::class, 'index'])->name('register');
        Route::post('/register', [RegisterController::class, 'store']);
        Route::put('/users/{user}', [RegisterController::class, 'update']);
        Route::delete('/users/{user}', [RegisterController::class, 'destroy']);
        // Route::get('/register', function () {
        //     return Inertia::render('auth/register');
        // })->name('register');

        // Admin add patient page
        Route::get('patients/create', [patientsController::class, 'create'])
            ->name('patients.create');
        // Store new patient
        Route::post('patients', [patientsController::class, 'store'])
            ->name('patients.store');

        Route::get('/activity-logs', [ActivityLogsController::class, 'logs'])->name('admin-logs');
    });

    // Staff Routes
    Route::middleware(['role:staff'])->group(function () {});
});



require __DIR__ . '/settings.php';
