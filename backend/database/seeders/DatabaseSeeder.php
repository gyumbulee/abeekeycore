<?php

namespace Database\Seeders;

use App\Models\Contract;
use App\Models\Invoice;
use App\Models\Quotation;
use App\Models\QuotationRequest;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        User::firstOrCreate(
            ['email' => 'info@abeekey.com'],
            [
                'name' => 'Ibrahim Muazu Muazu',
                'password' => Hash::make('5626=M&h'),
                'role' => 'admin',
            ]
        );

        $demoClient = User::firstOrCreate(
            ['email' => 'demo@abeekey.com'],
            [
                'name' => 'Demo Client',
                'password' => Hash::make('password'),
                'role' => 'client',
            ]
        );

        Invoice::firstOrCreate(
            ['invoice_number' => 'INV-2026-0001'],
            [
                'user_id' => $demoClient->id,
                'issue_date' => now()->subDays(20),
                'due_date' => now()->addDays(10),
                'amount_total' => 450000,
                'currency' => 'NGN',
                'status' => 'sent',
                'items' => [
                    ['description' => 'Website Development — Phase 1', 'quantity' => 1, 'unit_price' => 450000],
                ],
                'notes' => 'Payment due within 30 days of issue.',
            ]
        )

        $paidInvoice = Invoice::firstOrCreate(
            ['invoice_number' => 'INV-2026-0002'],
            [
                'user_id' => $demoClient->id,
                'issue_date' => now()->subDays(45),
                'due_date' => now()->subDays(15),
                'amount_total' => 135000,
                'currency' => 'NGN',
                'status' => 'paid',
                'items' => [
                    ['description' => 'Training Programme — Batch 1 Sponsorship', 'quantity' => 1, 'unit_price' => 135000],
                ],
                'paid_at' => now()->subDays(14),
            ]
        );

        Transaction::firstOrCreate(
            ['tx_ref' => 'ABK-INV-2026-0002-SEEDDEMO'],
            [
                'user_id' => $demoClient->id,
                'invoice_id' => $paidInvoice->id,
                'flw_transaction_id' => '999999',
                'amount' => 135000,
                'currency' => 'NGN',
                'status' => 'successful',
                'payment_method' => 'card',
                'receipt_number' => 'RCT-'.strtoupper(Str::random(10)),
                'paid_at' => now()->subDays(14),
                'meta' => ['note' => 'Seeded demo transaction — not a real Flutterwave payment.'],
            ]
        );

        Quotation::firstOrCreate(
            ['quotation_number' => 'QUO-2026-0001'],
            [
                'user_id' => $demoClient->id,
                'title' => 'Company Website — Phase 1',
                'amount_total' => 450000,
                'currency' => 'NGN',
                'status' => 'accepted',
                'valid_until' => now()->addDays(14),
                'items' => [
                    ['description' => 'Marketing site (5 pages)', 'quantity' => 1, 'unit_price' => 350000],
                    ['description' => 'Contact form integration', 'quantity' => 1, 'unit_price' => 100000],
                ],
            ]
        );

        Quotation::firstOrCreate(
            ['quotation_number' => 'QUO-2026-0002'],
            [
                'user_id' => $demoClient->id,
                'title' => 'Training Programme — Batch 2 Sponsorship',
                'amount_total' => 135000,
                'currency' => 'NGN',
                'status' => 'sent',
                'valid_until' => now()->addDays(14),
                'items' => [
                    ['description' => '30 trainee slots across 3 courses', 'quantity' => 30, 'unit_price' => 4500],
                ],
            ]
        );

        Contract::firstOrCreate(
            ['contract_number' => 'CON-2026-0001'],
            [
                'user_id' => $demoClient->id,
                'title' => 'Website Development Agreement',
                'summary' => 'Scope covers design, development, and deployment of the Abeekey marketing website.',
                'status' => 'active',
                'start_date' => now()->subDays(20),
                'end_date' => now()->addMonths(2),
            ]
        );

        QuotationRequest::firstOrCreate(
            ['email' => 'lead1@example.com'],
            [
                'client_name' => 'Amina Yusuf',
                'company_name' => 'Yusuf Retail Ventures',
                'phone' => '08012345678',
                'service_interest' => 'E-commerce Solutions',
                'project_summary' => 'Need an online store for our retail business with Flutterwave payments.',
                'budget_range' => '₦500,000 - ₦1,000,000',
                'status' => 'new',
            ]
        );

        QuotationRequest::firstOrCreate(
            ['email' => 'lead2@example.com'],
            [
                'client_name' => 'Chuka Okafor',
                'company_name' => 'Okafor & Co',
                'phone' => '08098765432',
                'service_interest' => 'Custom Software Development',
                'project_summary' => 'Inventory management system for a wholesale distribution business.',
                'budget_range' => '₦1,000,000+',
                'status' => 'reviewed',
            ]
        );
    }
}
