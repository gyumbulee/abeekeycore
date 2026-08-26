<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('domain_renewal_orders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('domain_order_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('transaction_id')->nullable()->constrained()->nullOnDelete();
            $table->unsignedInteger('years');
            $table->decimal('sale_price', 12, 2);
            $table->string('currency', 3)->default('NGN');
            $table->string('status')->default('pending_payment');
            // pending_payment | processing | completed | failed | cancelled
            $table->timestamp('previous_expiry_at')->nullable(); // captured at request time, for display/audit
            $table->timestamp('new_expiry_at')->nullable(); // set from ConnectReseller's response on success
            $table->text('failure_reason')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('domain_renewal_orders');
    }
};
