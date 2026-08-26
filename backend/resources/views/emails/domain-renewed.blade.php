<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Domain renewed — Abeekey</title>
</head>
<body style="font-family: Arial, sans-serif; color: #1E293B; background: #F8FAFC; padding: 24px;">
    <div style="max-width: 480px; margin: 0 auto; background: #FFFFFF; border-radius: 12px; overflow: hidden; border: 1px solid #E2E8F0;">
        <div style="background: linear-gradient(135deg, #0B1F3A, #153E75); padding: 28px;">
            <h2 style="color: #FFFFFF; margin: 0;">
                {{ $renewal->domainOrder->domain_name }}{{ $renewal->domainOrder->tld }} renewed
            </h2>
        </div>
        <div style="padding: 28px;">
            <p>Hi {{ $renewal->user->name }},</p>
            <p>
                Your domain has been renewed for {{ $renewal->years }}
                {{ $renewal->years === 1 ? 'year' : 'years' }}.
            </p>

            <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
                <tr>
                    <td style="padding: 6px 0; color: #64748B; font-size: 14px;">Domain</td>
                    <td style="padding: 6px 0; text-align: right; font-weight: bold;">
                        {{ $renewal->domainOrder->domain_name }}{{ $renewal->domainOrder->tld }}
                    </td>
                </tr>
                <tr>
                    <td style="padding: 6px 0; color: #64748B; font-size: 14px;">Amount paid</td>
                    <td style="padding: 6px 0; text-align: right; font-weight: bold; color: #0B1F3A;">
                        {{ $renewal->currency === 'NGN' ? '₦' : $renewal->currency.' ' }}{{ number_format((float) $renewal->sale_price, 2) }}
                    </td>
                </tr>
                <tr>
                    <td style="padding: 6px 0; color: #64748B; font-size: 14px;">New expiry date</td>
                    <td style="padding: 6px 0; text-align: right; font-weight: bold;">
                        {{ $renewal->new_expiry_at?->format('d M Y') }}
                    </td>
                </tr>
            </table>

            <p style="margin-top: 24px;">
                <a href="{{ config('app.frontend_url', env('FRONTEND_URL', 'http://localhost:3000')) }}/portal/domains"
                   style="background: #2563EB; color: #FFFFFF; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold; display: inline-block;">
                    View my domains
                </a>
            </p>

            <p style="color: #64748B; font-size: 14px; margin-top: 24px;">
                Questions? Reach us at
                <a href="mailto:info@abeekey.com" style="color: #2563EB;">info@abeekey.com</a>
                or on WhatsApp at 0906 677 2894.
            </p>
        </div>
    </div>
</body>
</html>
