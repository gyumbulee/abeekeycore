<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Mail\QuotationCreatedMail;
use App\Models\Quotation;
use App\Models\QuotationRequest;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;

class LeadController extends Controller
{
    /**
     * List all quotation-request leads, newest first, optionally filtered by status.
     */
    public function index(Request $request)
    {
        $query = QuotationRequest::query()->latest();

        if ($request->filled('status')) {
            $query->where('status', $request->string('status'));
        }

        return response()->json(['data' => $query->get()]);
    }

    public function show(int $id)
    {
        return response()->json(['data' => QuotationRequest::findOrFail($id)]);
    }

    /**
     * Convert a lead into a formal Quotation. If no user account exists yet
     * for the lead's email, one is created automatically (client role) so
     * the quotation has somewhere to live in the portal.
     */
    public function convert(Request $request, int $id)
    {
        $lead = QuotationRequest::findOrFail($id);

        $validated = $request->validate([
            'title' => ['required', 'string', 'max:180'],
            'amount_total' => ['required', 'numeric', 'min:0'],
            'currency' => ['nullable', 'string', 'size:3'],
            'valid_until' => ['nullable', 'date'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.description' => ['required', 'string', 'max:255'],
            'items.*.quantity' => ['required', 'numeric', 'min:0.01'],
            'items.*.unit_price' => ['required', 'numeric', 'min:0'],
        ]);

        $quotation = DB::transaction(function () use ($lead, $validated) {
            $user = User::firstOrCreate(
                ['email' => $lead->email],
                [
                    'name' => $lead->client_name,
                    'password' => Hash::make(Str::random(32)),
                    'role' => 'client',
                ]
            );

            $quotation = Quotation::create([
                'user_id' => $user->id,
                'quotation_request_id' => $lead->id,
                'quotation_number' => 'QUO-'.now()->format('Y').'-'.str_pad((string) (Quotation::max('id') + 1), 4, '0', STR_PAD_LEFT),
                'title' => $validated['title'],
                'amount_total' => $validated['amount_total'],
                'currency' => $validated['currency'] ?? 'NGN',
                'status' => 'sent',
                'valid_until' => $validated['valid_until'] ?? null,
                'items' => $validated['items'],
            ]);

            $lead->update(['status' => 'quoted']);

            return $quotation;
        });

        $quotation->load('user:id,name,email');

        try {
            Mail::to($quotation->user->email)->send(new QuotationCreatedMail($quotation));
        } catch (\Throwable $e) {
            Log::error('Failed to send quotation-created notification: '.$e->getMessage());
        }

        return response()->json([
            'message' => 'Lead converted to a quotation and sent to the client.',
            'data' => $quotation,
        ], 201);
    }
}