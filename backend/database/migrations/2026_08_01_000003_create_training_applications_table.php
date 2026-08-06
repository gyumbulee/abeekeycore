<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('training_applications', function (Blueprint $table) {
            $table->id();
            $table->string('full_name');
            $table->string('email');
            $table->string('phone');
            $table->string('course'); // ms-excel | digital-marketing | graphic-design
            $table->string('preferred_batch')->nullable();
            $table->string('payment_status')->default('pending'); // pending | paid
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('training_applications');
    }
};
