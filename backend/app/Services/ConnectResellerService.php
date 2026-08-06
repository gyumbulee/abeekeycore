<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * IMPORTANT — before going live:
 *
 * This service was written from the general reseller-API pattern ConnectReseller
 * documents publicly (REST, apiKey + resellerID auth), because their official
 * API_v10 PDF (connectreseller.com/resources/downloads/CR_API_Document_V10.pdf)
 * blocks automated fetching. The endpoint paths and parameter names below are
 * a best-effort placeholder and MUST be confirmed against:
 *   1. The PDF linked above (download it manually and open it), or
 *   2. Your reseller panel → Settings → API, which lists your exact
 *      endpoints, auth headers, and account-specific base URL.
 *
 * Every method below is isolated here specifically so that fixing them is a
 * one-file change — nothing in the controllers needs to know the difference.
 */
class ConnectResellerService
{
    protected string $baseUrl;
    protected string $apiKey;
    protected string $resellerId;

    public function __construct()
    {
        $this->baseUrl = rtrim((string) config('services.connectreseller.base_url'), '/');
        $this->apiKey = (string) config('services.connectreseller.api_key');
        $this->resellerId = (string) config('services.connectreseller.reseller_id');
    }

    protected function authParams(): array
    {
        return [
            'apiKey' => $this->apiKey,
            'resellerID' => $this->resellerId,
        ];
    }

    /**
     * TODO verify endpoint: GET {baseUrl}/domains/checkAvailability
     * Checks whether a single domain (name + tld) is available.
     *
     * Expected-ish response: ['domainName' => ..., 'available' => bool, ...]
     * We defensively look for a few likely key names since the exact
     * response shape is unconfirmed.
     */
    public function checkAvailability(string $domainName, string $tld): array
    {
        try {
            $response = Http::timeout(15)->get("{$this->baseUrl}/domains/checkAvailability", [
                ...$this->authParams(),
                'domainName' => $domainName,
                'tld' => ltrim($tld, '.'),
            ]);

            $data = $response->json() ?? [];

            $available = $data['available']
                ?? $data['isAvailable']
                ?? (($data['status'] ?? null) === 'available')
                ?? null;

            return [
                'domain' => $domainName.$tld,
                'available' => (bool) $available,
                'raw' => $data,
            ];
        } catch (\Throwable $e) {
            Log::warning("ConnectReseller availability check failed for {$domainName}{$tld}: ".$e->getMessage());

            return ['domain' => $domainName.$tld, 'available' => null, 'error' => true];
        }
    }

    /**
     * TODO verify endpoint: POST {baseUrl}/domains/register
     * Registers a domain after payment has been confirmed.
     *
     * $registrant expects: first_name, last_name, email, phone, address,
     * city, state, postal_code, country.
     */
    public function registerDomain(string $domainName, string $tld, int $years, array $registrant): array
    {
        $response = Http::timeout(30)->post("{$this->baseUrl}/domains/register", [
            ...$this->authParams(),
            'domainName' => $domainName,
            'tld' => ltrim($tld, '.'),
            'years' => $years,
            'registrant' => [
                'firstName' => $registrant['first_name'],
                'lastName' => $registrant['last_name'],
                'email' => $registrant['email'],
                'phone' => $registrant['phone'],
                'address1' => $registrant['address'],
                'city' => $registrant['city'],
                'state' => $registrant['state'],
                'zipcode' => $registrant['postal_code'],
                'country' => $registrant['country'],
            ],
        ]);

        return $response->json() ?? [];
    }
}