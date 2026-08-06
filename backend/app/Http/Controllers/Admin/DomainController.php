<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\DomainOrder;

class DomainController extends Controller
{
    public function index()
    {
        $orders = DomainOrder::with('user:id,name,email')->latest()->get();

        return response()->json(['data' => $orders]);
    }
}