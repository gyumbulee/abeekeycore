<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Reply from Abeekey</title>
</head>
<body style="font-family: Arial, sans-serif; color: #1E293B; background: #F8FAFC; padding: 24px;">
    <div style="max-width: 560px; margin: 0 auto; background: #FFFFFF; border-radius: 12px; overflow: hidden; border: 1px solid #E2E8F0;">
        <div style="background: #0B1F3A; padding: 20px 28px;">
            <h2 style="color: #FFFFFF; margin: 0;">Abeekey</h2>
        </div>
        <div style="padding: 28px;">
            <p>Hi {{ $contactMessage->name }},</p>
            <p>Thanks for reaching out. Here's our reply to your message:</p>
            <div style="background: #F8FAFC; padding: 16px; border-radius: 8px; white-space: pre-line;">{{ $reply }}</div>

            <p style="color: #64748B; font-size: 13px; margin-top: 28px; border-top: 1px solid #E2E8F0; padding-top: 16px;">
                Your original message:<br>
                <em style="white-space: pre-line;">{{ $contactMessage->message }}</em>
            </p>

            <p style="color: #64748B; font-size: 14px; margin-top: 20px;">
                — The Abeekey Team ·
                <a href="mailto:info@abeekey.com" style="color: #2563EB;">info@abeekey.com</a>
            </p>
        </div>
    </div>
</body>
</html>