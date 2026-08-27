<?php
namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Mail\OtpVerificationMail;
use App\Mail\PasswordResetMail;
use App\Mail\WelcomeMail;
use App\Models\EmailOtp;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Password;
use Illuminate\Validation\Rules\Password as PasswordRule;

class AuthController extends Controller
{
    /**
     * Register a new client-portal user. Does NOT log the user in — an
     * email OTP must be verified first (see verifyOtp()) before the account
     * can be used. Staff/admin accounts should be created via seeder or
     * admin action, not this endpoint.
     */
    public function register(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'confirmed', PasswordRule::min(8)],
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role' => 'client',
        ]);

        $this->issueOtp($user);

        return response()->json([
            'message' => 'Account created. Check your email for a verification code.',
            'data' => ['email' => $user->email, 'requires_verification' => true],
        ], 201);
    }

    /**
     * Verify the OTP sent during registration (or via resend). On success,
     * marks the account verified, logs the user in, and sends a welcome email.
     */
    public function verifyOtp(Request $request)
    {
        $validated = $request->validate([
            'email' => ['required', 'email'],
            'code' => ['required', 'string', 'size:6'],
        ]);

        $user = User::where('email', $validated['email'])->first();

        if (! $user) {
            return response()->json(['message' => 'Invalid email or code.'], 422);
        }

        $otp = $user->otps()
            ->whereNull('consumed_at')
            ->latest()
            ->first();

        if (! $otp || ! $otp->isValid()) {
            return response()->json(['message' => 'This code is invalid or has expired.'], 422);
        }

        if ($otp->code !== $validated['code']) {
            $otp->increment('attempts');

            return response()->json(['message' => 'This code is invalid or has expired.'], 422);
        }

        $otp->update(['consumed_at' => now()]);
        $user->update([
            'email_verified_at' => now(),
            'last_login_at' => now(),
            'last_login_ip' => $request->ip(),
        ]);

        Auth::login($user);
        $request->session()->regenerate();

        try {
            Mail::to($user->email)->send(new WelcomeMail($user));
        } catch (\Throwable $e) {
            Log::error('Failed to send welcome email: '.$e->getMessage());
        }

        return response()->json(['data' => $user]);
    }

    /**
     * Resend a fresh OTP (invalidating any previous unconsumed one).
     */
    public function resendOtp(Request $request)
    {
        $validated = $request->validate([
            'email' => ['required', 'email'],
        ]);

        $user = User::where('email', $validated['email'])->first();

        // Deliberately vague response either way, so this can't be used to
        // enumerate which emails have accounts.
        if ($user && ! $user->email_verified_at) {
            $this->issueOtp($user);
        }

        return response()->json(['message' => 'If that email needs verification, a new code has been sent.']);
    }

    public function login(Request $request)
    {
        $credentials = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required'],
        ]);

        if (! Auth::attempt($credentials, $request->boolean('remember'))) {
            return response()->json([
                'message' => 'These credentials do not match our records.',
            ], 422);
        }

        $user = Auth::user();

        if (! $user->is_active) {
            Auth::logout();

            return response()->json([
                'message' => 'This account has been deactivated. Please contact Abeekey support.',
            ], 403);
        }

        if (! $user->email_verified_at) {
            Auth::logout();
            $this->issueOtp($user);

            return response()->json([
                'message' => 'Please verify your email to continue. We\'ve sent a new code.',
                'requires_verification' => true,
                'email' => $user->email,
            ], 403);
        }

        $user->update([
            'last_login_at' => now(),
            'last_login_ip' => $request->ip(),
        ]);

        $request->session()->regenerate();

        return response()->json(['data' => $user]);
    }

    public function logout(Request $request)
    {
        Auth::guard('web')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return response()->json(['message' => 'Logged out.']);
    }

    public function me(Request $request)
    {
        return response()->json(['data' => $request->user()]);
    }

    /**
     * Send a password reset link. Deliberately returns the same message
     * whether or not the email has an account, to avoid leaking which
     * emails are registered — same pattern as resendOtp().
     */
    public function forgotPassword(Request $request)
    {
        $validated = $request->validate([
            'email' => ['required', 'email'],
        ]);

        $frontendUrl = rtrim(env('FRONTEND_URL', 'http://localhost:3000'), '/');

        Password::sendResetLink(
            $validated,
            function (User $user, string $token) use ($frontendUrl) {
                $resetUrl = $frontendUrl.'/reset-password?token='.$token.'&email='.urlencode($user->email);

                try {
                    Mail::to($user->email)->send(new PasswordResetMail($user, $resetUrl));
                } catch (\Throwable $e) {
                    Log::error('Failed to send password reset email: '.$e->getMessage());
                }
            }
        );

        return response()->json([
            'message' => 'If that email has an account, a password reset link has been sent.',
        ]);
    }

    /**
     * Complete a password reset using the token emailed via forgotPassword().
     * Logs out every other session for the account once the password is
     * changed, same as a self-service security measure.
     */
    public function resetPassword(Request $request)
    {
        $validated = $request->validate([
            'email' => ['required', 'email'],
            'token' => ['required', 'string'],
            'password' => ['required', 'confirmed', PasswordRule::min(8)],
        ]);

        $status = Password::reset(
            $validated,
            function (User $user) use ($validated) {
                $user->update(['password' => Hash::make($validated['password'])]);
                DB::table('sessions')->where('user_id', $user->id)->delete();
            }
        );

        if ($status !== Password::PASSWORD_RESET) {
            return response()->json([
                'message' => 'This reset link is invalid or has expired. Please request a new one.',
            ], 422);
        }

        return response()->json(['message' => 'Your password has been reset. You can now log in.']);
    }

    protected function issueOtp(User $user): void
    {
        // Invalidate any earlier unconsumed codes for this user.
        $user->otps()->whereNull('consumed_at')->update(['consumed_at' => now()]);

        $code = str_pad((string) random_int(0, 999999), 6, '0', STR_PAD_LEFT);

        $otp = $user->otps()->create([
            'code' => $code,
            'expires_at' => now()->addMinutes(10),
        ]);

        try {
            Mail::to($user->email)->send(new OtpVerificationMail($user, $otp->code));
        } catch (\Throwable $e) {
            Log::error('Failed to send OTP email: '.$e->getMessage());
        }
    }
}