<?php

namespace App\Mail;

use App\Models\HostingOrder;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class HostingExpiryReminderMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public HostingOrder $order, public int $daysRemaining)
    {
    }

    public function build()
    {
        $urgency = $this->daysRemaining <= 1 ? 'expires tomorrow' : "expires in {$this->daysRemaining} days";

        return $this->subject("Action needed: hosting for {$this->order->domain_name} {$urgency} — Abeekey")
            ->view('emails.hosting-expiry-reminder');
    }
}
