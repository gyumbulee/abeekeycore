<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Only add the column if it doesn't already exist
        if (!Schema::hasColumn('domain_orders', 'expires_at')) {
            Schema::table('domain_orders', function (Blueprint $table) {
                $table->timestamp('expires_at')->nullable()->after('registered_at');
            });
        }

        // Backfill: any order already marked 'registered' has a real
        // registered_at and years stored on the order.
        DB::table('domain_orders')
            ->where('status', 'registered')
            ->whereNotNull('registered_at')
            ->whereNull('expires_at') // Only update if not already backfilled
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
        if (Schema::hasColumn('domain_orders', 'expires_at')) {
            Schema::table('domain_orders', function (Blueprint $table) {
                $table->dropColumn('expires_at');
            });
        }
    }
};