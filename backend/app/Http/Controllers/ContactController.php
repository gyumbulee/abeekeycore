<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreContactRequest;
use App\Mail\ContactMessageReceived;
use App\Mail\ContactSubmissionConfirmation;
use App\Models\ContactMessage;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class ContactController extends Controller
{
    /**
     * Store a new contact form submission and notify the Abeekey team.
     */
    public function store(StoreContactRequest $request): JsonResponse
    {
        $validated = $request->safe()->only([
            'name', 'email', 'phone', 'company', 'subject', 'message',
        ]);

        $contact = ContactMessage::create($validated);

        // The submission is already saved above — a broken/misconfigured mail
        // server should never turn a successful submission into a 500 error.
        // The 5s mail timeout (config/mail.php) should catch this first, but
        // bump execution time too as a safety net against a genuinely stuck connection.
        set_time_limit(20);

        try {
            Mail::to(config('mail.contact_notify', 'info@abeekey.com'))
                ->send(new ContactMessageReceived($contact));
        } catch (\Throwable $e) {
            Log::error('Failed to send contact notification email: '.$e->getMessage());
        }

        // Confirmation to the person who submitted the form — kept in its own
        // try/catch so a failure here never affects the team notification above
        // or turns a successful submission into a 500 error.
        try {
            Mail::to($contact->email)
                ->send(new ContactSubmissionConfirmation($contact));
        } catch (\Throwable $e) {
            Log::error('Failed to send contact confirmation email: '.$e->getMessage());
        }

        return response()->json([
            'message' => 'Thanks — we\'ve received your message and will respond shortly.',
            'data' => $contact,
        ], 201);
    }
}