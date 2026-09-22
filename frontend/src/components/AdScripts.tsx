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
        // Exact mechanism from Monetag's own "Get tag" snippet for this
        // In-Page Push zone (zone 11861415): it builds a <script> element,
        // sets data-zone, points src at nap5k.com, and appends it to
        // <body> (or <html> if body isn't available yet). Reproduced as-is
        // rather than a guessed query-param URL, since Monetag's loader
        // reads the zone id off the dataset, not the URL.
        <Script
          id="monetag-in-page-push"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `(function(s){s.dataset.zone='${monetagZoneId}',s.src='https://nap5k.com/tag.min.js'})([document.documentElement, document.body].filter(Boolean).pop().appendChild(document.createElement('script')))`,
          }}
        />
      )}
    </>
  );
}