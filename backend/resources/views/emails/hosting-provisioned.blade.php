<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Your hosting is live — Abeekey</title>
</head>
<body style="font-family: Arial, sans-serif; color: #1E293B; background: #F8FAFC; padding: 24px;">
    <div style="max-width: 480px; margin: 0 auto; background: #FFFFFF; border-radius: 12px; overflow: hidden; border: 1px solid #E2E8F0;">
        <div style="background: linear-gradient(135deg, #0B1F3A, #153E75); padding: 28px;">
            <h2 style="color: #FFFFFF; margin: 0;">Your hosting is live!</h2>
        </div>
        <div style="padding: 28px;">
            <p>Hi {{ $order->user->name }},</p>
            <p>
                <strong>{{ $order->domain_name }}</strong> is now hosted on the
                {{ $order->plan->name }} plan. Here are your server access
                details — save these somewhere safe, as this is the only
                time the password is sent by email.
            </p>

            <table style="width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 14px;">
                <tr>
                    <td style="padding: 8px 0; color: #64748B;">SFTP / SSH host</td>
                    <td style="padding: 8px 0; text-align: right; font-family: monospace;">{{ $order->domain_name }}</td>
                </tr>
                <tr>
                    <td style="padding: 8px 0; color: #64748B;">Username</td>
                    <td style="padding: 8px 0; text-align: right; font-family: monospace;">{{ $order->site_user }}</td>
                </tr>
                <tr>
                    <td style="padding: 8px 0; color: #64748B;">Password</td>
                    <td style="padding: 8px 0; text-align: right; font-family: monospace;">{{ $siteUserPassword }}</td>
                </tr>
            </table>

            @if ($order->database_name)
                <p style="margin-top: 20px; margin-bottom: 4px;"><strong>Database</strong></p>
                <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 14px;">
                    <tr>
                        <td style="padding: 8px 0; color: #64748B;">Database name</td>
                        <td style="padding: 8px 0; text-align: right; font-family: monospace;">{{ $order->database_name }}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0; color: #64748B;">Database user</td>
                        <td style="padding: 8px 0; text-align: right; font-family: monospace;">{{ $order->database_user }}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0; color: #64748B;">Database password</td>
                        <td style="padding: 8px 0; text-align: right; font-family: monospace;">{{ $order->database_password }}</td>
                    </tr>
                </table>
            @endif

            <p style="margin-top: 24px;">
                <a href="{{ config('app.frontend_url', env('FRONTEND_URL', 'http://localhost:3000')) }}/portal/hosting"
                   style="background: #2563EB; color: #FFFFFF; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold; display: inline-block;">
                    View my hosting
                </a>
            </p>

            <p style="color: #64748B; font-size: 14px; margin-top: 24px;">
                Need a hand pointing your domain's nameservers or uploading
                your site? Reach us at
                <a href="mailto:info@abeekey.com" style="color: #2563EB;">info@abeekey.com</a>
                or on WhatsApp at 0906 677 2894.
            </p>
        </div>
    </div>
</body>
</html>
