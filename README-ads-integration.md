# Ad monetization integration — abeekeycore

Adds AdSense + Monetag support to the Next.js frontend, gated behind a consent
banner (NDPR-friendly), without touching your Laravel backend.

## 1. Copy files into the repo

```
components/AdSlot.tsx        -> frontend/components/AdSlot.tsx
components/AdScripts.tsx     -> frontend/components/AdScripts.tsx
components/ConsentBanner.tsx -> frontend/components/ConsentBanner.tsx
public/ads.txt                -> frontend/public/ads.txt
```

Adjust the exact paths to match your actual frontend directory name.

## 2. Environment variables

Add to `.env.local` (and your production env):

```
NEXT_PUBLIC_ADSENSE_CLIENT_ID=ca-pub-XXXXXXXXXXXXXXXX
NEXT_PUBLIC_MONETAG_ZONE_ID=XXXXXXXX
```

Get these from your AdSense and Monetag dashboards once approved.

## 3. Wire into the root layout

In `app/layout.tsx`:

```tsx
import { ConsentProvider } from '@/components/ConsentBanner';
import AdScripts from '@/components/AdScripts';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ConsentProvider>
          {children}
          <AdScripts />
        </ConsentProvider>
      </body>
    </html>
  );
}
```

This puts the consent banner and both loader scripts on every page —
marketing site, future blog, and the Client Portal / Admin Dashboard once
Phase 2 ships.

## 4. Drop ad units into pages

```tsx
import AdSlot from '@/components/AdSlot';

<AdSlot network="adsense" slotId="1234567890" className="my-6" />
<AdSlot network="monetag" slotId="your-zone-id" />
```

Suggested placements to start:
- Below the hero on the home page
- Between sections on About/Services/Industries pages
- In the sidebar or footer of the future blog/portfolio content

Avoid stacking multiple units right next to each other — both networks
penalize (or outright ban) layouts that look like ad walls.

## 5. Fill in ads.txt

Replace the placeholder IDs in `public/ads.txt` with your real ones once
AdSense approves you and Monetag gives you their line. This file must be
reachable at `https://abeekey.com/ads.txt` — Next.js serves anything in
`public/` at the site root automatically, so no extra config needed.

## 6. Before going live

- [ ] AdSense account approved for abeekey.com
- [ ] `NEXT_PUBLIC_ADSENSE_CLIENT_ID` and `NEXT_PUBLIC_MONETAG_ZONE_ID` set in production env
- [ ] Real `ads.txt` values committed
- [ ] `/privacy` page exists and is linked from the consent banner
- [ ] Confirm Monetag's exact script snippet matches what's in `AdScripts.tsx` — their loader URL/params can change, use the one shown in your dashboard
- [ ] Decide whether portal pages (invoices, contracts) really get ads once Phase 2 ships, or get excluded — easy to do by not rendering `<AdSlot>` on those routes
