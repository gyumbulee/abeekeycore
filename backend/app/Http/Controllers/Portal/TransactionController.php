<?php

namespace App\Http\Controllers\Portal;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class TransactionController extends Controller
{
    public function index(Request $request)
    {
        $transactions = $request->user()
            ->transactions()
            ->with('invoice:id,invoice_number')
            ->latest()
            ->get();

        return response()->json(['data' => $transactions]);
    }

    public function show(Request $request, int $id)
    {
        $transaction = $request->user()
            ->transactions()
            ->with('invoice:id,invoice_number')
            ->findOrFail($id);

        return response()->json(['data' => $transaction]);
    }
}