<?php

namespace App\Mail;

use App\Models\HostingOrder;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class HostingProvisionedMail extends Mailable
{
    use Queueable, SerializesModels;

    /**
     * $siteUserPassword is passed explicitly rather than read off the
     * order — HostingOrder::$hidden excludes it from array/JSON output,
     * but Eloquent attributes are still directly readable via property
     * access, so passing it as a plain constructor argument keeps the
     * "only ever sent once, right after generation" intent explicit
     * rather than relying on the model's hidden list elsewhere.
     */
    public function __construct(public HostingOrder $order, public string $siteUserPassword)
    {
    }

    public function build()
    {
        return $this->subject("Your hosting for {$this->order->domain_name} is live — Abeekey")
            ->view('emails.hosting-provisioned');
    }
}
