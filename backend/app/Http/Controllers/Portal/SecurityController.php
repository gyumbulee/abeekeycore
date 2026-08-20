<?php

namespace App\Http\Controllers\Portal;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class SecurityController extends Controller
{
    /**
     * Last known login + every active session for this account, sourced
     * from the database session store (SESSION_DRIVER=database) — one row
     * per browser/device currently signed in.
     */
    public function index(Request $request)
    {
        $user = $request->user();
        $currentSessionId = $request->session()->getId();

        $sessions = DB::table('sessions')
            ->where('user_id', $user->id)
            ->orderByDesc('last_activity')
            ->get()
            ->map(fn ($session) => [
                'id' => $session->id,
                'ip_address' => $session->ip_address,
                'device' => $this->parseUserAgent($session->user_agent),
                'last_active_at' => date('c', $session->last_activity),
                'is_current_device' => $session->id === $currentSessionId,
            ]);

        return response()->json([
            'data' => [
                'last_login_at' => $user->last_login_at,
                'last_login_ip' => $user->last_login_ip,
                'sessions' => $sessions,
            ],
        ]);
    }

    /**
     * Sign out every other active session for this account. Requires the
     * current password to confirm identity, since this is a
     * security-sensitive action — same pattern as Portal\ProfileController.
     */
    public function logoutOtherSessions(Request $request)
    {
        $validated = $request->validate([
            'password' => ['required', 'string'],
        ]);

        $user = $request->user();

        if (! Hash::check($validated['password'], $user->password)) {
            return response()->json(['message' => 'Password is incorrect.'], 422);
        }

        $currentSessionId = $request->session()->getId();

        DB::table('sessions')
            ->where('user_id', $user->id)
            ->where('id', '!=', $currentSessionId)
            ->delete();

        return response()->json(['message' => 'All other sessions have been logged out.']);
    }

    /**
     * Lightweight, dependency-free user-agent parser — good enough to show
     * "Chrome on Windows" style labels without pulling in a package.
     */
    protected function parseUserAgent(?string $userAgent): string
    {
        if (! $userAgent) {
            return 'Unknown device';
        }

        $browser = match (true) {
            str_contains($userAgent, 'Edg/') => 'Edge',
            str_contains($userAgent, 'OPR/') || str_contains($userAgent, 'Opera') => 'Opera',
            str_contains($userAgent, 'CriOS/') => 'Chrome',
            str_contains($userAgent, 'Chrome/') && ! str_contains($userAgent, 'Chromium') => 'Chrome',
            str_contains($userAgent, 'FxiOS/') => 'Firefox',
            str_contains($userAgent, 'Firefox/') => 'Firefox',
            str_contains($userAgent, 'Safari/') && str_contains($userAgent, 'Version/') => 'Safari',
            default => 'Browser',
        };

        $platform = match (true) {
            str_contains($userAgent, 'Windows') => 'Windows',
            str_contains($userAgent, 'iPhone') => 'iPhone',
            str_contains($userAgent, 'iPad') => 'iPad',
            str_contains($userAgent, 'Macintosh'), str_contains($userAgent, 'Mac OS X') => 'Mac',
            str_contains($userAgent, 'Android') => 'Android',
            str_contains($userAgent, 'Linux') => 'Linux',
            default => 'Unknown device',
        };

        return "{$browser} on {$platform}";
    }
}