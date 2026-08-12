<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Verify your email</title>
</head>
<body style="font-family: Arial, sans-serif; color: #1E293B; background: #F8FAFC; padding: 24px;">
    <div style="max-width: 480px; margin: 0 auto; background: #FFFFFF; border-radius: 12px; overflow: hidden; border: 1px solid #E2E8F0;">
        <div style="background: #0B1F3A; padding: 20px 28px;">
            <h2 style="color: #FFFFFF; margin: 0;">Abeekey</h2>
        </div>
        <div style="padding: 28px;">
            <p>Hi {{ $user->name }},</p>
            <p>Use the code below to verify your email address and finish creating your Abeekey account.</p>
            <div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; padding: 20px; text-align: center; margin: 24px 0;">
                <span style="font-family: 'Courier New', monospace; font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #0B1F3A;">{{ $code }}</span>
            </div>
            <p style="color: #64748B; font-size: 14px;">This code expires in 10 minutes. If you didn't request this, you can safely ignore this email.</p>
        </div>
    </div>
</body>
</html>