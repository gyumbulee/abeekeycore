<?php

namespace App\Http\Controllers;

use App\Models\Transaction;
use App\Services\FlutterwaveService;
use App\Services\PaymentReconciler;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class WebhookController extends Controller
{
    public function __construct(
        protected FlutterwaveService $flutterwave,
        protected PaymentReconciler $reconciler,
    ) {}

    public function flutterwave(Request $request)
    {
        $signature = $request->header('verif-hash');
        $expected = config('services.flutterwave.webhook_hash');

        if (! $expected || $signature !== $expected) {
            Log::warning('Rejected Flutterwave webhook with invalid/missing signature.');

            return response()->json(['message' => 'Invalid signature.'], 401);
        }

        $payload = $request->input('data', []);
        $txRef = $payload['tx_ref'] ?? null;

        if (! $txRef) {
            return response()->json(['message' => 'Missing tx_ref.'], 422);
        }

        $transaction = Transaction::where('tx_ref', $txRef)->first();

        if (! $transaction) {
            Log::warning("Flutterwave webhook for unknown tx_ref: {$txRef}");

            return response()->json(['message' => 'Unknown transaction.'], 404);
        }

        // Re-verify server-to-server with Flutterwave directly rather than
        // trusting the webhook body alone (standard best practice).
        $flwId = $payload['id'] ?? null;
        $verified = $flwId ? $this->flutterwave->verifyTransaction((string) $flwId) : null;
        $verifiedData = $verified['data'] ?? $payload;

        $this->reconciler->reconcile($transaction, $verifiedData);

        return response()->json(['message' => 'Webhook processed.']);
    }
}