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
        Schema::create('patients_records_file', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('records_id');
            $table->string('file_name');
            $table->string('file_path');
            $table->integer('total_pages');
            $table->timestamps();
            
            $table->foreign('records_id')
                   ->references('id')
                   ->on('patients_records')
                   ->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('patients_records_file');
    }
};
