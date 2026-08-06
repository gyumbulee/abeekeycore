<?php

namespace App\Services;

use App\Models\DomainOrder;
use App\Models\Transaction;
use Illuminate\Support\Facades\Log;

class DomainRegistrationProcessor
{
    public function __construct(protected ConnectResellerService $connectReseller) {}

    /**
     * Called after a transaction is confirmed successful. If it's linked to
     * a domain order still awaiting payment, complete the registration.
     * Safe to call for transactions with no linked domain order (no-op).
     */
    public function processIfApplicable(Transaction $transaction): void
    {
        if ($transaction->status !== 'successful') {
            return;
        }

        $order = DomainOrder::where('transaction_id', $transaction->id)
            ->where('status', 'pending_payment')
            ->first();

        if (! $order) {
            return;
        }

        $order->update(['status' => 'processing']);

        try {
            $result = $this->connectReseller->registerDomain(
                $order->domain_name,
                $order->tld,
                $order->years,
                $order->registrant
            );

            $success = ($result['status'] ?? null) === 'success'
                || ($result['success'] ?? false) === true
                || isset($result['orderId'])
                || isset($result['orderID']);

            if ($success) {
                $order->update([
                    'status' => 'registered',
                    'connect_reseller_order_id' => (string) ($result['orderId'] ?? $result['orderID'] ?? ''),
                    'registered_at' => now(),
                ]);
            } else {
                $order->update([
                    'status' => 'registration_failed',
                    'failure_reason' => $result['message'] ?? $result['description'] ?? 'Unknown error from registrar.',
                ]);
                Log::error("Domain registration failed for {$order->domain_name}{$order->tld}: ".json_encode($result));
            }
        } catch (\Throwable $e) {
            $order->update([
                'status' => 'registration_failed',
                'failure_reason' => $e->getMessage(),
            ]);
            Log::error("Domain registration exception for {$order->domain_name}{$order->tld}: ".$e->getMessage());
        }
    }
}