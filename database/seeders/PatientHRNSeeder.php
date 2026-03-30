<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Faker\Factory as Faker;

class PatientHRNSeeder extends Seeder
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

        $usedHrns = [];

        foreach ($patients as $patientId) {

            // 🔹 Generate PRIMARY HRN
            $primaryHrn = $this->generateUniqueHRN($faker, $usedHrns);

            DB::table('patient_hrns')->insert([
                'patient_id' => $patientId,
                'hrn' => $primaryHrn,
                'is_primary' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            // 🔹 Generate 1–3 additional HRNs
            $extraCount = rand(1, 3);

            for ($i = 0; $i < $extraCount; $i++) {

                $extraHrn = $this->generateUniqueHRN($faker, $usedHrns);

                DB::table('patient_hrns')->insert([
                    'patient_id' => $patientId,
                    'hrn' => $extraHrn,
                    'is_primary' => false,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }

        $this->command->info('Patient HRNs seeded successfully!');
    }

    /**
     * Generate unique 15-digit HRN
     */
    private function generateUniqueHRN($faker, &$usedHrns)
    {
        do {
            $randomDigits = str_pad($faker->numberBetween(0, 99999999), 8, '0', STR_PAD_LEFT);
            $hrn = '0000000' . $randomDigits;
        } while (in_array($hrn, $usedHrns));

        $usedHrns[] = $hrn;

        return $hrn;
    }
}
