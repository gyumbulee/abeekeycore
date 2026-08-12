<?php

namespace App\Http\Controllers\Portal;

use App\Http\Controllers\Controller;
use App\Models\DomainOrder;
use App\Models\Transaction;
use App\Models\User;
use App\Services\ConnectResellerService;
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
        protected ConnectResellerService $connectReseller,
    ) {}

    public function index(Request $request)
    {
        $orders = $request->user()->domainOrders()->latest()->get();

        return response()->json(['data' => $orders]);
    }

    /**
     * Create (or resume) a domain order and start a Flutterwave checkout.
     * If the user already has a pending_payment order for this exact
     * domain+tld, we reuse it rather than creating a duplicate list entry —
     * this is what happens if someone starts registering a domain, abandons
     * checkout, then comes back and searches/registers the same domain again.
     */
    public function store(Request $request)
    {
        $catalog = $this->connectReseller->getAllTldPrices();

        $validated = $request->validate([
            'domain' => ['required', 'string', 'max:63', 'regex:/^[a-zA-Z0-9-]+$/'],
            'tld' => ['required', 'string', Rule::in(array_keys($catalog))],
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

        $pricing = $catalog[$validated['tld']] ?? null;

        if (! is_array($pricing)) {
            return response()->json([
                'message' => 'That TLD is not currently supported. Please try a different domain.',
            ], 422);
        }

        $years = $validated['years'];
        $domainName = strtolower($validated['domain']);
        $user = $request->user();
        $markup = $this->connectReseller->markupMultiplier($validated['tld']);
        $salePrice = round($pricing['cost'] * $markup * $years, 2);

        // Reuse an existing abandoned-checkout order instead of duplicating it.
        $order = DomainOrder::where('user_id', $user->id)
            ->where('domain_name', $domainName)
            ->where('tld', $validated['tld'])
            ->where('status', 'pending_payment')
            ->first();

        if ($order) {
            $order->update([
                'years' => $years,
                'cost_price' => $pricing['cost'] * $years,
                'sale_price' => $salePrice,
                'registrant' => $validated['registrant'],
            ]);
        } else {
            $order = DomainOrder::create([
                'user_id' => $user->id,
                'domain_name' => $domainName,
                'tld' => $validated['tld'],
                'years' => $years,
                'cost_price' => $pricing['cost'] * $years,
                'sale_price' => $salePrice,
                'currency' => $pricing['currency'] ?: config('domains.default_currency', 'NGN'),
                'status' => 'pending_payment',
                'registrant' => $validated['registrant'],
            ]);
        }

        return $this->initiateCheckout($order, $user);
    }

    /**
     * Resume payment for an existing pending order — used by the
     * "Complete Payment" button on the portal Domains list, so the client
     * doesn't have to re-enter registrant details to retry.
     */
    public function pay(Request $request, int $id)
    {
        $user = $request->user();
        $order = $user->domainOrders()->findOrFail($id);

        if (! in_array($order->status, ['pending_payment', 'registration_failed'], true)) {
            return response()->json([
                'message' => 'This domain order is not awaiting payment.',
            ], 422);
        }

        return $this->initiateCheckout($order, $user);
    }

    protected function initiateCheckout(DomainOrder $order, User $user)
    {
        // Any earlier abandoned attempt on this order is now superseded.
        Transaction::where('id', $order->transaction_id)
            ->where('status', 'pending')
            ->update(['status' => 'failed']);

        $txRef = 'ABK-DOM-'.strtoupper(Str::random(10));

        $transaction = Transaction::create([
            'user_id' => $user->id,
            'tx_ref' => $txRef,
            'amount' => $order->sale_price,
            'currency' => $order->currency,
            'status' => 'pending',
        ]);

        $order->update(['transaction_id' => $transaction->id, 'status' => 'pending_payment']);

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
                'description' => "Registration for {$order->domain_name}{$order->tld} ({$order->years} yr)",
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