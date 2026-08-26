<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('hosting_orders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('hosting_plan_id')->constrained()->restrictOnDelete();
            $table->foreignId('transaction_id')->nullable()->constrained()->nullOnDelete();
            // Only set when the domain was registered through Abeekey
            // itself — linking it lets the admin/portal show them as a
            // bundle. A hosting order can also point at a domain the
            // client owns elsewhere, in which case this stays null and
            // domain_name below is still recorded for provisioning.
            $table->foreignId('domain_order_id')->nullable()->constrained()->nullOnDelete();
            $table->string('domain_name'); // the domain CloudPanel provisions the site under, regardless of where it's registered
            $table->string('billing_cycle'); // monthly | annual
            $table->decimal('cost_price', 12, 2); // internal cost (server capacity allocation — informational, not billed externally)
            $table->decimal('sale_price', 12, 2); // what the client pays for this billing cycle
            $table->string('currency', 3)->default('NGN');
            $table->string('status')->default('pending_payment');
            // pending_payment | provisioning | active | provisioning_failed | suspended | cancelled | expired
            $table->string('site_user')->nullable(); // CloudPanel site-user account
            // Generated at provisioning time, emailed once to the client,
            // and kept here encrypted (see HostingOrder::casts) only so
            // support staff can look it up later without SSHing into the
            // server — never exposed in any list/index response.
            $table->text('site_user_password')->nullable();
            // Best-effort default database (see CloudPanelService::
            // createDatabase() and HostingProvisioningProcessor) — null if
            // creation failed or hasn't run yet; the order is still
            // 'active' regardless, since a database isn't required for
            // every site type (static sites, etc.).
            $table->string('database_name')->nullable();
            $table->string('database_user')->nullable();
            $table->text('database_password')->nullable();
            $table->text('failure_reason')->nullable();
            $table->timestamp('provisioned_at')->nullable();
            $table->timestamp('expires_at')->nullable();
            $table->json('expiry_reminders_sent')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('hosting_orders');
    }
};
