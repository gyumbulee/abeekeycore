<?php

namespace App\Mail;

use App\Models\SupportTicket;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class SupportTicketCreatedMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public SupportTicket $ticket)
    {
    }

    public function build()
    {
        return $this->subject("New Support Ticket {$this->ticket->ticket_number}")
            ->view('emails.support-ticket-created');
    }
}