<?php

namespace App\Http\Controllers\Portal;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class QuotationController extends Controller
{
    public function index(Request $request)
    {
        $quotations = $request->user()
            ->quotations()
            ->latest()
            ->get();

        return response()->json(['data' => $quotations]);
    }

    public function show(Request $request, int $id)
    {
        $quotation = $request->user()->quotations()->findOrFail($id);

        return response()->json(['data' => $quotation]);
    }

    /**
     * Client accepts or declines a quotation that's currently awaiting their response.
     */
    public function respond(Request $request, int $id)
    {
        $validated = $request->validate([
            'decision' => ['required', 'in:accepted,declined'],
        ]);

        $quotation = $request->user()->quotations()->findOrFail($id);

        if ($quotation->status !== 'sent') {
            return response()->json([
                'message' => 'This quotation has already been responded to or is no longer awaiting a decision.',
            ], 422);
        }

        $quotation->update(['status' => $validated['decision']]);

        return response()->json(['data' => $quotation]);
    }
}