<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Gate for the whole /admin area. Admits 'admin' and 'staff' roles alike —
 * resource-level access is then narrowed by the `permission:{key}`
 * middleware (see EnsureUserHasPermission) on individual route groups.
 * A deactivated account is blocked here regardless of role.
 */
class EnsureUserIsAdmin
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (! $user || ! in_array($user->role, ['admin', 'staff'], true) || ! $user->is_active) {
            return response()->json([
                'message' => 'You do not have permission to access this resource.',
            ], 403);
        }

        return $next($request);
    }
}