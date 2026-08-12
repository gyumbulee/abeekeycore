<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Welcome to Abeekey</title>
</head>
<body style="font-family: Arial, sans-serif; color: #1E293B; background: #F8FAFC; padding: 24px;">
    <div style="max-width: 480px; margin: 0 auto; background: #FFFFFF; border-radius: 12px; overflow: hidden; border: 1px solid #E2E8F0;">
        <div style="background: linear-gradient(135deg, #0B1F3A, #153E75); padding: 28px;">
            <h2 style="color: #FFFFFF; margin: 0;">Welcome to Abeekey, {{ $user->name }}!</h2>
        </div>
        <div style="padding: 28px;">
            <p>Your email is verified and your account is ready. From your client portal you can:</p>
            <ul style="color: #1E293B; line-height: 1.8;">
                <li>View and pay invoices online</li>
                <li>Track and respond to quotations</li>
                <li>Review your contracts</li>
                <li>Register and manage domains</li>
            </ul>
            <p style="margin-top: 24px;">
                <a href="{{ config('app.frontend_url', env('FRONTEND_URL', 'http://localhost:3000')) }}/portal"
                   style="background: #2563EB; color: #FFFFFF; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold; display: inline-block;">
                    Go to your portal
                </a>
            </p>
            <p style="color: #64748B; font-size: 14px; margin-top: 24px;">
                Questions? Reach us anytime at
                <a href="mailto:info@abeekey.com" style="color: #2563EB;">info@abeekey.com</a>
                or on WhatsApp at 0906 677 2894.
            </p>
        </div>
    </div>
</body>
</html>