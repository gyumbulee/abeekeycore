<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Reset your password</title>
</head>
<body style="font-family: Arial, sans-serif; color: #1E293B; background: #F8FAFC; padding: 24px;">
    <div style="max-width: 480px; margin: 0 auto; background: #FFFFFF; border-radius: 12px; overflow: hidden; border: 1px solid #E2E8F0;">
        <div style="background: #0B1F3A; padding: 20px 28px;">
            <h2 style="color: #FFFFFF; margin: 0;">Abeekey</h2>
        </div>
        <div style="padding: 28px;">
            <p>Hi {{ $user->name }},</p>
            <p>We received a request to reset the password on your Abeekey account. Click the button below to choose a new password.</p>
            <div style="text-align: center; margin: 28px 0;">
                <a href="{{ $resetUrl }}" style="display: inline-block; background: #2563EB; color: #FFFFFF; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-weight: bold;">Reset Password</a>
            </div>
            <p style="color: #64748B; font-size: 14px;">This link expires in 60 minutes. If you didn't request this, you can safely ignore this email — your password will not be changed.</p>
            <p style="color: #94A3B8; font-size: 12px; word-break: break-all;">If the button doesn't work, copy and paste this link into your browser:<br>{{ $resetUrl }}</p>
        </div>
    </div>
</body>
</html>
