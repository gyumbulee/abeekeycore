<?php

namespace App\Console\Commands;

use App\Mail\DomainExpiryReminderMail;
use App\Models\DomainOrder;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class SendDomainExpiryReminders extends Command
{
    protected $signature = 'domains:send-expiry-reminders';

    protected $description = 'Email clients whose registered domains are approaching expires_at, per config(domains.expiry_reminder_days).';

    public function handle(): int
    {
        $thresholds = config('domains.expiry_reminder_days', [30, 14, 7, 1]);

        // Widest threshold first: if a domain is, say, 25 days out and this
        // is the first time the command has run for it, we want it to catch
        // the 30-day threshold as "already passed" and send the nearest
        // applicable one rather than silently waiting for the 14-day mark.
        rsort($thresholds);

        $orders = DomainOrder::where('status', 'registered')
            ->whereNotNull('expires_at')
            ->where('expires_at', '>', now())
            ->where('expires_at', '<=', now()->addDays(max($thresholds)))
            ->with('user:id,name,email')
            ->get();

        $sent = 0;

        foreach ($orders as $order) {
            $daysRemaining = (int) now()->diffInDays($order->expires_at, false);
            $alreadySent = $order->expiry_reminders_sent ?? [];

            // Find the largest threshold this order has now crossed that
            // hasn't been sent yet — e.g. if the command didn't run for a
            // few days and the order is now at 12 days (past the 14-day
            // mark), send the 14-day reminder rather than skipping straight
            // to 7.
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
                Mail::to($order->user->email)->send(new DomainExpiryReminderMail($order, $daysRemaining));
                $order->update(['expiry_reminders_sent' => [...$alreadySent, $thresholdToSend]]);
                $sent++;
            } catch (\Throwable $e) {
                Log::error("Failed to send domain expiry reminder for order #{$order->id}: ".$e->getMessage());
            }
        }

        $this->info("Sent {$sent} domain expiry reminder(s).");

        return self::SUCCESS;
    }
}
