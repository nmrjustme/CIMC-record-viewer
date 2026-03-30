<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Faker\Factory as Faker;

class PatientsInfoSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $faker = Faker::create();

        // Get all patient IDs (foreign key)
        $patients = DB::table('patients')->pluck('id')->toArray();


        if (empty($patients)) {
            $this->command->info('No patients found! Please seed patients first.');
            return;
        }

        foreach ($patients as $patientId) {

            DB::table('patients_info')->insert([
                'patient_id' => $patientId,
                'civil_status' => $faker->randomElement(['Single', 'Married', 'Widowed', 'Separated']),
                'nationality' => 'Filipino',
                'sex' => $faker->randomElement(['Male', 'Female']),
                'birthdate' => $faker->date('Y-m-d', '2005-01-01'),
                'place_of_birth' => $faker->city,
                'religion' => $faker->randomElement(['Roman Catholic', 'Christian', 'Iglesia ni Cristo', 'Muslim']),
                'phone_number' => $faker->phoneNumber,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        $this->command->info('Patients info seeded successfully!');
    }
}
