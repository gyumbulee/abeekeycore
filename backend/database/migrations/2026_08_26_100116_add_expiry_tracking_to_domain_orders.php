<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('domain_orders', function (Blueprint $table) {
            $table->timestamp('expires_at')->nullable()->after('registered_at');
            // Which reminder thresholds (see config('domains.expiry_reminder_days'))
            // have already been sent for this order, e.g. [30, 14]. Prevents
            // re-sending the same reminder every time the scheduler runs.
            $table->json('expiry_reminders_sent')->nullable()->after('expires_at');
        });

        // Backfill: any order already marked 'registered' has a real
        // registered_at but no way to know its expiry without this. Years
        // is stored on the order itself, so this is exact, not a guess.
        DB::table('domain_orders')
            ->where('status', 'registered')
            ->whereNotNull('registered_at')
            ->orderBy('id')
            ->each(function ($order) {
                DB::table('domain_orders')
                    ->where('id', $order->id)
                    ->update([
                        'expires_at' => \Illuminate\Support\Carbon::parse($order->registered_at)
                            ->addYears((int) $order->years),
                    ]);
            });
    }

    public function down(): void
    {
        Schema::table('domain_orders', function (Blueprint $table) {
            $table->dropColumn(['expires_at', 'expiry_reminders_sent']);
        });
    }
};
