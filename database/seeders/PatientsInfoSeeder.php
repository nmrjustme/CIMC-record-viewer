<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Faker\Factory as Faker;
use App\Models\patientsInfo;
use Illuminate\Support\Facades\DB;

class PatientsInfoSeeder extends Seeder
{
    public function run(): void
    {
        $faker = Faker::create();

        // Get all patient IDs
        $patients = DB::table('patients')->pluck('id')->toArray();

        if (empty($patients)) {
            $this->command->info('No patients found! Please seed patients first.');
            return;
        }

        foreach ($patients as $patientId) {

            patientsInfo::create([
                'patient_id' => $patientId,
                'civil_status' => $faker->randomElement(['Single', 'Married', 'Widowed', 'Separated']),
                'nationality' => 'Filipino',
                'sex' => $faker->randomElement(['Male', 'Female']),
                'birthdate' => $faker->date('Y-m-d', '2005-01-01'),
                'place_of_birth' => $faker->city,
                'religion' => $faker->randomElement(['Roman Catholic', 'Christian', 'Iglesia ni Cristo', 'Muslim', 'Baptist', 'Born Again']),
                'phone_number' => $faker->phoneNumber,
            ]);
        }

        $this->command->info('Patients info seeded successfully!');
    }
}
