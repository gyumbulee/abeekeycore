<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Supported TLDs & Pricing
    |--------------------------------------------------------------------------
    | PLACEHOLDER PRICES — replace with your real ConnectReseller cost per TLD
    | (visible in your reseller panel under Pricing) plus your desired markup.
    | 'cost' is what you pay ConnectReseller; 'sale_price' is what the client
    | is charged. Both in NGN, per year.
    */

    'tlds' => [
        '.com' => ['cost' => 13500, 'sale_price' => 18000],
        '.com.ng' => ['cost' => 3000, 'sale_price' => 6000],
        '.ng' => ['cost' => 45000, 'sale_price' => 55000],
        '.net' => ['cost' => 14500, 'sale_price' => 19000],
        '.org' => ['cost' => 13000, 'sale_price' => 17500],
        '.info' => ['cost' => 9000, 'sale_price' => 13000],
        '.biz' => ['cost' => 12000, 'sale_price' => 16000],
        '.co' => ['cost' => 22000, 'sale_price' => 28000],
    ],

    'default_currency' => 'NGN',
];