<?php

namespace App\Http\Controllers\Portal;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class InvoiceController extends Controller
{
    public function index(Request $request)
    {
        $invoices = $request->user()
            ->invoices()
            ->latest('issue_date')
            ->get();

        return response()->json(['data' => $invoices]);
    }

    public function show(Request $request, int $id)
    {
        $invoice = $request->user()->invoices()->findOrFail($id);

        return response()->json(['data' => $invoice]);
    }
}