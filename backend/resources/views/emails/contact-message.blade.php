<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>New Contact Message</title>
</head>
<body style="font-family: Arial, sans-serif; color: #1E293B; background: #F8FAFC; padding: 24px;">
    <div style="max-width: 560px; margin: 0 auto; background: #FFFFFF; border-radius: 12px; overflow: hidden; border: 1px solid #E2E8F0;">
        <div style="background: #0B1F3A; padding: 20px 28px;">
            <h2 style="color: #FFFFFF; margin: 0;">New Website Enquiry</h2>
        </div>
        <div style="padding: 28px;">
            <p><strong>Name:</strong> {{ $contactMessage->name }}</p>
            <p><strong>Email:</strong> {{ $contactMessage->email }}</p>
            @if($contactMessage->phone)
                <p><strong>Phone:</strong> {{ $contactMessage->phone }}</p>
            @endif
            @if($contactMessage->company)
                <p><strong>Company:</strong> {{ $contactMessage->company }}</p>
            @endif
            @if($contactMessage->subject)
                <p><strong>Subject:</strong> {{ $contactMessage->subject }}</p>
            @endif
            <p><strong>Message:</strong></p>
            <p style="background: #F8FAFC; padding: 16px; border-radius: 8px;">{{ $contactMessage->message }}</p>
        </div>
    </div>
</body>
</html>
