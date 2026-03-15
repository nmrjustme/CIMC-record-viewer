<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Faker\Factory as Faker;

class PatientsTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $faker = Faker::create();

        // Get all user IDs to satisfy the foreign key
        $users = DB::table('users')->pluck('id')->toArray();

        if (empty($users)) {
            $this->command->info('No users found! Please seed users first.');
            return;
        }

        for ($i = 1; $i <= 50; $i++) {
            // Generate 8 random digits after 7 zeros to make 15-digit HRN
            $randomDigits = str_pad($faker->unique()->numberBetween(0, 99999999), 8, '0', STR_PAD_LEFT);
            $hrn = '0000000' . $randomDigits; // 7 zeros + 8 digits = 15 digits

            DB::table('patients')->insert([
                'hrn' => $hrn,
                'firstname' => $faker->firstName,
                'middlename' => $faker->optional()->firstName,
                'lastname' => $faker->lastName,
                'created_by' => $faker->randomElement($users),
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        $this->command->info('50 patients seeded successfully!');
    }
}
