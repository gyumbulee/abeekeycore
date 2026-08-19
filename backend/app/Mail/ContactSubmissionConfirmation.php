<?php

namespace App\Mail;

use App\Models\ContactMessage;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class ContactSubmissionConfirmation extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public ContactMessage $contactMessage)
    {
    }

    public function build()
    {
        return $this->subject('We\'ve received your message — Abeekey')
            ->view('emails.contact-confirmation');
    }
}