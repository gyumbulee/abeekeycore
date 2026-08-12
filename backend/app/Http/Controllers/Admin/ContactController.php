<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Mail\ContactReplyMail;
use App\Models\ContactMessage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class ContactController extends Controller
{
    public function index(Request $request)
    {
        $query = ContactMessage::query()->latest();

        if ($request->filled('status')) {
            $query->where('status', $request->string('status'));
        }

        $messages = $query->get()->append('is_registered_user');

        return response()->json(['data' => $messages]);
    }

    public function show(int $id)
    {
        $message = ContactMessage::findOrFail($id)->append('is_registered_user');

        return response()->json(['data' => $message]);
    }

    /**
     * Reply to a contact message by email — works whether or not the
     * sender has a registered Abeekey account, since we just email the
     * address they submitted the form with.
     */
    public function reply(Request $request, int $id)
    {
        $validated = $request->validate([
            'reply' => ['required', 'string', 'max:5000'],
        ]);

        $message = ContactMessage::findOrFail($id);

        try {
            Mail::to($message->email)->send(new ContactReplyMail($message, $validated['reply']));
        } catch (\Throwable $e) {
            Log::error('Failed to send contact reply email: '.$e->getMessage());

            return response()->json([
                'message' => 'Could not send the reply email. Please check mail configuration and try again.',
            ], 502);
        }

        $message->update([
            'status' => 'replied',
            'reply_message' => $validated['reply'],
            'replied_at' => now(),
            'replied_by' => $request->user()->id,
        ]);

        return response()->json(['data' => $message->append('is_registered_user')]);
    }
}