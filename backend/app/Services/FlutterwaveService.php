<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;

class FlutterwaveService
{
    protected string $baseUrl;
    protected string $secretKey;

    public function __construct()
    {
        $this->baseUrl = config('services.flutterwave.base_url');
        $this->secretKey = (string) config('services.flutterwave.secret_key');
    }

    protected function client()
    {
        return Http::withToken($this->secretKey)->acceptJson();
    }

    /**
     * Start a Standard checkout payment. Returns the Flutterwave response array,
     * which on success contains data.link — the hosted checkout URL to redirect to.
     */
    public function initializePayment(array $payload): array
    {
        $response = $this->client()->post("{$this->baseUrl}/payments", $payload);

        return $response->json() ?? [];
    }

    /**
     * Verify a transaction by Flutterwave's own transaction ID
     * (used from the webhook, which supplies this ID directly).
     */
    public function verifyTransaction(string $flwTransactionId): array
    {
        $response = $this->client()->get("{$this->baseUrl}/transactions/{$flwTransactionId}/verify");

        return $response->json() ?? [];
    }

    /**
     * Verify a transaction by our own tx_ref
     * (used on the frontend redirect-back, before the webhook may have arrived).
     */
    public function verifyByReference(string $txRef): array
    {
        $response = $this->client()->get("{$this->baseUrl}/transactions/verify_by_reference", [
            'tx_ref' => $txRef,
        ]);

        return $response->json() ?? [];
    }
}