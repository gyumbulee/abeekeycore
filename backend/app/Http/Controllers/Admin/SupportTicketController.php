<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Mail\SupportTicketReplyMail;
use App\Models\SupportTicket;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class SupportTicketController extends Controller
{
    public function index(Request $request)
    {
        $query = SupportTicket::with('user:id,name,email')->latest('last_message_at');

        if ($request->filled('status')) {
            $query->where('status', $request->string('status'));
        }

        return response()->json(['data' => $query->get()]);
    }

    public function show(int $id)
    {
        $ticket = SupportTicket::with(['user:id,name,email', 'messages.user:id,name,role'])
            ->findOrFail($id);

        return response()->json(['data' => $ticket]);
    }

    /**
     * Staff reply — adds the message, emails the client, and by default
     * moves the ticket to in_progress (unless the reply also sets a
     * different status, e.g. resolving it in the same action).
     */
    public function addMessage(Request $request, int $id)
    {
        $validated = $request->validate([
            'message' => ['required', 'string', 'min:1', 'max:5000'],
            'status' => ['nullable', 'in:open,in_progress,resolved,closed'],
        ]);

        $ticket = SupportTicket::with('user')->findOrFail($id);

        $message = $ticket->messages()->create([
            'user_id' => $request->user()->id,
            'is_staff' => true,
            'message' => $validated['message'],
        ]);

        $ticket->update([
            'last_message_at' => now(),
            'status' => $validated['status'] ?? ($ticket->status === 'open' ? 'in_progress' : $ticket->status),
        ]);

        try {
            Mail::to($ticket->user->email)
                ->send(new SupportTicketReplyMail($message->load('ticket.user')));
        } catch (\Throwable $e) {
            Log::error('Failed to send support-ticket-reply notification: '.$e->getMessage());
        }

        return response()->json(['data' => $message->load('user:id,name,role')], 201);
    }

    /**
     * Update status/priority without necessarily posting a message — e.g.
     * closing a ticket that's been resolved for a while with no reply needed.
     */
    public function update(Request $request, int $id)
    {
        $validated = $request->validate([
            'status' => ['nullable', 'in:open,in_progress,resolved,closed'],
            'priority' => ['nullable', 'in:low,normal,high'],
        ]);

        $ticket = SupportTicket::findOrFail($id);
        $ticket->update(array_filter($validated, fn ($v) => $v !== null));

        return response()->json(['data' => $ticket->load('user:id,name,email')]);
    }
}