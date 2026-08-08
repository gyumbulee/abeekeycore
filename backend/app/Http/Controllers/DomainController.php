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

        $availability = $this->connectReseller->checkAvailabilityBulk($keyword, array_keys($tlds));

        $results = [];

        foreach ($tlds as $tld => $pricing) {
            $results[] = [
                'domain' => $keyword.$tld,
                'tld' => $tld,
                'available' => $availability[$tld]['available'] ?? null, // true | false | null (null = couldn't reach registrar)
                'price' => $pricing['sale_price'],
                'currency' => config('domains.default_currency', 'NGN'),
            ];
        }

        return response()->json(['data' => $results]);
    }
}