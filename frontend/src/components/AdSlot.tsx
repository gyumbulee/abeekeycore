'use client';

import { useEffect, useRef } from 'react';

type AdNetwork = 'adsense' | 'monetag';

interface AdSlotProps {
  network: AdNetwork;
  /** AdSense: data-ad-slot value. Monetag: zone id. */
  slotId: string;
  /** Optional className for layout control (width/height/margins). */
  className?: string;
  /** AdSense format, e.g. "auto", "fluid". Ignored for Monetag. */
  format?: string;
}

/**
 * Renders one ad unit. Safe to place multiple times per page.
 * Requires the network's loader script to already be present on the page
 * (see AdScripts.tsx, mounted once in the root layout).
 */
export default function AdSlot({ network, slotId, className, format = 'auto' }: AdSlotProps) {
  const insRef = useRef<HTMLModElement | null>(null);
  const pushed = useRef(false);

  useEffect(() => {
    if (network !== 'adsense' || pushed.current) return;

    try {
      // @ts-expect-error - adsbygoogle is injected by the AdSense script
      (window.adsbygoogle = window.adsbygoogle || []).push({});
      pushed.current = true;
    } catch {
      // Ad blocked or script not yet loaded - fail silently, don't break the page
    }
  }, [network]);

  if (network === 'adsense') {
    return (
      <ins
        ref={insRef}
        className={`adsbygoogle ${className ?? ''}`}
        style={{ display: 'block' }}
        data-ad-client={process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID}
        data-ad-slot={slotId}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    );
  }

  // Monetag zones are normally self-injecting via the loader script tied to a
  // zone id, but for in-content placements Monetag also supports a container
  // div that its script targets by id. Adjust to match the exact snippet
  // Monetag gives you in their dashboard for this zone.
  return <div id={`monetag-zone-${slotId}`} className={className} data-zone={slotId} />;
}
