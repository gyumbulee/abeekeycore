<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>New Invoice from Abeekey</title>
</head>
<body style="font-family: Arial, sans-serif; color: #1E293B; background: #F8FAFC; padding: 24px;">
    <div style="max-width: 480px; margin: 0 auto; background: #FFFFFF; border-radius: 12px; overflow: hidden; border: 1px solid #E2E8F0;">
        <div style="background: linear-gradient(135deg, #0B1F3A, #153E75); padding: 28px;">
            <h2 style="color: #FFFFFF; margin: 0;">New invoice, {{ $invoice->user->name }}</h2>
        </div>
        <div style="padding: 28px;">
            <p>A new invoice has been issued to your account:</p>

            <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
                <tr>
                    <td style="padding: 6px 0; color: #64748B; font-size: 14px;">Invoice number</td>
                    <td style="padding: 6px 0; text-align: right; font-weight: bold;">{{ $invoice->invoice_number }}</td>
                </tr>
                <tr>
                    <td style="padding: 6px 0; color: #64748B; font-size: 14px;">Amount due</td>
                    <td style="padding: 6px 0; text-align: right; font-weight: bold; color: #0B1F3A;">
                        {{ $invoice->currency === 'NGN' ? '₦' : $invoice->currency.' ' }}{{ number_format((float) $invoice->amount_total, 2) }}
                    </td>
                </tr>
                <tr>
                    <td style="padding: 6px 0; color: #64748B; font-size: 14px;">Due date</td>
                    <td style="padding: 6px 0; text-align: right;">{{ \Carbon\Carbon::parse($invoice->due_date)->format('d M Y') }}</td>
                </tr>
            </table>

            <p style="margin-top: 24px;">
                <a href="{{ config('app.frontend_url', env('FRONTEND_URL', 'http://localhost:3000')) }}/portal/invoices"
                   style="background: #2563EB; color: #FFFFFF; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold; display: inline-block;">
                    View & pay invoice
                </a>
            </p>

            <p style="color: #64748B; font-size: 14px; margin-top: 24px;">
                Questions about this invoice? Reach us at
                <a href="mailto:info@abeekey.com" style="color: #2563EB;">info@abeekey.com</a>
                or on WhatsApp at 0906 677 2894.
            </p>
        </div>
    </div>
</body>
</html>