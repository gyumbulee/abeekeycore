<?php

namespace App\Support;

class Permissions
{
    /**
     * Resource permissions that can be granted to a 'staff' user.
     * Admins always have every permission implicitly — see User::canAccess().
     *
     * 'users' is deliberately NOT listed here: staff management is
     * admin-only and enforced directly in User::canAccess(), never
     * grantable through the permissions array, so a staff member can never
     * escalate their own or another account's access.
     */
    public const CATALOG = [
        'leads' => 'Leads (CRM)',
        'clients' => 'Clients',
        'quotations' => 'Quotations',
        'invoices' => 'Invoices & Payments',
        'contracts' => 'Contracts',
        'domains' => 'Domains',
        'transactions' => 'Transactions',
        'contacts' => 'Contact Messages',
        'support-tickets' => 'Support Tickets',
    ];

    public static function keys(): array
    {
        return array_keys(self::CATALOG);
    }

    public static function isValidKey(string $key): bool
    {
        return array_key_exists($key, self::CATALOG);
    }

    public static function asOptions(): array
    {
        return collect(self::CATALOG)
            ->map(fn ($label, $key) => ['key' => $key, 'label' => $label])
            ->values()
            ->all();
    }
}