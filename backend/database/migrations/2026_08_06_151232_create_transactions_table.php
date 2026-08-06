<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('invoice_id')->nullable()->constrained()->nullOnDelete();
            $table->string('tx_ref')->unique(); // our reference, sent to Flutterwave
            $table->string('flw_transaction_id')->nullable(); // Flutterwave's own ID, from webhook/verify
            $table->decimal('amount', 12, 2);
            $table->string('currency', 3)->default('NGN');
            $table->string('status')->default('pending'); // pending | successful | failed
            $table->string('payment_method')->nullable(); // card, banktransfer, ussd, etc.
            $table->string('receipt_number')->nullable()->unique();
            $table->timestamp('paid_at')->nullable();
            $table->json('meta')->nullable(); // raw gateway response, for auditing
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('transactions');
    }
};