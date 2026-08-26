<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Hosting renewal reminder from Abeekey</title>
</head>
<body style="font-family: Arial, sans-serif; color: #1E293B; background: #F8FAFC; padding: 24px;">
    <div style="max-width: 480px; margin: 0 auto; background: #FFFFFF; border-radius: 12px; overflow: hidden; border: 1px solid #E2E8F0;">
        <div style="background: linear-gradient(135deg, #0B1F3A, #153E75); padding: 28px;">
            <h2 style="color: #FFFFFF; margin: 0;">
                Hosting for {{ $order->domain_name }} {{ $daysRemaining <= 1 ? 'expires tomorrow' : "expires in {$daysRemaining} days" }}
            </h2>
        </div>
        <div style="padding: 28px;">
            <p>Hi {{ $order->user->name }},</p>
            <p>
                This is a reminder that hosting for
                <strong>{{ $order->domain_name }}</strong>
                ({{ $order->plan->name ?? 'your plan' }}) is set to expire on
                <strong>{{ $order->expires_at->format('d M Y') }}</strong>.
                Renewing before then keeps your site and email from going offline.
            </p>

            <p style="margin-top: 24px;">
                <a href="{{ config('app.frontend_url', env('FRONTEND_URL', 'http://localhost:3000')) }}/portal/hosting"
                   style="background: #2563EB; color: #FFFFFF; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold; display: inline-block;">
                    Renew my hosting
                </a>
            </p>

            <p style="color: #64748B; font-size: 14px; margin-top: 24px;">
                Need help, or have questions? Reach us at
                <a href="mailto:info@abeekey.com" style="color: #2563EB;">info@abeekey.com</a>
                or on WhatsApp at 0906 677 2894.
            </p>
        </div>
    </div>
</body>
</html>
