<?php

namespace App\Services;

use App\Mail\DomainRenewedMail;
use App\Models\DomainRenewalOrder;
use App\Models\Transaction;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class DomainRenewalProcessor
{
    public function __construct(protected ConnectResellerService $connectReseller) {}

    /**
     * Called after a transaction is confirmed successful. If it's linked to
     * a domain renewal order still awaiting payment, complete the renewal
     * via ConnectReseller's confirmed RenewalOrder endpoint. Safe to call
     * for transactions with no linked renewal order (no-op) — same shape
     * as DomainRegistrationProcessor so both plug into PaymentReconciler
     * identically.
     */
    public function processIfApplicable(Transaction $transaction): void
    {
        if ($transaction->status !== 'successful') {
            return;
        }

        $renewal = DomainRenewalOrder::where('transaction_id', $transaction->id)
            ->where('status', 'pending_payment')
            ->with('domainOrder')
            ->first();

        if (! $renewal) {
            return;
        }

        $order = $renewal->domainOrder;
        $renewal->update(['status' => 'processing']);

        $clientId = (int) config('services.connectreseller.client_id');
        $fullDomain = $order->domain_name.$order->tld;

        if (! $clientId) {
            $renewal->update([
                'status' => 'failed',
                'failure_reason' => 'CONNECTRESELLER_CLIENT_ID is not configured — cannot renew domains yet.',
            ]);
            Log::error("Domain renewal blocked for {$fullDomain}: CONNECTRESELLER_CLIENT_ID not set.");

            return;
        }

        try {
            $currentExpiryYear = $order->expires_at ? (int) $order->expires_at->format('Y') : null;

            $result = $this->connectReseller->renewDomain($fullDomain, $renewal->years, $clientId, $currentExpiryYear);

            $statusCode = $result['responseMsg']['statusCode'] ?? null;
            $success = $statusCode == 200;

            if (! $success) {
                $renewal->update([
                    'status' => 'failed',
                    'failure_reason' => $result['responseMsg']['message'] ?? 'Unknown error from registrar.',
                ]);
                Log::error("Domain renewal failed for {$fullDomain}: ".json_encode($result));

                return;
            }

            // Prefer the registrar's own returned expiry date over our own
            // addYears() calculation — it's the actual source of truth and
            // may differ slightly (e.g. registry-side rounding).
            $newExpiryRaw = $result['responseData']['expiryDate'] ?? null;
            $newExpiry = $newExpiryRaw
                ? \Illuminate\Support\Carbon::parse($newExpiryRaw)
                : ($order->expires_at ?? now())->copy()->addYears($renewal->years);

            $renewal->update([
                'status' => 'completed',
                'new_expiry_at' => $newExpiry,
            ]);

            // Only expires_at changes here — renewal never touches the
            // domain order's own status (e.g. a 'registration_failed'
            // domain that somehow still got renewed shouldn't be silently
            // flipped to 'registered').
            $order->update(['expires_at' => $newExpiry]);

            $this->notifyClient($renewal->fresh(['domainOrder', 'user']));
        } catch (\Throwable $e) {
            $renewal->update([
                'status' => 'failed',
                'failure_reason' => $e->getMessage(),
            ]);
            Log::error("Domain renewal exception for {$fullDomain}: ".$e->getMessage());
        }
    }

    protected function notifyClient(DomainRenewalOrder $renewal): void
    {
        try {
            Mail::to($renewal->user->email)->send(new DomainRenewedMail($renewal));
        } catch (\Throwable $e) {
            Log::error("Failed to send domain-renewed notification for renewal #{$renewal->id}: ".$e->getMessage());
        }
    }
}
