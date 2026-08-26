<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('hosting_plans', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->unsignedInteger('disk_gb');
            // null = unlimited, matching how most hosting marketing pages
            // present bandwidth/site counts.
            $table->unsignedInteger('bandwidth_gb')->nullable();
            $table->unsignedInteger('website_count')->default(1);
            $table->unsignedInteger('email_accounts')->nullable();
            $table->unsignedInteger('databases')->nullable();
            $table->boolean('free_ssl')->default(true);
            $table->json('features')->nullable(); // freeform bullet list for the pricing page, e.g. ["Daily backups", "1-click WordPress"]
            $table->decimal('price_monthly', 12, 2);
            $table->decimal('price_annual', 12, 2);
            $table->string('currency', 3)->default('NGN');
            // Which CloudPanel vhost template/PHP version to provision this
            // plan with — see Services\CloudPanelService::createSite().
            $table->string('php_version')->default('8.4');
            $table->boolean('is_active')->default(true);
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('hosting_plans');
    }
};
