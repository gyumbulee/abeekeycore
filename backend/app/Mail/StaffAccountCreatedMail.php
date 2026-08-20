<?php

namespace App\Mail;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class StaffAccountCreatedMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public User $user, public string $temporaryPassword)
    {
    }

    public function build()
    {
        return $this->subject('Your Abeekey staff account')
            ->view('emails.staff-account-created');
    }
}