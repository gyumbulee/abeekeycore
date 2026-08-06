<?php

return [

    'flutterwave' => [
        'public_key' => env('FLUTTERWAVE_PUBLIC_KEY'),
        'secret_key' => env('FLUTTERWAVE_SECRET_KEY'),
        'webhook_hash' => env('FLUTTERWAVE_WEBHOOK_HASH'),
        'base_url' => env('FLUTTERWAVE_BASE_URL', 'https://api.flutterwave.com/v3'),
    ],

    'connectreseller' => [
        'api_key' => env('CONNECTRESELLER_API_KEY'),
        'reseller_id' => env('CONNECTRESELLER_RESELLER_ID'),
        // TODO: confirm this base URL and the auth parameter names against
        // your own reseller panel's API docs (Settings > API) before going
        // live — see app/Services/ConnectResellerService.php for details.
        'base_url' => env('CONNECTRESELLER_BASE_URL', 'https://api.connectreseller.com/ConnectReseller/APIV3'),
    ],

];