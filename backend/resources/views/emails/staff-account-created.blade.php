<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Your Abeekey staff account</title>
</head>
<body style="font-family: Arial, sans-serif; color: #1E293B; background: #F8FAFC; padding: 24px;">
    <div style="max-width: 480px; margin: 0 auto; background: #FFFFFF; border-radius: 12px; overflow: hidden; border: 1px solid #E2E8F0;">
        <div style="background: linear-gradient(135deg, #0B1F3A, #153E75); padding: 28px;">
            <h2 style="color: #FFFFFF; margin: 0;">Welcome to the team, {{ $user->name }}</h2>
        </div>
        <div style="padding: 28px;">
            <p>An Abeekey {{ $user->role === 'admin' ? 'admin' : 'staff' }} account has been created for you.</p>

            <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
                <tr>
                    <td style="padding: 6px 0; color: #64748B; font-size: 14px;">Email</td>
                    <td style="padding: 6px 0; text-align: right; font-weight: bold;">{{ $user->email }}</td>
                </tr>
                <tr>
                    <td style="padding: 6px 0; color: #64748B; font-size: 14px;">Temporary password</td>
                    <td style="padding: 6px 0; text-align: right; font-weight: bold; font-family: monospace;">{{ $temporaryPassword }}</td>
                </tr>
            </table>

            <p style="color: #64748B; font-size: 14px;">
                Please log in and change this password immediately from your Profile page.
            </p>

            <p style="margin-top: 24px;">
                <a href="{{ config('app.frontend_url', env('FRONTEND_URL', 'http://localhost:3000')) }}/login"
                   style="background: #2563EB; color: #FFFFFF; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold; display: inline-block;">
                    Log in
                </a>
            </p>
        </div>
    </div>
</body>
</html>