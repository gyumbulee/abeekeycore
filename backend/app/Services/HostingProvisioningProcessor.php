<?php

namespace App\Services;

use App\Mail\HostingProvisionedMail;
use App\Models\HostingOrder;
use App\Models\Transaction;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;

class HostingProvisioningProcessor
{
    public function __construct(protected CloudPanelService $cloudPanel) {}

    /**
     * Called after a transaction is confirmed successful. If it's linked to
     * a hosting order still awaiting payment, provision the CloudPanel
     * site. Safe to call for transactions with no linked hosting order
     * (no-op) — mirrors DomainRegistrationProcessor's shape exactly, so
     * both plug into PaymentReconciler the same way.
     *
     * Runs synchronously within the payment-verification request, same as
     * domain registration — SSH provisioning is usually a few seconds, not
     * long enough to justify a queued job and a second async status the
     * client has to poll for. If that changes in practice (slow server,
     * frequent timeouts), this is a one-line change to dispatch a queued
     * job instead — the queue connection is already configured
     * (QUEUE_CONNECTION=redis, see .env.example).
     */
    public function processIfApplicable(Transaction $transaction): void
    {
        if ($transaction->status !== 'successful') {
            return;
        }

        $order = HostingOrder::where('transaction_id', $transaction->id)
            ->where('status', 'pending_payment')
            ->with('plan')
            ->first();

        if (! $order) {
            return;
        }

        $this->provision($order);
    }

    /**
     * Re-attempts provisioning for an order that previously failed —
     * called from Admin\HostingController@retry. Reuses the exact same
     * core logic as the post-payment path (provision()), so a retry
     * behaves identically to the original attempt rather than being a
     * second, subtly different code path.
     */
    public function retry(HostingOrder $order): void
    {
        if ($order->status !== 'provisioning_failed') {
            throw new \RuntimeException('Only orders in provisioning_failed status can be retried.');
        }

        $order->load('plan');
        $this->provision($order);
    }

    protected function provision(HostingOrder $order): void
    {
        $order->update(['status' => 'provisioning', 'failure_reason' => null]);

        $siteUser = $this->generateSiteUser($order->domain_name);
        $sitePassword = Str::password(20);

        try {
            $result = $this->cloudPanel->createSite(
                $order->domain_name,
                $siteUser,
                $sitePassword,
                $order->plan->php_version ?? config('hosting.default_php_version', '8.4')
            );

            if (! ($result['ok'] ?? false)) {
                $order->update([
                    'status' => 'provisioning_failed',
                    'failure_reason' => 'clpctl site:add:php failed: '.($result['output'] ?? 'no output captured'),
                ]);
                Log::error("Hosting provisioning failed for order #{$order->id} ({$order->domain_name}).");

                return;
            }

            $billingPeriodMonths = $order->billing_cycle === 'annual' ? 12 : 1;

            $order->update([
                'status' => 'active',
                'site_user' => $siteUser,
                'site_user_password' => $sitePassword,
                'provisioned_at' => now(),
                'expires_at' => now()->addMonths($billingPeriodMonths),
            ]);

            $order = $order->fresh();

            // Best-effort — a hosting order is still a success even if this
            // fails; see CloudPanelService::createDatabase() docblock. Runs
            // before the client email so that, when it succeeds, the
            // credentials are already on the order and go out in the same
            // single welcome email rather than a separate follow-up.
            $this->createDefaultDatabase($order);

            $this->notifyClient($order->fresh(), $sitePassword);
        } catch (\Throwable $e) {
            $order->update([
                'status' => 'provisioning_failed',
                'failure_reason' => $e->getMessage(),
            ]);
            Log::error("Hosting provisioning exception for order #{$order->id}: ".$e->getMessage());
        }
    }

    /**
     * CloudPanel site-users are server-wide, not scoped per-domain, so the
     * username has to be both DNS-safe and reasonably collision-resistant
     * across every client on the box — a random suffix handles that
     * without needing a uniqueness check against the live server.
     */
    protected function generateSiteUser(string $domainName): string
    {
        $base = Str::of($domainName)
            ->lower()
            ->replaceMatches('/[^a-z0-9]/', '-')
            ->substr(0, 20)
            ->trim('-');

        return $base.'-'.Str::lower(Str::random(6));
    }

    protected function notifyClient(HostingOrder $order, string $plaintextPassword): void
    {
        try {
            Mail::to($order->user->email)->send(new HostingProvisionedMail($order, $plaintextPassword));
        } catch (\Throwable $e) {
            Log::error("Failed to send hosting-provisioned notification for order #{$order->id}: ".$e->getMessage());
        }
    }

    protected function createDefaultDatabase(HostingOrder $order): void
    {
        try {
            $dbName = Str::of($order->site_user)->replace('-', '_')->substr(0, 32)->toString();
            $dbPassword = Str::password(20);

            $result = $this->cloudPanel->createDatabase($order->domain_name, $dbName, $dbName, $dbPassword);

            if (! ($result['ok'] ?? false)) {
                Log::warning("Hosting order #{$order->id} provisioned, but default database creation returned a non-zero exit: ".($result['output'] ?? ''));

                return;
            }

            $order->update([
                'database_name' => $dbName,
                'database_user' => $dbName,
                'database_password' => $dbPassword,
            ]);
        } catch (\Throwable $e) {
            Log::warning("Hosting order #{$order->id} provisioned, but default database creation threw: ".$e->getMessage());
        }
    }
}
