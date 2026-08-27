<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('email_otps', function (Blueprint $table) {
            // Per-record wrong-guess counter. The route-level throttle
            // limits attempts per IP, but a distributed attacker (or one
            // rotating IPs) could still hammer a single user's code from
            // many addresses — this caps guesses against the code itself
            // regardless of where they come from.
            $table->unsignedTinyInteger('attempts')->default(0)->after('code');
        });
    }

    public function down(): void
    {
        Schema::table('email_otps', function (Blueprint $table) {
            $table->dropColumn('attempts');
        });
    }
};
