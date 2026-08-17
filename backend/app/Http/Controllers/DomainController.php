<?php

namespace App\Http\Controllers;

use App\Services\ConnectResellerService;
use Illuminate\Http\Request;

class DomainController extends Controller
{
    public function __construct(
        protected ConnectResellerService $connectReseller
    ) {}

    /**
     * Search a keyword across a prioritized subset of ConnectReseller's
     * supported TLDs.
     *
     * The order is:
     *
     * 1. TLDs configured in domains.priority_tlds
     * 2. Remaining supported TLDs alphabetically
     *
     * Availability does NOT reorder the results. This means popular TLDs
     * such as .com, .net, .org, .com.ng and .ng remain at the top.
     */
    public function search(Request $request)
    {
        // Multiple outbound calls to ConnectReseller can take some time.
        set_time_limit(120);

        $validated = $request->validate([
            'query' => [
                'required',
                'string',
                'max:63',
                'regex:/^[a-zA-Z0-9-]+$/',
            ],
        ]);

        $keyword = strtolower($validated['query']);

        $catalog = $this->connectReseller->getAllTldPrices();

        if (empty($catalog)) {
            return response()->json([
                'message' => 'Domain search is temporarily unavailable. Please try again shortly.',
            ], 503);
        }

        /*
        |--------------------------------------------------------------------------
        | Select TLDs
        |--------------------------------------------------------------------------
        |
        | prioritizedTldSubset() already puts the configured popular TLDs
        | first, followed by other supported TLDs alphabetically.
        |
        */
        $tldsToCheck = $this->prioritizedTldSubset($catalog);

        $currency = config(
            'domains.default_currency',
            'NGN'
        );

        /*
        |--------------------------------------------------------------------------
        | Build full domains
        |--------------------------------------------------------------------------
        */

        $fullDomains = array_map(
            fn ($tld) => $keyword . $tld,
            $tldsToCheck
        );

        /*
        |--------------------------------------------------------------------------
        | Check availability
        |--------------------------------------------------------------------------
        */

        $availability = $this->connectReseller->checkAvailabilityBulk(
            $fullDomains
        );

        /*
        |--------------------------------------------------------------------------
        | Build results
        |--------------------------------------------------------------------------
        */

        $results = [];

        foreach ($tldsToCheck as $tld) {
            if (! isset($catalog[$tld])) {
                continue;
            }

            $pricing = $catalog[$tld];

            $fullDomain = $keyword . $tld;

            $markup = $this->connectReseller->markupMultiplier($tld);

            $results[] = [
                'domain' => $fullDomain,
                'tld' => $tld,
                'available' => $availability[$fullDomain] ?? null,
                'price' => round(
                    $pricing['cost'] * $markup,
                    2
                ),
                'currency' => $pricing['currency'] ?: $currency,
            ];
        }

        /*
        |--------------------------------------------------------------------------
        | IMPORTANT
        |--------------------------------------------------------------------------
        |
        | DO NOT sort the results here.
        |
        | $tldsToCheck is already correctly ordered by prioritizedTldSubset().
        |
        | Sorting here would destroy the configured priority and cause
        | .aaa.pro, .abogado, .ac, etc. to appear before .com.
        |
        */

        return response()->json([
            'data' => $results,
        ]);
    }

    /**
     * Priority TLDs first (that ConnectReseller actually supports), then
     * fill remaining slots alphabetically from the rest of the catalog,
     * up to search_tld_limit.
     *
     * Example:
     *
     * .com
     * .net
     * .org
     * .info
     * .biz
     * .co
     * .com.ng
     * .ng
     * ...
     * .aaa.pro
     * .abogado
     * .ac
     * ...
     */
    protected function prioritizedTldSubset(array $catalog): array
    {
        $limit = (int) config(
            'domains.search_tld_limit',
            60
        );

        $priority = config(
            'domains.priority_tlds',
            []
        );

        /*
        |--------------------------------------------------------------------------
        | Normalize configured priority TLDs
        |--------------------------------------------------------------------------
        |
        | Makes the comparison robust even if a TLD is written as "com"
        | instead of ".com".
        |
        */

        $priority = array_map(
            function ($tld) {
                $tld = strtolower(trim($tld));

                return str_starts_with($tld, '.')
                    ? $tld
                    : '.' . $tld;
            },
            $priority
        );

        /*
        |--------------------------------------------------------------------------
        | Normalize catalog keys
        |--------------------------------------------------------------------------
        */

        $catalogTlds = array_keys($catalog);

        $normalizedCatalog = [];

        foreach ($catalogTlds as $tld) {
            $normalized = strtolower(trim($tld));

            $normalized = str_starts_with($normalized, '.')
                ? $normalized
                : '.' . $normalized;

            $normalizedCatalog[$normalized] = $tld;
        }

        /*
        |--------------------------------------------------------------------------
        | Add priority TLDs first
        |--------------------------------------------------------------------------
        */

        $selected = [];

        foreach ($priority as $priorityTld) {
            if (isset($normalizedCatalog[$priorityTld])) {
                $actualTld = $normalizedCatalog[$priorityTld];

                if (! in_array($actualTld, $selected, true)) {
                    $selected[] = $actualTld;
                }
            }

            if (count($selected) >= $limit) {
                break;
            }
        }

        /*
        |--------------------------------------------------------------------------
        | Add remaining TLDs alphabetically
        |--------------------------------------------------------------------------
        */

        $remaining = array_values(
            array_diff(
                $catalogTlds,
                $selected
            )
        );

        usort(
            $remaining,
            fn ($a, $b) => strcasecmp($a, $b)
        );

        foreach ($remaining as $tld) {
            if (count($selected) >= $limit) {
                break;
            }

            $selected[] = $tld;
        }

        return array_slice(
            $selected,
            0,
            $limit
        );
    }
}