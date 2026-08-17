<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * Wraps the ConnectReseller ESHOP API (API_v11, confirmed against their
 * official documentation — no more guessing on this one).
 *
 * Base URL: https://api.connectreseller.com/ConnectReseller/ESHOP
 * Auth: single `APIKey` query param on every call (resellerID is only
 * needed for the "available funds" endpoint, not used here).
 *
 * Response shape (confirmed): { "responseMsg": {message, id, statusCode},
 * "responseData": {...actual payload...} }
 */
class ConnectResellerService
{
    protected string $baseUrl;
    protected string $apiKey;

    public function __construct()
    {
        $this->baseUrl = rtrim((string) config('services.connectreseller.base_url'), '/');
        $this->apiKey = (string) config('services.connectreseller.api_key');
    }

    protected function get(string $path, array $params = []): array
    {
        $response = Http::timeout(15)->connectTimeout(6)->get("{$this->baseUrl}/{$path}", [
            'APIKey' => $this->apiKey,
            ...$params,
        ]);

        return [
            'ok' => $response->successful(),
            'status' => $response->status(),
            'body' => $response->json() ?? [],
        ];
    }

    /**
     * Check availability for multiple full domains (e.g. ['abeekey.com',
     * 'abeekey.com.ng']) via ConnectReseller's bulkDomainCheck endpoint.
     * Chunks into batches of 40 — their docs say up to 200 per call, but in
     * practice large batches consistently time out (checking many domains
     * against many different TLD registries is genuinely slow on their
     * end), so smaller batches with a longer per-batch timeout are more
     * reliable than fewer, larger, timing-out requests.
     *
     * @return array<string, bool|null> keyed by full domain, true/false/null (null = couldn't determine)
     */
    public function checkAvailabilityBulk(array $fullDomains): array
    {
        if (empty($fullDomains)) {
            return [];
        }

        $availability = [];

        foreach (array_chunk($fullDomains, 40) as $chunk) {
            $availability = [...$availability, ...$this->checkAvailabilityChunk($chunk)];
        }

        return $availability;
    }

    protected function checkAvailabilityChunk(array $fullDomains): array
    {
        try {
            $result = Http::timeout(25)->connectTimeout(6)->get("{$this->baseUrl}/bulkDomainCheck", [
                'APIKey' => $this->apiKey,
                'websiteNames' => implode(',', $fullDomains),
            ]);

            $body = $result->json() ?? [];
            $records = $body['responseData'] ?? [];

            if (! is_array($records)) {
                Log::warning('ConnectReseller bulkDomainCheck returned an unexpected shape', ['body' => $body]);

                return array_fill_keys($fullDomains, null);
            }

            $availability = [];
            foreach ($records as $record) {
                $name = $record['websiteName'] ?? null;
                if ($name) {
                    $availability[$name] = isset($record['available']) ? (bool) $record['available'] : null;
                }
            }

            // Fill in any domain the response didn't mention as unknown, not "taken"
            foreach ($fullDomains as $domain) {
                if (! array_key_exists($domain, $availability)) {
                    $availability[$domain] = null;
                }
            }

            return $availability;
        } catch (\Throwable $e) {
            Log::warning('ConnectReseller bulkDomainCheck failed: '.$e->getMessage());

            return array_fill_keys($fullDomains, null);
        }
    }

    /**
     * Markup multiplier for a given TLD — checks for a per-TLD override in
     * config('domains.tld_markup_overrides'), falling back to the global
     * config('domains.markup_percent'). Returns e.g. 1.3 for a 30% markup.
     */
    public function markupMultiplier(string $tld): float
    {
        $overrides = config('domains.tld_markup_overrides', []);
        $percent = $overrides[$tld] ?? config('domains.markup_percent', 30);

        return 1 + ((float) $percent / 100);
    }
    /**
     * Fetch ALL TLDs ConnectReseller supports, with their registration
     * price, cached (see config('domains.tld_cache_hours')) since this list
     * is large and changes rarely. Keys are normalised to always have a
     * leading dot (e.g. '.com').
     *
     * @return array<string, array{cost: float, renewal: float, transfer: float, currency: string, minPeriod: int, maxPeriod: int}>
     */
    public function getAllTldPrices(): array
    {
        return Cache::remember('connectreseller_all_tld_prices', now()->addHours((int) config('domains.tld_cache_hours', 12)), function () {
            try {
                $result = $this->get('tldsync');
                $records = $result['body']['responseData'] ?? $result['body'] ?? [];

                if (! is_array($records) || empty($records)) {
                    Log::warning('ConnectReseller tldsync returned no usable TLD data', $result);

                    return [];
                }

                // Handle both a single object and an array of objects, just in case.
                if (isset($records['tld'])) {
                    $records = [$records];
                }

                $catalog = [];
                foreach ($records as $r) {
                    $tld = $r['tld'] ?? null;
                    if (! $tld) {
                        continue;
                    }
                    $tld = str_starts_with($tld, '.') ? $tld : '.'.$tld;

                    $sourceCurrency = strtoupper($r['currencyCode'] ?? config('domains.default_currency', 'NGN'));
                    $rate = $sourceCurrency === 'USD' ? (float) config('domains.usd_to_ngn_rate', 1600) : 1.0;

                    $catalog[$tld] = [
                        'cost' => round((float) ($r['registrationPrice'] ?? 0) * $rate, 2),
                        'renewal' => round((float) ($r['renewalPrice'] ?? 0) * $rate, 2),
                        'transfer' => round((float) ($r['transferPrice'] ?? 0) * $rate, 2),
                        // Always NGN after normalization above — everything else on
                        // the platform (invoices, quotations, Flutterwave) is NGN.
                        'currency' => 'NGN',
                        'minPeriod' => (int) ($r['minPeriod'] ?? 1),
                        'maxPeriod' => (int) ($r['maxPeriod'] ?? 10),
                    ];
                }

                return $catalog;
            } catch (\Throwable $e) {
                Log::error('ConnectReseller tldsync failed: '.$e->getMessage());

                return [];
            }
        });
    }

    /**
     * Add a registrant contact, returning its ConnectReseller contact ID.
     * $registrant expects: first_name, last_name, email, phone, address,
     * city, state, postal_code, country (2-letter code, e.g. NG).
     *
     * Note: phone must be split into country code + local number for their
     * API (phoneNo_cc / phoneNo). We do a simple best-effort split — if the
     * client entered a full international number, this may need refinement.
     */
    public function addRegistrantContact(array $registrant, int $clientId): ?int
    {
        [$phoneCc, $phoneLocal] = $this->splitPhone($registrant['phone']);

        $result = $this->get('AddRegistrantContact', [
            'Name' => trim($registrant['first_name'].' '.$registrant['last_name']),
            'EmailAddress' => $registrant['email'],
            'CompanyName' => $registrant['company_name'] ?? $registrant['first_name'].' '.$registrant['last_name'],
            'Address' => $registrant['address'],
            'City' => $registrant['city'],
            'StateName' => $registrant['state'],
            'CountryName' => $registrant['country'],
            'Zip' => $registrant['postal_code'] ?? '000000',
            'PhoneNo_cc' => $phoneCc,
            'PhoneNo' => $phoneLocal,
            'Id' => $clientId,
        ]);

        $id = $result['body']['responseMsg']['id'] ?? $result['body']['id'] ?? null;

        if (! $id) {
            Log::warning('ConnectReseller AddRegistrantContact did not return a contact ID', $result);
        }

        return $id ? (int) $id : null;
    }

    /**
     * Register a domain under the given ConnectReseller client ID.
     * Nameservers and client ID come from config (see config/services.php) —
     * you must have a ConnectReseller "Client" set up and default
     * nameservers configured before this will work.
     */
    public function registerDomain(string $fullDomain, int $years, int $clientId): array
    {
        $nameservers = config('services.connectreseller.default_nameservers', []);

        $result = $this->get('domainorder', [
            'ProductType' => 1,
            'Websitename' => $fullDomain,
            'Duration' => $years,
            'IsWhoisProtection' => 'true',
            'ns1' => $nameservers[0] ?? '',
            'ns2' => $nameservers[1] ?? '',
            'Id' => $clientId,
            'isEnablePremium' => 0,
        ]);

        return $result['body'];
    }

    /**
     * Look up a domain's ConnectReseller internal ID by its name — needed
     * after registration to attach the registrant contact.
     */
    public function findDomainId(string $fullDomain): ?int
    {
        $result = $this->get('ViewDomain', ['websiteName' => $fullDomain]);
        $id = $result['body']['responseData']['domainNameId'] ?? null;

        return $id ? (int) $id : null;
    }

    /**
     * Attach a contact as the admin/billing/registrant/technical contact
     * for a domain. We use the same contact ID for all four roles since we
     * only collect one set of registrant details per order.
     */
    public function assignDomainContact(int $domainNameId, string $fullDomain, int $contactId): array
    {
        $result = $this->get('updatecontact', [
            'domainNameId' => $domainNameId,
            'websiteName' => $fullDomain,
            'adminContactId' => $contactId,
            'billingContactId' => $contactId,
            'registrantContactId' => $contactId,
            'technicalContactId' => $contactId,
        ]);

        return $result['body'];
    }

    /**
     * Naive phone splitter: expects "+234..." or "234..." or a local
     * 0-prefixed Nigerian number. Falls back to country code 234 (Nigeria)
     * if we can't confidently detect one from the input.
     */
    protected function splitPhone(string $phone): array
    {
        $digits = preg_replace('/[^0-9]/', '', $phone);

        if (str_starts_with($digits, '234')) {
            return ['234', substr($digits, 3)];
        }

        if (str_starts_with($digits, '0')) {
            return ['234', substr($digits, 1)];
        }

        return ['234', $digits];
    }
}