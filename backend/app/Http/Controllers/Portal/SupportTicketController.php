<?php

namespace App\Http\Controllers\Portal;

use App\Http\Controllers\Controller;
use App\Mail\SupportTicketCreatedMail;
use App\Models\SupportTicket;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class SupportTicketController extends Controller
{
    public function index(Request $request)
    {
        $tickets = $request->user()
            ->supportTickets()
            ->latest('last_message_at')
            ->get();

        return response()->json(['data' => $tickets]);
    }

    public function show(Request $request, int $id)
    {
        $ticket = $request->user()
            ->supportTickets()
            ->with('messages.user:id,name,role')
            ->findOrFail($id);

        return response()->json(['data' => $ticket]);
    }

    /**
     * Open a new ticket. Creates the ticket and its first message together,
     * then alerts staff by email — mirrors how the public contact form
     * notifies the team, but scoped to a logged-in client's own account.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'subject' => ['required', 'string', 'min:3', 'max:150'],
            'message' => ['required', 'string', 'min:10', 'max:5000'],
            'priority' => ['nullable', 'in:low,normal,high'],
        ]);

        $user = $request->user();

        $ticket = DB::transaction(function () use ($user, $validated) {
            $ticket = SupportTicket::create([
                'user_id' => $user->id,
                'ticket_number' => 'TKT-'.now()->format('Y').'-'.str_pad((string) (SupportTicket::max('id') + 1), 4, '0', STR_PAD_LEFT),
                'subject' => $validated['subject'],
                'status' => 'open',
                'priority' => $validated['priority'] ?? 'normal',
                'last_message_at' => now(),
            ]);

            $ticket->messages()->create([
                'user_id' => $user->id,
                'is_staff' => false,
                'message' => $validated['message'],
            ]);

            return $ticket;
        });

        try {
            Mail::to(config('mail.contact_notify', 'info@abeekey.com'))
                ->send(new SupportTicketCreatedMail($ticket->load('user', 'messages')));
        } catch (\Throwable $e) {
            Log::error('Failed to send support-ticket-created notification: '.$e->getMessage());
        }

        return response()->json(['data' => $ticket->load('messages.user:id,name,role')], 201);
    }

    /**
     * Add a follow-up message to an existing ticket owned by this client.
     * Reopens the ticket if it had been marked resolved/closed, since a
     * client reply means the issue isn't fully settled from their side.
     */
    public function addMessage(Request $request, int $id)
    {
        $validated = $request->validate([
            'message' => ['required', 'string', 'min:1', 'max:5000'],
        ]);

        $ticket = $request->user()->supportTickets()->findOrFail($id);

        $message = $ticket->messages()->create([
            'user_id' => $request->user()->id,
            'is_staff' => false,
            'message' => $validated['message'],
        ]);

        $ticket->update([
            'last_message_at' => now(),
            'status' => in_array($ticket->status, ['resolved', 'closed'], true) ? 'open' : $ticket->status,
        ]);

        return response()->json(['data' => $message->load('user:id,name,role')], 201);
    }
}