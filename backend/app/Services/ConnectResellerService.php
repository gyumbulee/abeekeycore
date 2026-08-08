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
    /**
     * TODO verify endpoint: GET {baseUrl}/domains/checkAvailability
     * Checks availability for one domain across multiple TLDs concurrently
     * (fired in parallel via Http::pool, not one-by-one) — looping sequentially
     * with N TLDs × a per-request timeout can exceed PHP's max_execution_time,
     * which is exactly what happened before this was made concurrent.
     *
     * Expected-ish response per TLD: ['available' => bool, ...]. We defensively
     * look for a few likely key names since the exact response shape is
     * unconfirmed — see the class docblock above for why.
     *
     * @param  array<string>  $tlds  e.g. ['.com', '.net']
     * @return array<string, array{available: bool|null, raw: array}> keyed by tld
     */
    public function checkAvailabilityBulk(string $domainName, array $tlds): array
    {
        $responses = Http::pool(fn ($pool) => collect($tlds)->map(
            fn ($tld) => $pool->as($tld)
                ->timeout(8)
                ->connectTimeout(5)
                ->get("{$this->baseUrl}/domains/checkAvailability", [
                    ...$this->authParams(),
                    'domainName' => $domainName,
                    'tld' => ltrim($tld, '.'),
                ])
        )->all());

        $results = [];

        foreach ($tlds as $tld) {
            $response = $responses[$tld] ?? null;

            if ($response instanceof \Throwable) {
                Log::warning("ConnectReseller availability check failed for {$domainName}{$tld}: ".$response->getMessage());
                $results[$tld] = ['available' => null, 'error' => true];

                continue;
            }

            $data = $response->json() ?? [];
            $available = null;

            if (array_key_exists('available', $data)) {
                $available = (bool) $data['available'];
            } elseif (array_key_exists('isAvailable', $data)) {
                $available = (bool) $data['isAvailable'];
            } elseif (isset($data['status'])) {
                $available = $data['status'] === 'available';
            }

            if ($available === null || ! $response->successful()) {
                Log::warning("ConnectReseller availability check returned an unrecognised response for {$domainName}{$tld}", [
                    'http_status' => $response->status(),
                    'raw' => $data,
                ]);
            }

            $results[$tld] = ['available' => $available, 'raw' => $data];
        }

        return $results;
    }

    /**
     * Single-TLD convenience wrapper around checkAvailabilityBulk(), kept for
     * any caller that only needs one TLD at a time.
     */
    public function checkAvailability(string $domainName, string $tld): array
    {
        $result = $this->checkAvailabilityBulk($domainName, [$tld])[$tld];

        return ['domain' => $domainName.$tld, ...$result];
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