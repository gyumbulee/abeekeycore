<?php

namespace App\Mail;

use App\Models\ContactMessage;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class ContactReplyMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public ContactMessage $contactMessage, public string $reply)
    {
    }

    public function build()
    {
        return $this->subject('Re: '.($this->contactMessage->subject ?: 'Your message to Abeekey'))
            ->view('emails.contact-reply');
    }
}