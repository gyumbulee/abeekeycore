<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\HostingPlan;
use Illuminate\Http\Request;

class HostingPlanController extends Controller
{
    /**
     * All plans regardless of active status — unlike the public
     * HostingController, inactive/draft plans are visible here.
     */
    public function index()
    {
        $plans = HostingPlan::orderBy('sort_order')->orderBy('price_monthly')->get();

        return response()->json(['data' => $plans]);
    }

    public function show(int $id)
    {
        return response()->json(['data' => HostingPlan::findOrFail($id)]);
    }

    protected function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:100'],
            'description' => ['nullable', 'string', 'max:1000'],
            'disk_gb' => ['required', 'integer', 'min:1'],
            'bandwidth_gb' => ['nullable', 'integer', 'min:1'],
            'website_count' => ['required', 'integer', 'min:1'],
            'email_accounts' => ['nullable', 'integer', 'min:0'],
            'databases' => ['nullable', 'integer', 'min:0'],
            'free_ssl' => ['boolean'],
            'features' => ['nullable', 'array'],
            'features.*' => ['string', 'max:150'],
            'price_monthly' => ['required', 'numeric', 'min:0'],
            'price_annual' => ['required', 'numeric', 'min:0'],
            'php_version' => ['required', 'string', 'max:10'],
            'is_active' => ['boolean'],
            'sort_order' => ['integer', 'min:0'],
        ];
    }

    public function store(Request $request)
    {
        $validated = $request->validate($this->rules());

        $plan = HostingPlan::create([
            ...$validated,
            'slug' => HostingPlan::generateUniqueSlug($validated['name']),
        ]);

        return response()->json(['data' => $plan], 201);
    }

    public function update(Request $request, int $id)
    {
        $plan = HostingPlan::findOrFail($id);

        $rules = $this->rules();
        // Every field becomes optional on update (PATCH semantics) —
        // 'sometimes' short-circuits validation for absent keys entirely.
        foreach ($rules as $field => $fieldRules) {
            array_unshift($rules[$field], 'sometimes');
        }

        $validated = $request->validate($rules);

        // Slug is intentionally NOT re-derived from a renamed plan — it's
        // set once at creation so any link to /hosting/{slug} already
        // shared (marketing page, quotation, etc.) never breaks.
        $plan->update($validated);

        return response()->json(['data' => $plan->fresh()]);
    }

    public function destroy(int $id)
    {
        $plan = HostingPlan::findOrFail($id);

        if ($plan->hostingOrders()->exists()) {
            return response()->json([
                'message' => 'This plan has existing hosting orders and cannot be deleted. Deactivate it instead.',
            ], 422);
        }

        $plan->delete();

        return response()->json(['message' => 'Plan deleted.']);
    }
}
