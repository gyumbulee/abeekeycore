<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>New Quotation from Abeekey</title>
</head>
<body style="font-family: Arial, sans-serif; color: #1E293B; background: #F8FAFC; padding: 24px;">
    <div style="max-width: 480px; margin: 0 auto; background: #FFFFFF; border-radius: 12px; overflow: hidden; border: 1px solid #E2E8F0;">
        <div style="background: linear-gradient(135deg, #0B1F3A, #153E75); padding: 28px;">
            <h2 style="color: #FFFFFF; margin: 0;">New quotation, {{ $quotation->user->name }}</h2>
        </div>
        <div style="padding: 28px;">
            <p>We've put together a quotation for <strong>{{ $quotation->title }}</strong>:</p>

            <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
                <tr>
                    <td style="padding: 6px 0; color: #64748B; font-size: 14px;">Quotation number</td>
                    <td style="padding: 6px 0; text-align: right; font-weight: bold;">{{ $quotation->quotation_number }}</td>
                </tr>
                <tr>
                    <td style="padding: 6px 0; color: #64748B; font-size: 14px;">Total</td>
                    <td style="padding: 6px 0; text-align: right; font-weight: bold; color: #0B1F3A;">
                        {{ $quotation->currency === 'NGN' ? '₦' : $quotation->currency.' ' }}{{ number_format((float) $quotation->amount_total, 2) }}
                    </td>
                </tr>
                @if($quotation->valid_until)
                <tr>
                    <td style="padding: 6px 0; color: #64748B; font-size: 14px;">Valid until</td>
                    <td style="padding: 6px 0; text-align: right;">{{ \Carbon\Carbon::parse($quotation->valid_until)->format('d M Y') }}</td>
                </tr>
                @endif
            </table>

            <p style="margin-top: 24px;">
                <a href="{{ config('app.frontend_url', env('FRONTEND_URL', 'http://localhost:3000')) }}/portal/quotations"
                   style="background: #2563EB; color: #FFFFFF; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold; display: inline-block;">
                    Review & respond
                </a>
            </p>

            <p style="color: #64748B; font-size: 14px; margin-top: 24px;">
                Questions about this quotation? Reach us at
                <a href="mailto:info@abeekey.com" style="color: #2563EB;">info@abeekey.com</a>
                or on WhatsApp at 0906 677 2894.
            </p>
        </div>
    </div>
</body>
</html>