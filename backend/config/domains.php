<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Domain Pricing
    |--------------------------------------------------------------------------
    | TLDs and their base cost come live from ConnectReseller's "Get all TLD
    | Prices" endpoint (tldsync), cached — see
    | ConnectResellerService::getAllTldPrices(). This markup is applied on
    | top of their registration price to get what the client pays.
    */

    // Default markup applied to any TLD not listed in tld_markup_overrides below.
    'markup_percent' => env('DOMAIN_MARKUP_PERCENT', 30),

    // Set your own margin per TLD here, e.g. '.com' => 40 means .com sells
    // at ConnectReseller's cost + 40%. Anything not listed here falls back
    // to markup_percent above. Add as many TLDs as you like.
    'tld_markup_overrides' => [
        '.com' => (float) env('DOMAIN_MARKUP_COM', 30),
        '.com.ng' => (float) env('DOMAIN_MARKUP_COM_NG', 60),
        '.ng' => (float) env('DOMAIN_MARKUP_NG', 25),
        '.net' => (float) env('DOMAIN_MARKUP_NET', 30),
        '.org' => (float) env('DOMAIN_MARKUP_ORG', 30),
    ],

    'default_currency' => 'NGN',

    /*
    |--------------------------------------------------------------------------
    | Currency Normalization
    |--------------------------------------------------------------------------
    | ConnectReseller quotes prices in USD (their international default) —
    | everything else on this platform (invoices, quotations, Flutterwave
    | charges) is in NGN. Rather than pass through whatever currency they
    | report (which caused search/checkout to show wildly different, and
    | inconsistent, numbers), we convert once here so search results, order
    | creation, and the actual Flutterwave charge are always in NGN.
    |
    | Update this rate periodically to track the real exchange rate — it's
    | not fetched live, since domain pricing shouldn't fluctuate day to day.
    */
    'usd_to_ngn_rate' => (float) env('DOMAIN_USD_TO_NGN_RATE', 1600),

    // How long to cache ConnectReseller's TLD price list before refetching.
    'tld_cache_hours' => 12,

    /*
    |--------------------------------------------------------------------------
    | Search Limits
    |--------------------------------------------------------------------------
    | ConnectReseller's bulkDomainCheck genuinely takes a while per batch —
    | checking every TLD they support (400+) live on every keystroke isn't
    | realistic for a synchronous search response. We prioritize the TLDs
    | below, then fill remaining slots alphabetically from the rest of the
    | catalog, up to this limit. All TLDs are still fully supported for
    | pricing/registration — this only limits how many get a live
    | availability check on the homepage search.
    */
    'search_tld_limit' => (int) env('DOMAIN_SEARCH_TLD_LIMIT', 60),

'priority_tlds' => [
    '.com',
    '.net',
    '.org',
    '.info',
    '.biz',
    '.co',

    '.com.ng',
    '.ng',
    '.org.ng',
    '.net.ng',

    '.io',
    '.ai',
    '.app',
    '.dev',
    '.tech',
    '.xyz',
    '.cloud',

    '.online',
    '.site',
    '.website',
    '.store',
    '.shop',
    '.blog',

    '.company',
    '.business',
    '.agency',
    '.digital',
    '.services',
    '.solutions',

    '.me',
    '.tv',
    '.cc',
    '.pro',
    '.name',
    '.mobi',
    '.club',
    '.live',
    '.space',
    '.world',

    '.uk',
    '.co.uk',
    '.us',
    '.ca',
    '.de',
    '.in',
],
];