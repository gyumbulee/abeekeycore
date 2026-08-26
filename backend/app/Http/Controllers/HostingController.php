<?php

namespace App\Http\Controllers;

use App\Models\HostingPlan;

class HostingController extends Controller
{
    public function index()
    {
        $plans = HostingPlan::active()->orderBy('sort_order')->orderBy('price_monthly')->get();

        return response()->json(['data' => $plans]);
    }

    public function show(string $slug)
    {
        $plan = HostingPlan::active()->where('slug', $slug)->firstOrFail();

        return response()->json(['data' => $plan]);
    }
}
