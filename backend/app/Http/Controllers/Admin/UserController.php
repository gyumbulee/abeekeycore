<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Mail\StaffAccountCreatedMail;
use App\Models\User;
use App\Support\Permissions;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules\Password;

class UserController extends Controller
{
    /**
     * List every admin/staff account (not clients — see Admin\ClientController
     * for that list).
     */
    public function index()
    {
        $users = User::whereIn('role', ['admin', 'staff'])
            ->select('id', 'name', 'email', 'role', 'permissions', 'is_active', 'last_login_at', 'created_at')
            ->orderBy('name')
            ->get();

        return response()->json(['data' => $users]);
    }

    public function permissions()
    {
        return response()->json(['data' => Permissions::asOptions()]);
    }

    /**
     * Create a new staff (or admin) account. A random temporary password is
     * generated and emailed — the same pattern any invite-based system
     * uses, so the inviter never sees or sets the account's real password.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => [
                'required',
                'string',
                'min:4',
                'max:120',
                'regex:/^[\pL][\pL\'\-]*(\s+[\pL][\pL\'\-]*)+$/u',
            ],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
            'role' => ['required', 'in:admin,staff'],
            'permissions' => ['nullable', 'array'],
            'permissions.*' => ['string', 'in:'.implode(',', Permissions::keys())],
        ]);

        $temporaryPassword = Str::password(14);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($temporaryPassword),
            'role' => $validated['role'],
            // Admins ignore the permissions array entirely (see
            // User::canAccess()), but we still store whatever was submitted
            // so it's ready if the account is ever demoted to staff later.
            'permissions' => $validated['role'] === 'staff' ? ($validated['permissions'] ?? []) : [],
            'is_active' => true,
            'email_verified_at' => now(), // staff accounts skip OTP verification — an admin is vouching for them
        ]);

        try {
            Mail::to($user->email)->send(new StaffAccountCreatedMail($user, $temporaryPassword));
        } catch (\Throwable $e) {
            Log::error('Failed to send staff-account-created email: '.$e->getMessage());
        }

        return response()->json(['data' => $user], 201);
    }

    /**
     * Update role/permissions/active status for an existing staff or admin
     * account. Deactivating a user also immediately kills every active
     * session of theirs, so access is revoked right away rather than at
     * their next natural session expiry.
     */
    public function update(Request $request, int $id)
    {
        $validated = $request->validate([
            'role' => ['nullable', 'in:admin,staff'],
            'permissions' => ['nullable', 'array'],
            'permissions.*' => ['string', 'in:'.implode(',', Permissions::keys())],
            'is_active' => ['nullable', 'boolean'],
        ]);

        $user = User::whereIn('role', ['admin', 'staff'])->findOrFail($id);

        if ($user->id === $request->user()->id && array_key_exists('is_active', $validated) && ! $validated['is_active']) {
            return response()->json(['message' => 'You cannot deactivate your own account.'], 422);
        }

        $updates = array_filter([
            'role' => $validated['role'] ?? null,
            'is_active' => $validated['is_active'] ?? null,
        ], fn ($v) => $v !== null);

        if (array_key_exists('permissions', $validated)) {
            $updates['permissions'] = $validated['permissions'];
        }

        $user->update($updates);

        if (isset($validated['is_active']) && ! $validated['is_active']) {
            DB::table('sessions')->where('user_id', $user->id)->delete();
        }

        return response()->json(['data' => $user->fresh()]);
    }
}