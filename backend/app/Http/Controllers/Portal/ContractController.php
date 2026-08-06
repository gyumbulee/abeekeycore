<?php

namespace App\Http\Controllers\Portal;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class ContractController extends Controller
{
    public function index(Request $request)
    {
        $contracts = $request->user()
            ->contracts()
            ->latest()
            ->get();

        return response()->json(['data' => $contracts]);
    }

    public function show(Request $request, int $id)
    {
        $contract = $request->user()->contracts()->findOrFail($id);

        return response()->json(['data' => $contract]);
    }
}