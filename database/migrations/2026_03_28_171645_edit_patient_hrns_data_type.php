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
        Schema::table('patient_hrns', function (Blueprint $table) {
            // Use text() or longText() for encrypted fields
            $table->string('hrn')->change();
        });
        
        Schema::table('patients', function (Blueprint $table) {
            // Use text() or longText() for encrypted fields
            $table->string('hrn')->change();
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
