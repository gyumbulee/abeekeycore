<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\HostingOrder;
use App\Services\CloudPanelService;
use App\Services\HostingProvisioningProcessor;
use Illuminate\Support\Facades\Log;

class HostingController extends Controller
{
    public function __construct(
        protected HostingProvisioningProcessor $provisioner,
        protected CloudPanelService $cloudPanel,
    ) {}

    public function index()
    {
        $orders = HostingOrder::with(['user:id,name,email', 'plan:id,name'])->latest()->get();

        return response()->json(['data' => $orders]);
    }

    public function show(int $id)
    {
        $order = HostingOrder::with(['user:id,name,email', 'plan', 'domainOrder'])->findOrFail($id);

        return response()->json(['data' => $order]);
    }

    /**
     * Re-attempt CloudPanel provisioning for an order stuck in
     * provisioning_failed — e.g. after fixing an SSH connectivity issue or
     * a bad plan config. Runs synchronously and returns the updated order,
     * same as the original post-payment attempt.
     */
    public function retry(int $id)
    {
        $order = HostingOrder::findOrFail($id);

        try {
            $this->provisioner->retry($order);
        } catch (\RuntimeException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }

        return response()->json(['data' => $order->fresh(['user:id,name,email', 'plan'])]);
    }

    /**
     * Permanently cancels a hosting order and deletes the actual site on
     * the server — irreversible (see CloudPanelService::deleteSite()
     * docblock: CloudPanel has no reversible suspend, only delete). Only
     * meaningful for orders that reached 'active' at some point; orders
     * still 'pending_payment' or that never provisioned are just marked
     * cancelled with no server-side action needed.
     */
    public function cancel(int $id)
    {
        $order = HostingOrder::findOrFail($id);

        if (in_array($order->status, ['cancelled'], true)) {
            return response()->json(['message' => 'This order is already cancelled.'], 422);
        }

        if ($order->status === 'active' && $order->site_user) {
            try {
                $result = $this->cloudPanel->deleteSite($order->domain_name);

                if (! ($result['ok'] ?? false)) {
                    return response()->json([
                        'message' => 'Failed to delete the site on the server. It was NOT marked cancelled — check server connectivity and try again.',
                        'detail' => $result['output'] ?? null,
                    ], 502);
                }
            } catch (\Throwable $e) {
                Log::error("Failed to delete CloudPanel site for hosting order #{$order->id}: ".$e->getMessage());

                return response()->json([
                    'message' => 'Failed to reach the hosting server to delete the site. The order was NOT marked cancelled.',
                ], 502);
            }
        }

        $order->update(['status' => 'cancelled']);

        return response()->json(['data' => $order->fresh(['user:id,name,email', 'plan'])]);
    }
}
