<?php

namespace App\Http\Controllers\Portal;

use App\Http\Controllers\Controller;
use App\Models\Transaction;
use App\Services\FlutterwaveService;
use App\Services\PaymentReconciler;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class PaymentController extends Controller
{
    public function __construct(
        protected FlutterwaveService $flutterwave,
        protected PaymentReconciler $reconciler,
    ) {}

    /**
     * Start a Flutterwave checkout for one of the authenticated user's invoices.
     */
    public function initiate(Request $request, int $invoiceId)
    {
        $user = $request->user();
        $invoice = $user->invoices()->findOrFail($invoiceId);

        if ($invoice->isPaid()) {
            return response()->json(['message' => 'This invoice has already been paid.'], 422);
        }

        $txRef = 'ABK-'.$invoice->invoice_number.'-'.strtoupper(Str::random(6));

        $transaction = Transaction::create([
            'user_id' => $user->id,
            'invoice_id' => $invoice->id,
            'tx_ref' => $txRef,
            'amount' => $invoice->amount_total,
            'currency' => $invoice->currency,
            'status' => 'pending',
        ]);

        $frontendUrl = rtrim(config('app.frontend_url', env('FRONTEND_URL', 'http://localhost:3000')), '/');

        $response = $this->flutterwave->initializePayment([
            'tx_ref' => $txRef,
            'amount' => (string) $invoice->amount_total,
            'currency' => $invoice->currency,
            'redirect_url' => "{$frontendUrl}/portal/invoices/payment-callback",
            'customer' => [
                'email' => $user->email,
                'name' => $user->name,
            ],
            'customizations' => [
                'title' => 'Abeekey — Invoice '.$invoice->invoice_number,
                'description' => 'Payment for invoice '.$invoice->invoice_number,
            ],
        ]);

        if (($response['status'] ?? null) !== 'success') {
            $transaction->update(['status' => 'failed', 'meta' => $response]);

            return response()->json([
                'message' => $response['message'] ?? 'Unable to initiate payment. Please try again.',
            ], 502);
        }

        $paymentData = is_array($response['data'] ?? null) ? $response['data'] : [];

        return response()->json([
            'data' => [
                'payment_link' => $paymentData['link'] ?? null,
                'tx_ref' => $txRef,
            ],
        ]);
    }

    /**
     * Called by the frontend on redirect-back from Flutterwave, to reflect the
     * result immediately rather than waiting on the webhook. The webhook remains
     * the source of truth (this is just for fast UX).
     */
    public function verify(Request $request)
    {
        $validated = $request->validate([
            'tx_ref' => ['required', 'string'],
        ]);

        $transaction = $request->user()
            ->transactions()
            ->where('tx_ref', $validated['tx_ref'])
            ->firstOrFail();

        $result = $this->flutterwave->verifyByReference($validated['tx_ref']);

        if (($result['status'] ?? null) === 'success' && isset($result['data'])) {
            $transaction = $this->reconciler->reconcile($transaction, $result['data']);
        }

        return response()->json(['data' => $transaction]);
    }
}