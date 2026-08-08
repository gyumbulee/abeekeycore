<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Contract;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class ContractController extends Controller
{
    /**
     * List all contracts.
     */
    public function index(): JsonResponse
    {
        $contracts = Contract::with('user:id,name,email')
            ->latest()
            ->get();

        return response()->json([
            'data' => $contracts,
        ]);
    }

    /**
     * Create a new contract.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'user_id' => [
                'required',
                'integer',
                'exists:users,id',
            ],
            'contract_number' => [
                'required',
                'string',
                'max:100',
                'unique:contracts,contract_number',
            ],
            'title' => [
                'required',
                'string',
                'max:255',
            ],
            'summary' => [
                'nullable',
                'string',
            ],
            'status' => [
                'required',
                'string',
                Rule::in([
    'draft',
    'sent',
    'signed',
    'active',
    'completed',
    'terminated',
]),
            ],
            'start_date' => [
                'nullable',
                'date',
            ],
            'end_date' => [
                'nullable',
                'date',
                'after_or_equal:start_date',
            ],
            'file_path' => [
                'nullable',
                'string',
                'max:500',
            ],
        ]);

        $contract = Contract::create($validated);

        return response()->json([
            'message' => 'Contract created successfully.',
            'data' => $contract->load('user:id,name,email'),
        ], 201);
    }
}