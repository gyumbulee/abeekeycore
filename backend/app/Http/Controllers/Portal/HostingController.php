<?php

namespace App\Http\Controllers\Portal;

use App\Http\Controllers\Controller;
use App\Models\HostingOrder;
use App\Models\HostingPlan;
use App\Models\Transaction;
use App\Models\User;
use App\Services\FlutterwaveService;
use App\Services\PaymentReconciler;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class HostingController extends Controller
{
    public function __construct(
        protected FlutterwaveService $flutterwave,
        protected PaymentReconciler $reconciler,
    ) {}

    public function index(Request $request)
    {
        $orders = $request->user()->hostingOrders()->with('plan')->latest()->get();

        return response()->json(['data' => $orders]);
    }

    /**
     * Create (or resume) a hosting order and start a Flutterwave checkout.
     * Mirrors Portal\DomainController@store — reuses an existing
     * pending_payment order for the same plan+domain rather than creating
     * a duplicate if checkout was abandoned and retried.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'hosting_plan_id' => ['required', 'integer', Rule::exists('hosting_plans', 'id')->where('is_active', true)],
            'domain_name' => ['required', 'string', 'max:253', 'regex:/^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/'],
            'billing_cycle' => ['required', Rule::in(['monthly', 'annual'])],
            // Only present when the domain being hosted was registered
            // through Abeekey itself — see DomainOrder link note on the
            // hosting_orders migration.
            'domain_order_id' => ['nullable', 'integer', 'exists:domain_orders,id'],
        ]);

        $user = $request->user();
        $plan = HostingPlan::active()->findOrFail($validated['hosting_plan_id']);
        $domainName = strtolower($validated['domain_name']);

        if (! empty($validated['domain_order_id'])) {
            $domainOwned = $user->domainOrders()
                ->where('id', $validated['domain_order_id'])
                ->where('status', 'registered')
                ->exists();

            if (! $domainOwned) {
                return response()->json([
                    'message' => 'That domain order does not belong to you or is not yet registered.',
                ], 422);
            }
        }

        $salePrice = $plan->priceFor($validated['billing_cycle']);

        $order = HostingOrder::where('user_id', $user->id)
            ->where('domain_name', $domainName)
            ->where('hosting_plan_id', $plan->id)
            ->where('status', 'pending_payment')
            ->first();

        if ($order) {
            $order->update([
                'billing_cycle' => $validated['billing_cycle'],
                'sale_price' => $salePrice,
                'domain_order_id' => $validated['domain_order_id'] ?? null,
            ]);
        } else {
            $order = HostingOrder::create([
                'user_id' => $user->id,
                'hosting_plan_id' => $plan->id,
                'domain_order_id' => $validated['domain_order_id'] ?? null,
                'domain_name' => $domainName,
                'billing_cycle' => $validated['billing_cycle'],
                'cost_price' => 0, // internal capacity cost, not a billed figure — set by admin reporting later if needed
                'sale_price' => $salePrice,
                'currency' => $plan->currency,
                'status' => 'pending_payment',
            ]);
        }

        return $this->initiateCheckout($order, $user, $plan);
    }

    /**
     * Resume payment for an existing pending or failed order — same
     * "Complete Payment" pattern as Portal\DomainController@pay.
     */
    public function pay(Request $request, int $id)
    {
        $user = $request->user();
        $order = $user->hostingOrders()->with('plan')->findOrFail($id);

        // Deliberately narrower than it might look at first glance:
        // provisioning_failed means payment already succeeded and only the
        // CloudPanel step failed afterward — charging the client again
        // here would double-bill them for something that's our side to
        // fix, not theirs to re-pay for. Recovery for that state is
        // Admin\HostingController@retry, which re-runs provisioning
        // against the SAME already-paid transaction.
        if ($order->status !== 'pending_payment') {
            return response()->json([
                'message' => 'This hosting order is not awaiting payment.',
            ], 422);
        }

        return $this->initiateCheckout($order, $user, $order->plan);
    }

    protected function initiateCheckout(HostingOrder $order, User $user, HostingPlan $plan)
    {
        Transaction::where('id', $order->transaction_id)
            ->where('status', 'pending')
            ->update(['status' => 'failed']);

        $txRef = 'ABK-HOST-'.strtoupper(Str::random(10));

        $transaction = Transaction::create([
            'user_id' => $user->id,
            'tx_ref' => $txRef,
            'amount' => $order->sale_price,
            'currency' => $order->currency,
            'status' => 'pending',
        ]);

        $order->update([
            'transaction_id' => $transaction->id,
            'status' => 'pending_payment',
            'failure_reason' => null,
        ]);

        $frontendUrl = rtrim(env('FRONTEND_URL', 'http://localhost:3000'), '/');
        $cycleLabel = $order->billing_cycle === 'annual' ? 'yr' : 'mo';

        $response = $this->flutterwave->initializePayment([
            'tx_ref' => $txRef,
            'amount' => (string) $order->sale_price,
            'currency' => $order->currency,
            'redirect_url' => "{$frontendUrl}/portal/hosting/payment-callback",
            'customer' => [
                'email' => $user->email,
                'name' => $user->name,
            ],
            'customizations' => [
                'title' => 'Abeekey — Web Hosting',
                'description' => "{$plan->name} hosting for {$order->domain_name} ({$order->billing_cycle}, 1 {$cycleLabel})",
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
     * payment and (via PaymentReconciler -> HostingProvisioningProcessor)
     * triggers the actual CloudPanel site provisioning.
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

        $order = HostingOrder::where('transaction_id', $transaction->id)->with('plan')->first();

        return response()->json(['data' => ['transaction' => $transaction, 'order' => $order]]);
    }
}
