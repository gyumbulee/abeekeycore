<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Mail\QuotationCreatedMail;
use App\Models\Quotation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class QuotationController extends Controller
{
    /**
     * List all quotations across all clients, newest first.
     * Covers both leads converted via Admin\LeadController@convert and
     * standalone quotations created directly here.
     */
    public function index()
    {
        $quotations = Quotation::with('user:id,name,email')->latest()->get();

        return response()->json(['data' => $quotations]);
    }

    /**
     * Create a standalone quotation for an existing client — for cases where
     * there's no incoming QuotationRequest lead to convert (e.g. a walk-in
     * or referred client the team is quoting directly).
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'user_id' => ['required', 'exists:users,id'],
            'title' => ['required', 'string', 'max:180'],
            'amount_total' => ['required', 'numeric', 'min:0'],
            'currency' => ['nullable', 'string', 'size:3'],
            'valid_until' => ['nullable', 'date'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.description' => ['required', 'string', 'max:255'],
            'items.*.quantity' => ['required', 'numeric', 'min:0.01'],
            'items.*.unit_price' => ['required', 'numeric', 'min:0'],
        ]);

        $quotation = Quotation::create([
            'user_id' => $validated['user_id'],
            'quotation_request_id' => null,
            'quotation_number' => 'QUO-'.now()->format('Y').'-'.str_pad((string) (Quotation::max('id') + 1), 4, '0', STR_PAD_LEFT),
            'title' => $validated['title'],
            'amount_total' => $validated['amount_total'],
            'currency' => $validated['currency'] ?? 'NGN',
            'status' => 'sent',
            'valid_until' => $validated['valid_until'] ?? null,
            'items' => $validated['items'],
        ]);

        $quotation->load('user:id,name,email');

        try {
            Mail::to($quotation->user->email)->send(new QuotationCreatedMail($quotation));
        } catch (\Throwable $e) {
            Log::error('Failed to send quotation-created notification: '.$e->getMessage());
        }

        return response()->json(['data' => $quotation], 201);
    }

    /**
     * Update a quotation's status — e.g. manually marking it expired, or
     * reverting an accidental accept/decline. Client-driven accept/decline
     * still goes through Portal\QuotationController@respond.
     */
    public function update(Request $request, int $id)
    {
        $validated = $request->validate([
            'status' => ['required', 'in:draft,sent,accepted,declined,expired'],
        ]);

        $quotation = Quotation::findOrFail($id);
        $quotation->update($validated);

        return response()->json(['data' => $quotation->load('user:id,name,email')]);
    }
}