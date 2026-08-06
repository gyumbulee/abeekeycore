<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Invoice;
use Illuminate\Http\Request;

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

        return response()->json(['data' => $invoice->load('user:id,name,email')], 201);
    }
}