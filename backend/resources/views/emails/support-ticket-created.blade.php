<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>New Support Ticket</title>
</head>
<body style="font-family: Arial, sans-serif; color: #1E293B; background: #F8FAFC; padding: 24px;">
    <div style="max-width: 560px; margin: 0 auto; background: #FFFFFF; border-radius: 12px; overflow: hidden; border: 1px solid #E2E8F0;">
        <div style="background: #0B1F3A; padding: 20px 28px;">
            <h2 style="color: #FFFFFF; margin: 0;">New Support Ticket</h2>
        </div>
        <div style="padding: 28px;">
            <p><strong>Ticket:</strong> {{ $ticket->ticket_number }}</p>
            <p><strong>Client:</strong> {{ $ticket->user->name }} ({{ $ticket->user->email }})</p>
            <p><strong>Priority:</strong> {{ ucfirst($ticket->priority) }}</p>
            <p><strong>Subject:</strong> {{ $ticket->subject }}</p>
            <p><strong>Message:</strong></p>
            <p style="background: #F8FAFC; padding: 16px; border-radius: 8px; white-space: pre-line;">{{ $ticket->messages->first()?->message }}</p>

            <p style="margin-top: 24px;">
                <a href="{{ config('app.frontend_url', env('FRONTEND_URL', 'http://localhost:3000')) }}/admin/support"
                   style="background: #2563EB; color: #FFFFFF; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold; display: inline-block;">
                    View in admin
                </a>
            </p>
        </div>
    </div>
</body>
</html>