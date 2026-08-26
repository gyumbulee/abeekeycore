<?php

namespace App\Mail;

use App\Models\DomainRenewalOrder;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class DomainRenewedMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public DomainRenewalOrder $renewal)
    {
    }

    public function build()
    {
        $domain = $this->renewal->domainOrder->domain_name.$this->renewal->domainOrder->tld;

        return $this->subject("{$domain} renewed — Abeekey")
            ->view('emails.domain-renewed');
    }
}
