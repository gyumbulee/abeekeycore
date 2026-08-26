<?php

namespace App\Console\Commands;

use App\Mail\HostingExpiryReminderMail;
use App\Models\HostingOrder;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class SendHostingExpiryReminders extends Command
{
    protected $signature = 'hosting:send-expiry-reminders';

    protected $description = 'Email clients whose active hosting orders are approaching expires_at, per config(hosting.expiry_reminder_days).';

    /**
     * Mirrors SendDomainExpiryReminders exactly — same threshold-crossing
     * logic, same expiry_reminders_sent tracking pattern, just scoped to
     * 'active' hosting orders instead of 'registered' domain orders.
     * Deliberately does NOT auto-suspend or delete anything on expiry —
     * CloudPanel has no reversible suspend primitive (see
     * CloudPanelService docblock), so an unrenewed hosting order past its
     * expires_at just stops getting reminders once thresholds are
     * exhausted; a human decides what happens next.
     */
    public function handle(): int
    {
        $thresholds = config('hosting.expiry_reminder_days', [30, 14, 7, 1]);
        rsort($thresholds);

        $orders = HostingOrder::where('status', 'active')
            ->whereNotNull('expires_at')
            ->where('expires_at', '>', now())
            ->where('expires_at', '<=', now()->addDays(max($thresholds)))
            ->with(['user:id,name,email', 'plan:id,name'])
            ->get();

        $sent = 0;

        foreach ($orders as $order) {
            $daysRemaining = (int) now()->diffInDays($order->expires_at, false);
            $alreadySent = $order->expiry_reminders_sent ?? [];

            $thresholdToSend = null;
            foreach ($thresholds as $threshold) {
                if ($daysRemaining <= $threshold && ! in_array($threshold, $alreadySent, true)) {
                    $thresholdToSend = $threshold;
                    break;
                }
            }

            if ($thresholdToSend === null || ! $order->user) {
                continue;
            }

            try {
                Mail::to($order->user->email)->send(new HostingExpiryReminderMail($order, $daysRemaining));
                $order->update(['expiry_reminders_sent' => [...$alreadySent, $thresholdToSend]]);
                $sent++;
            } catch (\Throwable $e) {
                Log::error("Failed to send hosting expiry reminder for order #{$order->id}: ".$e->getMessage());
            }
        }

        $this->info("Sent {$sent} hosting expiry reminder(s).");

        return self::SUCCESS;
    }
}
