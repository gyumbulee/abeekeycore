<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\DomainOrder;
use App\Models\DomainRenewalOrder;

class DomainController extends Controller
{
    public function index()
    {
        $orders = DomainOrder::with('user:id,name,email')->latest()->get();

        return response()->json(['data' => $orders]);
    }

    public function renewals()
    {
        $renewals = DomainRenewalOrder::with(['user:id,name,email', 'domainOrder:id,domain_name,tld'])
            ->latest()
            ->get();

        return response()->json(['data' => $renewals]);
    }
}