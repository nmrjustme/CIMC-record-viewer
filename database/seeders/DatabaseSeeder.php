<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            UserTableSeeder::class,
            PatientsTableSeeder::class,
            PatientsInfoSeeder::class,
            PatientAddressSeeder::class,
            PatientHRNSeeder::class,
        ]);
    }
}
