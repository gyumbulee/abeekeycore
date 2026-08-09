<?php

namespace App\Services;

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
     * 'abeekey.com.ng']) in a single request via ConnectReseller's
     * bulkDomainCheck endpoint (max 200 domains per call).
     *
     * @return array<string, bool|null> keyed by full domain, true/false/null (null = couldn't determine)
     */
    public function checkAvailabilityBulk(array $fullDomains): array
    {
        if (empty($fullDomains)) {
            return [];
        }

        try {
            $result = $this->get('bulkDomainCheck', [
                'websiteNames' => implode(',', $fullDomains),
            ]);

            $records = $result['body']['responseData'] ?? [];

            if (! is_array($records)) {
                Log::warning('ConnectReseller bulkDomainCheck returned an unexpected shape', $result);

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