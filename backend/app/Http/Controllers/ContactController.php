<?php

namespace App\Http\Controllers;

use App\Mail\ContactMessageReceived;
use App\Models\ContactMessage;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;

class ContactController extends Controller
{
    /**
     * Store a new contact form submission and notify the Abeekey team.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'email' => ['required', 'email', 'max:150'],
            'phone' => ['nullable', 'string', 'max:30'],
            'company' => ['nullable', 'string', 'max:150'],
            'subject' => ['nullable', 'string', 'max:150'],
            'message' => ['required', 'string', 'max:5000'],
        ]);

        $contact = ContactMessage::create($validated);

        Mail::to(config('mail.contact_notify', 'info@abeekey.com'))
            ->send(new ContactMessageReceived($contact));

        return response()->json([
            'message' => 'Thanks — we\'ve received your message and will respond shortly.',
            'data' => $contact,
        ], 201);
    }
}
