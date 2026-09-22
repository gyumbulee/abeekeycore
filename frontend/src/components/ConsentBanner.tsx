'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

const STORAGE_KEY = 'abeekey_ad_consent';

interface ConsentContextValue {
  consented: boolean;
  setConsented: (value: boolean) => void;
}

const ConsentContext = createContext<ConsentContextValue>({
  consented: false,
  setConsented: () => {},
});

export function useAdConsent() {
  return useContext(ConsentContext);
}

/**
 * Wrap the app with <ConsentProvider> in app/layout.tsx, above <AdScripts />.
 * Renders a small banner until the visitor accepts or declines. Ad scripts
 * (AdScripts.tsx) only load after acceptance.
 */
export function ConsentProvider({ children }: { children: ReactNode }) {
  const [consented, setConsentedState] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    setConsentedState(stored === 'true');
    setReady(true);
  }, []);

  const setConsented = (value: boolean) => {
    localStorage.setItem(STORAGE_KEY, String(value));
    setConsentedState(value);
  };

  return (
    <ConsentContext.Provider value={{ consented, setConsented }}>
      {children}
      {ready && !consented && <ConsentBanner onAccept={() => setConsented(true)} onDecline={() => setConsented(false)} />}
    </ConsentContext.Provider>
  );
}

function ConsentBanner({ onAccept, onDecline }: { onAccept: () => void; onDecline: () => void }) {
  return (
    <div
      role="dialog"
      aria-label="Cookie and ad consent"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        padding: '1rem',
        background: '#111',
        color: '#fff',
        display: 'flex',
        flexWrap: 'wrap',
        gap: '0.75rem',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      <p style={{ margin: 0, fontSize: '0.875rem', maxWidth: '60ch' }}>
        We use cookies to show ads that help fund Abeekey&apos;s free content and services. See our{' '}
        <a href="/privacy" style={{ color: '#9cf' }}>Privacy Policy</a>.
      </p>
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <button
          onClick={onDecline}
          style={{ padding: '0.5rem 1rem', background: 'transparent', color: '#fff', border: '1px solid #555', borderRadius: 4 }}
        >
          Decline
        </button>
        <button
          onClick={onAccept}
          style={{ padding: '0.5rem 1rem', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 4 }}
        >
          Accept
        </button>
      </div>
    </div>
  );
}
