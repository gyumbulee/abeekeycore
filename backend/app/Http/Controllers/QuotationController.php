<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreQuotationRequest;
use App\Models\QuotationRequest;
use Illuminate\Http\JsonResponse;

class QuotationController extends Controller
{
    /**
     * Store a new quotation/project request from a prospective client.
     */
    public function store(StoreQuotationRequest $request): JsonResponse
    {
        $validated = $request->safe()->only([
            'client_name', 'company_name', 'email', 'phone',
            'service_interest', 'project_summary', 'budget_range',
        ]);

        $validated['status'] = 'new';

        $quotation = QuotationRequest::create($validated);

        return response()->json([
            'message' => 'Thanks — your project request has been received. We\'ll follow up with a quote soon.',
            'data' => $quotation,
        ], 201);
    }
}