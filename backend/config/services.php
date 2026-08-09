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
        'reseller_id' => env('CONNECTRESELLER_RESELLER_ID'), // only used for the "available funds" check
        'base_url' => env('CONNECTRESELLER_BASE_URL', 'https://api.connectreseller.com/ConnectReseller/ESHOP'),
        // Your own Client ID in ConnectReseller's system (create one via
        // their "Add Client" API or reseller panel — all Abeekey domain
        // orders register under this single client).
        'client_id' => env('CONNECTRESELLER_CLIENT_ID'),
        // Default nameservers required by their Register API. Point these
        // at your own DNS (or ConnectReseller's default parking NS if you
        // haven't set up Abeekey's own DNS hosting yet).
        'default_nameservers' => array_filter([
            env('CONNECTRESELLER_DEFAULT_NS1'),
            env('CONNECTRESELLER_DEFAULT_NS2'),
        ]),
    ],

];