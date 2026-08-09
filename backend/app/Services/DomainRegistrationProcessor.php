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
     *
     * Real ConnectReseller flow (per their API docs — this is not a guess
     * anymore): register requires a Client ID + nameservers, not registrant
     * details directly. The registrant contact is created separately and
     * attached to the domain afterward via updatecontact.
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

        $clientId = (int) config('services.connectreseller.client_id');
        $fullDomain = $order->domain_name.$order->tld;

        if (! $clientId) {
            $order->update([
                'status' => 'registration_failed',
                'failure_reason' => 'CONNECTRESELLER_CLIENT_ID is not configured — cannot register domains yet.',
            ]);
            Log::error("Domain registration blocked for {$fullDomain}: CONNECTRESELLER_CLIENT_ID not set.");

            return;
        }

        try {
            $registerResult = $this->connectReseller->registerDomain($fullDomain, $order->years, $clientId);

            $statusCode = $registerResult['responseMsg']['statusCode'] ?? null;
            $success = $statusCode == 200;

            if (! $success) {
                $order->update([
                    'status' => 'registration_failed',
                    'failure_reason' => $registerResult['responseMsg']['message'] ?? 'Unknown error from registrar.',
                ]);
                Log::error("Domain registration failed for {$fullDomain}: ".json_encode($registerResult));

                return;
            }

            $order->update([
                'status' => 'registered',
                'registered_at' => now(),
            ]);

            // Attach the registrant's actual contact details. This is a
            // best-effort second step — if it fails, the domain is still
            // successfully registered, so we log rather than mark the
            // whole order as failed.
            $this->attachRegistrantContact($order, $fullDomain, $clientId);
        } catch (\Throwable $e) {
            $order->update([
                'status' => 'registration_failed',
                'failure_reason' => $e->getMessage(),
            ]);
            Log::error("Domain registration exception for {$fullDomain}: ".$e->getMessage());
        }
    }

    protected function attachRegistrantContact(DomainOrder $order, string $fullDomain, int $clientId): void
    {
        try {
            $contactId = $this->connectReseller->addRegistrantContact($order->registrant, $clientId);

            if (! $contactId) {
                Log::warning("Domain {$fullDomain} registered, but creating the registrant contact failed — using registrar default contact instead.");

                return;
            }

            $domainNameId = $this->connectReseller->findDomainId($fullDomain);

            if (! $domainNameId) {
                Log::warning("Domain {$fullDomain} registered, but couldn't look up its ConnectReseller ID to attach the registrant contact.");

                return;
            }

            $result = $this->connectReseller->assignDomainContact($domainNameId, $fullDomain, $contactId);

            $order->update(['connect_reseller_order_id' => (string) $domainNameId]);

            if (($result['responseMsg']['statusCode'] ?? null) != 200) {
                Log::warning("Domain {$fullDomain} registered, but attaching the registrant contact returned: ".json_encode($result));
            }
        } catch (\Throwable $e) {
            Log::warning("Domain {$fullDomain} registered, but attaching the registrant contact threw: ".$e->getMessage());
        }
    }
}