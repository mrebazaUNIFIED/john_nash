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
        Schema::create('students', function (Blueprint $table) {
            $table->id();
            $table->foreignId('institution_id')->constrained('institutions')->onDelete('cascade');
            $table->string('student_code');
            $table->string('first_name');
            $table->string('last_name_paternal');
            $table->string('last_name_maternal')->nullable();
            $table->string('grade')->nullable();
            $table->string('section')->nullable();
            $table->string('level'); // PRIMARIA, SECUNDARIA, etc.
            $table->string('shift'); // MAÑANA, TARDE
            $table->string('photo_url')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->unique(['institution_id', 'student_code']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('students');
    }
};
