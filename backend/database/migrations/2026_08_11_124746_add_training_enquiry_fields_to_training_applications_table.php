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
        Schema::table('training_applications', function (Blueprint $table) {
            $table->text('learning_goal')->nullable()->after('course');
            $table->string('experience_level')->nullable()->after('learning_goal');
            $table->string('preferred_schedule')->nullable()->after('experience_level');
            $table->string('delivery_mode')->nullable()->after('preferred_schedule');
            $table->text('notes')->nullable()->after('preferred_batch');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('training_applications', function (Blueprint $table) {
            $table->dropColumn([
                'learning_goal',
                'experience_level',
                'preferred_schedule',
                'delivery_mode',
                'notes',
            ]);
        });
    }
};