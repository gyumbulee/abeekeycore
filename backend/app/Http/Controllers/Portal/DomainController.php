<?php

namespace App\Http\Controllers\Portal;

use App\Http\Controllers\Controller;
use App\Models\DomainOrder;
use App\Models\Transaction;
use App\Services\FlutterwaveService;
use App\Services\PaymentReconciler;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class DomainController extends Controller
{
    public function __construct(
        protected FlutterwaveService $flutterwave,
        protected PaymentReconciler $reconciler,
    ) {}

    public function index(Request $request)
    {
        $orders = $request->user()->domainOrders()->latest()->get();

        return response()->json(['data' => $orders]);
    }

    /**
     * Create a domain order and start a Flutterwave checkout for it.
     * The actual registration only happens once payment is confirmed
     * (see PaymentReconciler -> DomainRegistrationProcessor).
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'domain' => ['required', 'string', 'max:63', 'regex:/^[a-zA-Z0-9-]+$/'],
            'tld' => ['required', 'string', Rule::in(array_keys(config('domains.tlds', [])))],
            'years' => ['required', 'integer', 'min:1', 'max:10'],
            'registrant' => ['required', 'array'],
            'registrant.first_name' => ['required', 'string', 'max:100'],
            'registrant.last_name' => ['required', 'string', 'max:100'],
            'registrant.email' => ['required', 'email', 'max:150'],
            'registrant.phone' => ['required', 'string', 'max:30'],
            'registrant.address' => ['required', 'string', 'max:255'],
            'registrant.city' => ['required', 'string', 'max:100'],
            'registrant.state' => ['required', 'string', 'max:100'],
            'registrant.postal_code' => ['nullable', 'string', 'max:20'],
            'registrant.country' => ['required', 'string', 'max:2'], // ISO 2-letter, e.g. NG
        ]);

        $allTlds = config('domains.tlds', []);
        $pricing = $allTlds[$validated['tld']] ?? null;

        if (! is_array($pricing)) {
            return response()->json([
                'message' => 'That TLD is not currently supported. Please try a different domain.',
            ], 422);
        }
        $years = $validated['years'];
        $domainName = strtolower($validated['domain']);
        $user = $request->user();

        $order = DomainOrder::create([
            'user_id' => $user->id,
            'domain_name' => $domainName,
            'tld' => $validated['tld'],
            'years' => $years,
            'cost_price' => $pricing['cost'] * $years,
            'sale_price' => $pricing['sale_price'] * $years,
            'currency' => config('domains.default_currency', 'NGN'),
            'status' => 'pending_payment',
            'registrant' => $validated['registrant'],
        ]);

        $txRef = 'ABK-DOM-'.strtoupper(Str::random(10));

        $transaction = Transaction::create([
            'user_id' => $user->id,
            'tx_ref' => $txRef,
            'amount' => $order->sale_price,
            'currency' => $order->currency,
            'status' => 'pending',
        ]);

        $order->update(['transaction_id' => $transaction->id]);

        $frontendUrl = rtrim(env('FRONTEND_URL', 'http://localhost:3000'), '/');

        $response = $this->flutterwave->initializePayment([
            'tx_ref' => $txRef,
            'amount' => (string) $order->sale_price,
            'currency' => $order->currency,
            'redirect_url' => "{$frontendUrl}/portal/domains/payment-callback",
            'customer' => [
                'email' => $user->email,
                'name' => $user->name,
            ],
            'customizations' => [
                'title' => 'Abeekey — Domain Registration',
                'description' => "Registration for {$domainName}{$validated['tld']} ({$years} yr)",
            ],
        ]);

        if (($response['status'] ?? null) !== 'success') {
            $transaction->update(['status' => 'failed', 'meta' => $response]);
            $order->update(['status' => 'registration_failed', 'failure_reason' => 'Payment initiation failed.']);

            return response()->json([
                'message' => $response['message'] ?? 'Unable to initiate payment. Please try again.',
            ], 502);
        }

        return response()->json([
            'data' => [
                'payment_link' => $response['data']['link'] ?? null,
                'tx_ref' => $txRef,
                'order' => $order,
            ],
        ], 201);
    }

    /**
     * Called by the frontend on redirect-back from Flutterwave — confirms
     * payment and (via PaymentReconciler -> DomainRegistrationProcessor)
     * triggers the actual domain registration.
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

        $order = DomainOrder::where('transaction_id', $transaction->id)->first();

        return response()->json(['data' => ['transaction' => $transaction, 'order' => $order]]);
    }
}