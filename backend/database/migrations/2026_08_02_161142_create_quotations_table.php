<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('quotations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('quotation_request_id')->nullable()
                ->constrained('quotation_requests')->nullOnDelete();
            $table->string('quotation_number')->unique();
            $table->string('title');
            $table->decimal('amount_total', 12, 2);
            $table->string('currency', 3)->default('NGN');
            $table->string('status')->default('sent'); // draft | sent | accepted | declined | expired
            $table->date('valid_until')->nullable();
            $table->json('items')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('quotations');
    }
};