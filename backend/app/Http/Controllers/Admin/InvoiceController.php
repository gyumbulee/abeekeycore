<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Mail\InvoiceCreatedMail;
use App\Models\Invoice;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;

class InvoiceController extends Controller
{
    public function index()
    {
        $invoices = Invoice::with('user:id,name,email')->latest('issue_date')->get();

        return response()->json(['data' => $invoices]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'user_id' => ['required', 'exists:users,id'],
            'issue_date' => ['required', 'date'],
            'due_date' => ['required', 'date', 'after_or_equal:issue_date'],
            'currency' => ['nullable', 'string', 'size:3'],
            'notes' => ['nullable', 'string'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.description' => ['required', 'string', 'max:255'],
            'items.*.quantity' => ['required', 'numeric', 'min:0.01'],
            'items.*.unit_price' => ['required', 'numeric', 'min:0'],
        ]);

        $amountTotal = collect($validated['items'])
            ->sum(fn ($item) => $item['quantity'] * $item['unit_price']);

        $invoice = Invoice::create([
            'user_id' => $validated['user_id'],
            'invoice_number' => 'INV-'.now()->format('Y').'-'.str_pad((string) (Invoice::max('id') + 1), 4, '0', STR_PAD_LEFT),
            'issue_date' => $validated['issue_date'],
            'due_date' => $validated['due_date'],
            'amount_total' => $amountTotal,
            'currency' => $validated['currency'] ?? 'NGN',
            'status' => 'sent',
            'items' => $validated['items'],
            'notes' => $validated['notes'] ?? null,
        ]);

        $invoice->load('user:id,name,email');

        try {
            Mail::to($invoice->user->email)->send(new InvoiceCreatedMail($invoice));
        } catch (\Throwable $e) {
            Log::error('Failed to send invoice-created notification: '.$e->getMessage());
        }

        return response()->json(['data' => $invoice], 201);
    }

    /**
     * Mark an invoice as paid manually — for offline payments (bank
     * transfer, cash, POS) that don't go through the Flutterwave flow.
     * Creates a Transaction record so it shows up consistently alongside
     * webhook-reconciled payments in Transactions/receipts.
     */
    public function markPaid(Request $request, int $id)
    {
        $validated = $request->validate([
            'payment_method' => ['required', 'string', 'max:50'], // e.g. bank_transfer, cash, pos
            'reference' => ['nullable', 'string', 'max:100'],
            'note' => ['nullable', 'string', 'max:500'],
        ]);

        $invoice = Invoice::findOrFail($id);

        if ($invoice->isPaid()) {
            return response()->json(['message' => 'This invoice is already marked as paid.'], 422);
        }

        $invoice = DB::transaction(function () use ($invoice, $validated, $request) {
            Transaction::create([
                'user_id' => $invoice->user_id,
                'invoice_id' => $invoice->id,
                'tx_ref' => 'MANUAL-'.strtoupper(Str::random(12)),
                'flw_transaction_id' => null,
                'amount' => $invoice->amount_total,
                'currency' => $invoice->currency,
                'status' => 'successful',
                'payment_method' => $validated['payment_method'],
                'receipt_number' => 'RCT-'.strtoupper(Str::random(10)),
                'paid_at' => now(),
                'meta' => [
                    'recorded_manually_by' => $request->user()->id,
                    'reference' => $validated['reference'] ?? null,
                    'note' => $validated['note'] ?? null,
                ],
            ]);

            $invoice->update(['status' => 'paid', 'paid_at' => now()]);

            return $invoice->fresh();
        });

        return response()->json(['data' => $invoice->load('user:id,name,email')]);
    }
}