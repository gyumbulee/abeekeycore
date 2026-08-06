<?php

namespace App\Http\Controllers;

use App\Models\QuotationRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class QuotationController extends Controller
{
    /**
     * Store a new quotation/project request from a prospective client.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'client_name' => ['required', 'string', 'max:120'],
            'company_name' => ['nullable', 'string', 'max:150'],
            'email' => ['required', 'email', 'max:150'],
            'phone' => ['nullable', 'string', 'max:30'],
            'service_interest' => ['required', 'string', 'max:150'],
            'project_summary' => ['required', 'string', 'max:5000'],
            'budget_range' => ['nullable', 'string', 'max:80'],
        ]);

        $validated['status'] = 'new';

        $quotation = QuotationRequest::create($validated);

        return response()->json([
            'message' => 'Thanks — your project request has been received. We\'ll follow up with a quote soon.',
            'data' => $quotation,
        ], 201);
    }
}
