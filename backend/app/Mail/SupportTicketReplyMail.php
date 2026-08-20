<?php

namespace App\Mail;

use App\Models\SupportTicketMessage;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class SupportTicketReplyMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public SupportTicketMessage $ticketMessage)
    {
    }

    public function build()
    {
        return $this->subject("Re: {$this->ticketMessage->ticket->subject} — Abeekey Support")
            ->view('emails.support-ticket-reply');
    }
}