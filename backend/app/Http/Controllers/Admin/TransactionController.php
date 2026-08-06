<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Transaction;

class TransactionController extends Controller
{
    public function index()
    {
        $transactions = Transaction::with(['user:id,name,email', 'invoice:id,invoice_number'])
            ->latest()
            ->get();

        return response()->json(['data' => $transactions]);
    }
}