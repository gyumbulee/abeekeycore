<?php

return [

    /*
    |--------------------------------------------------------------------------
    | CloudPanel SSH Connection
    |--------------------------------------------------------------------------
    | CloudPanel has no public REST API (confirmed against their own docs
    | and community feature-request threads) — clpctl, their CLI, is the
    | only supported automation surface, and it only runs locally on the
    | server as root. Services\CloudPanelService connects over SSH and
    | runs it remotely.
    |
    | Generate a dedicated keypair for this (don't reuse your personal SSH
    | key), add the public half to the server's root ~/.ssh/authorized_keys,
    | and point HOSTING_SSH_PRIVATE_KEY_PATH at the private half — e.g.
    | storage/app/private/cloudpanel_ssh_key (outside web root, not
    | committed to git).
    */
    'ssh_host' => env('HOSTING_SSH_HOST'),
    'ssh_port' => (int) env('HOSTING_SSH_PORT', 22),
    'ssh_username' => env('HOSTING_SSH_USERNAME', 'root'),
    'ssh_private_key_path' => env('HOSTING_SSH_PRIVATE_KEY_PATH', storage_path('app/private/cloudpanel_ssh_key')),
    'ssh_timeout' => (int) env('HOSTING_SSH_TIMEOUT', 30),

    'default_php_version' => env('HOSTING_DEFAULT_PHP_VERSION', '8.4'),

    /*
    |--------------------------------------------------------------------------
    | Expiry Reminders
    |--------------------------------------------------------------------------
    | Mirrors domains.expiry_reminder_days — see
    | Console\Commands\SendHostingExpiryReminders.
    */
    'expiry_reminder_days' => [30, 14, 7, 1],
];
