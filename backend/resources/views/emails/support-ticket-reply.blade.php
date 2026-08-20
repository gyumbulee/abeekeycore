<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Reply to your support ticket</title>
</head>
<body style="font-family: Arial, sans-serif; color: #1E293B; background: #F8FAFC; padding: 24px;">
    <div style="max-width: 560px; margin: 0 auto; background: #FFFFFF; border-radius: 12px; overflow: hidden; border: 1px solid #E2E8F0;">
        <div style="background: #0B1F3A; padding: 20px 28px;">
            <h2 style="color: #FFFFFF; margin: 0;">Abeekey Support</h2>
        </div>
        <div style="padding: 28px;">
            <p>Hi {{ $ticketMessage->ticket->user->name }},</p>
            <p>We've replied to your support ticket <strong>{{ $ticketMessage->ticket->ticket_number }}</strong> ({{ $ticketMessage->ticket->subject }}):</p>
            <div style="background: #F8FAFC; padding: 16px; border-radius: 8px; white-space: pre-line;">{{ $ticketMessage->message }}</div>

            <p style="margin-top: 24px;">
                <a href="{{ config('app.frontend_url', env('FRONTEND_URL', 'http://localhost:3000')) }}/portal/support"
                   style="background: #2563EB; color: #FFFFFF; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold; display: inline-block;">
                    View & reply
                </a>
            </p>

            <p style="color: #64748B; font-size: 14px; margin-top: 24px;">
                — The Abeekey Team ·
                <a href="mailto:info@abeekey.com" style="color: #2563EB;">info@abeekey.com</a>
            </p>
        </div>
    </div>
</body>
</html>