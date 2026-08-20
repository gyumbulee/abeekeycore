<?php

namespace App\Mail;

use App\Models\Quotation;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class QuotationCreatedMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public Quotation $quotation)
    {
    }

    public function build()
    {
        return $this->subject("New Quotation {$this->quotation->quotation_number} — Abeekey")
            ->view('emails.quotation-created');
    }
}