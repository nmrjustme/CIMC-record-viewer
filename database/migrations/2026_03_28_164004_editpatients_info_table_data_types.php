<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('patients_info', function (Blueprint $table) {
            // Use text() or longText() for encrypted fields
            $table->string('sex')->change();
            $table->string('nationality')->change();
            $table->string('birthdate')->change();
            $table->string('place_of_birth')->change();
            $table->string('religion')->change();
            $table->string('phone_number')->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        //
    }
};
