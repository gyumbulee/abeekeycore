<?php

return [

    'default' => env('MAIL_MAILER', 'smtp'),

    'mailers' => [
        'smtp' => [
            'transport' => 'smtp',
            'host' => env('MAIL_HOST', '127.0.0.1'),
            'port' => env('MAIL_PORT', 2525),
            'encryption' => env('MAIL_ENCRYPTION', 'tls'),
            'username' => env('MAIL_USERNAME'),
            'password' => env('MAIL_PASSWORD'),
        ],
    ],

    'from' => [
        'address' => env('MAIL_FROM_ADDRESS', 'info@abeekey.com'),
        'name' => env('MAIL_FROM_NAME', 'Abeekey'),
    ],

    // Custom: where contact form notifications are sent
    'contact_notify' => env('CONTACT_NOTIFY_EMAIL', 'info@abeekey.com'),

];
