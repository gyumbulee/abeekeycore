<?php

namespace App\Http\Controllers;

use App\Services\ConnectResellerService;
use Illuminate\Http\Request;

class DomainController extends Controller
{
    public function __construct(protected ConnectResellerService $connectReseller) {}

    /**
     * Search a keyword across a prioritized subset of ConnectReseller's
     * supported TLDs (see config('domains.search_tld_limit') — checking
     * all several hundred live on every search isn't realistic response-time
     * wise). Public — no login required.
     */
    public function search(Request $request)
    {
        // Multiple sequential outbound calls to the registrar, each with
        // its own timeout — raise the limit so a slow (not hung) registrar
        // can't trigger PHP's fatal "Maximum execution time exceeded" error.
        set_time_limit(120);

        $validated = $request->validate([
            'query' => ['required', 'string', 'max:63', 'regex:/^[a-zA-Z0-9-]+$/'],
        ]);

        $keyword = strtolower($validated['query']);
        $catalog = $this->connectReseller->getAllTldPrices();

        if (empty($catalog)) {
            return response()->json([
                'message' => 'Domain search is temporarily unavailable. Please try again shortly.',
            ], 503);
        }

        $tldsToCheck = $this->prioritizedTldSubset($catalog);
        $currency = config('domains.default_currency', 'NGN');

        $fullDomains = array_map(fn ($tld) => $keyword.$tld, $tldsToCheck);
        $availability = $this->connectReseller->checkAvailabilityBulk($fullDomains);

        $results = [];
        foreach ($tldsToCheck as $tld) {
            $pricing = $catalog[$tld];
            $fullDomain = $keyword.$tld;
            $markup = $this->connectReseller->markupMultiplier($tld);

            $results[] = [
                'domain' => $fullDomain,
                'tld' => $tld,
                'available' => $availability[$fullDomain] ?? null,
                'price' => round($pricing['cost'] * $markup, 2),
                'currency' => $pricing['currency'] ?: $currency,
            ];
        }

        // Available domains first, then alphabetical by TLD — easier to scan.
        usort($results, function ($a, $b) {
            if ($a['available'] !== $b['available']) {
                return $a['available'] ? -1 : 1;
            }

            return strcmp($a['tld'], $b['tld']);
        });

        return response()->json(['data' => $results]);
    }

    /**
     * Priority TLDs first (that ConnectReseller actually supports), then
     * fill remaining slots alphabetically from the rest of the catalog, up
     * to search_tld_limit. All TLDs remain fully priced/registerable —
     * this only controls what gets a *live* availability check per search.
     */
    protected function prioritizedTldSubset(array $catalog): array
    {
        $limit = (int) config('domains.search_tld_limit', 60);
        $priority = config('domains.priority_tlds', []);

        $selected = array_values(array_intersect($priority, array_keys($catalog)));

        $remaining = array_diff(array_keys($catalog), $selected);
        sort($remaining);

        foreach ($remaining as $tld) {
            if (count($selected) >= $limit) {
                break;
            }
            $selected[] = $tld;
        }

        return array_slice($selected, 0, $limit);
    }
}