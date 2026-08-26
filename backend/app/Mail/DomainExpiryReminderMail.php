<?php

namespace App\Mail;

use App\Models\DomainOrder;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class DomainExpiryReminderMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public DomainOrder $order, public int $daysRemaining)
    {
    }

    public function build()
    {
        $domain = $this->order->domain_name.$this->order->tld;
        $urgency = $this->daysRemaining <= 1 ? 'expires tomorrow' : "expires in {$this->daysRemaining} days";

        return $this->subject("Action needed: {$domain} {$urgency} — Abeekey")
            ->view('emails.domain-expiry-reminder');
    }
}
