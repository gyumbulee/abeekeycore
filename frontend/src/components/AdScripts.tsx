'use client';

import Script from 'next/script';
import { useAdConsent } from './ConsentBanner';

/**
 * Mount ONCE in app/layout.tsx (inside <body>, after children is fine).
 * Loads both networks' scripts, gated on the visitor having accepted the
 * cookie/ad consent notice (required under Nigeria's NDPR for tracking
 * cookies, and good practice generally).
 */
export default function AdScripts() {
  const { consented } = useAdConsent();

  if (!consented) return null;

  const adsenseClientId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID;
  const monetagZoneId = process.env.NEXT_PUBLIC_MONETAG_ZONE_ID;

  return (
    <>
      {adsenseClientId && (
        <Script
          async
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseClientId}`}
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
      )}

      {monetagZoneId && (
        // Replace src with the exact loader URL Monetag gives you in their
        // dashboard for this zone - the format below is the typical pattern
        // but confirm against your actual Monetag snippet before shipping.
        <Script
          async
          src={`https://al5sm.com/tag.min.js?z=${monetagZoneId}`}
          strategy="afterInteractive"
        />
      )}
    </>
  );
}
