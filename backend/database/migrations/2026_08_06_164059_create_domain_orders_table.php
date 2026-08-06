<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('domain_orders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('transaction_id')->nullable()->constrained()->nullOnDelete();
            $table->string('domain_name'); // full domain, e.g. abeekey.com
            $table->string('tld'); // e.g. .com
            $table->unsignedTinyInteger('years')->default(1);
            $table->decimal('cost_price', 12, 2); // what we pay the registrar
            $table->decimal('sale_price', 12, 2); // what the client pays
            $table->string('currency', 3)->default('NGN');
            $table->string('status')->default('pending_payment');
            // pending_payment | processing | registered | registration_failed | cancelled
            $table->json('registrant'); // contact details submitted for registration
            $table->string('connect_reseller_order_id')->nullable();
            $table->text('failure_reason')->nullable();
            $table->timestamp('registered_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('domain_orders');
    }
};