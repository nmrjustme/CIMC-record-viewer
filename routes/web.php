<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\patientsController;
use Laravel\Fortify\Features;

Route::inertia('/', 'welcome', [
    'canRegister' => Features::enabled(Features::registration()),
])->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');
});

Route::prefix('/viewer')->name('patients.')->group(function () {
    Route::get('/record-finder', [patientsController::class, 'index']);
    Route::get('/{hrn}/folder', [patientsController::class, 'getFiles']);
});


require __DIR__ . '/settings.php';
