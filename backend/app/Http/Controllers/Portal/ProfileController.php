<?php

namespace App\Http\Controllers\Portal;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;

class ProfileController extends Controller
{
    /**
     * Update the logged-in client's name and phone.
     *
     * Email is intentionally not editable here — changing it would need to
     * re-trigger OTP verification, which is a separate concern from a
     * simple profile edit.
     */
    public function update(Request $request)
    {
        $validated = $request->validate([
            'name' => [
                'required',
                'string',
                'min:4',
                'max:120',
                'regex:/^[\pL][\pL\'\-]*(\s+[\pL][\pL\'\-]*)+$/u',
            ],
            'phone' => [
                'nullable',
                'string',
                'max:30',
                'regex:/^\+?[0-9\-\(\)\s]{7,30}$/',
            ],
        ], [
            'name.regex' => 'Please enter your full name (first and last name).',
            'phone.regex' => 'Please enter a valid phone number.',
        ]);

        $user = $request->user();

        $user->update($validated);

        return response()->json([
            'data' => $user,
        ]);
    }

    /**
     * Change the logged-in user's password.
     *
     * The current password is required before the new password is accepted.
     */
    public function updatePassword(Request $request)
    {
        $validated = $request->validate([
            'current_password' => [
                'required',
                'string',
            ],
            'password' => [
                'required',
                'confirmed',
                Password::min(8),
            ],
        ]);

        $user = $request->user();

        // Verify the current password.
        if (!Hash::check(
            $validated['current_password'],
            $user->password
        )) {
            return response()->json([
                'message' => 'Current password is incorrect.',
            ], 422);
        }

        // Save the new password.
        $user->update([
            'password' => Hash::make($validated['password']),
        ]);

        return response()->json([
            'message' => 'Password updated successfully.',
        ]);
    }
}