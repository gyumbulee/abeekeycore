<?php

namespace App\Http\Controllers;

use App\Services\ConnectResellerService;
use Illuminate\Http\Request;

class DomainController extends Controller
{
    public function __construct(protected ConnectResellerService $connectReseller) {}

    /**
     * Search a keyword/domain across all configured TLDs.
     * Public — no login required, so visitors can search from the homepage.
     */
    public function search(Request $request)
    {
        $validated = $request->validate([
            'query' => ['required', 'string', 'max:63', 'regex:/^[a-zA-Z0-9-]+$/'],
        ]);

        $keyword = strtolower($validated['query']);
        $tlds = config('domains.tlds', []);

        $fullDomains = array_map(fn ($tld) => $keyword.$tld, array_keys($tlds));

        // One request checks every TLD at once (ConnectReseller's
        // bulkDomainCheck) — no more looping per TLD.
        $availability = $this->connectReseller->checkAvailabilityBulk($fullDomains);

        $results = [];

        foreach ($tlds as $tld => $pricing) {
            $fullDomain = $keyword.$tld;

            $results[] = [
                'domain' => $fullDomain,
                'tld' => $tld,
                'available' => $availability[$fullDomain] ?? null, // true | false | null (null = couldn't reach registrar)
                'price' => $pricing['sale_price'],
                'currency' => config('domains.default_currency', 'NGN'),
            ];
        }

        return response()->json(['data' => $results]);
    }
}