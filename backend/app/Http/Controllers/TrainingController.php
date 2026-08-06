<?php

namespace App\Http\Controllers;

use App\Models\TrainingApplication;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TrainingController extends Controller
{
    /**
     * List the three current training courses.
     */
    public function courses(): JsonResponse
    {
        return response()->json([
            'data' => [
                ['slug' => 'ms-excel', 'name' => 'Microsoft Excel', 'price' => 4500, 'sessions' => 9],
                ['slug' => 'digital-marketing', 'name' => 'Digital Marketing', 'price' => 4500, 'sessions' => 9],
                ['slug' => 'graphic-design', 'name' => 'Basic Graphic Design (Canva)', 'price' => 4500, 'sessions' => 9],
            ],
        ]);
    }

    /**
     * Store a new training application.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'full_name' => ['required', 'string', 'max:120'],
            'email' => ['required', 'email', 'max:150'],
            'phone' => ['required', 'string', 'max:30'],
            'course' => ['required', 'string', 'in:ms-excel,digital-marketing,graphic-design'],
            'preferred_batch' => ['nullable', 'string', 'max:100'],
        ]);

        $validated['payment_status'] = 'pending';

        $application = TrainingApplication::create($validated);

        return response()->json([
            'message' => 'Application received. Payment instructions will be sent to your email.',
            'data' => $application,
        ], 201);
    }
}
