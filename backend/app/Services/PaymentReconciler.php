<?php

namespace App\Services;

use App\Models\Transaction;
use Illuminate\Support\Str;

class PaymentReconciler
{
    public function __construct(protected DomainRegistrationProcessor $domainProcessor) {}

    /**
     * Given a verified Flutterwave transaction payload (the "data" object from
     * either verify_by_reference or the webhook), apply it to our Transaction
     * and, if successful, mark the linked Invoice as paid.
     *
     * Per Flutterwave's own guidance: never trust status alone — also check
     * amount and currency match what we expected before crediting anything.
     */
    public function reconcile(Transaction $transaction, array $flwData): Transaction
    {
        if ($transaction->status === 'successful') {
            return $transaction; // already processed, avoid double-crediting
        }

        $statusOk = ($flwData['status'] ?? null) === 'successful';
        $amountOk = (float) ($flwData['amount'] ?? 0) >= (float) $transaction->amount;
        $currencyOk = ($flwData['currency'] ?? null) === $transaction->currency;

        if (! ($statusOk && $amountOk && $currencyOk)) {
            $transaction->update([
                'status' => 'failed',
                'flw_transaction_id' => (string) ($flwData['id'] ?? $transaction->flw_transaction_id),
                'meta' => $flwData,
            ]);

            return $transaction;
        }

        $transaction->update([
            'status' => 'successful',
            'flw_transaction_id' => (string) ($flwData['id'] ?? ''),
            'payment_method' => $flwData['payment_type'] ?? null,
            'receipt_number' => $transaction->receipt_number ?? 'RCT-'.strtoupper(Str::random(10)),
            'paid_at' => now(),
            'meta' => $flwData,
        ]);

        if ($transaction->invoice) {
            $transaction->invoice->update([
                'status' => 'paid',
                'paid_at' => now(),
            ]);
        }

        $transaction = $transaction->fresh();

        $this->domainProcessor->processIfApplicable($transaction);

        return $transaction;
    }
}