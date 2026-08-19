'use client';

import { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { api } from '@/lib/api';

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

// Curated list, Nigeria first since it's the primary market.
const COUNTRY_CODES = [
  { code: '+234', label: '🇳🇬 Nigeria (+234)' },
  { code: '+1', label: '🇺🇸 US/Canada (+1)' },
  { code: '+44', label: '🇬🇧 UK (+44)' },
  { code: '+233', label: '🇬🇭 Ghana (+233)' },
  { code: '+254', label: '🇰🇪 Kenya (+254)' },
  { code: '+27', label: '🇿🇦 South Africa (+27)' },
  { code: '+91', label: '🇮🇳 India (+91)' },
  { code: '+971', label: '🇦🇪 UAE (+971)' },
  { code: '+61', label: '🇦🇺 Australia (+61)' },
  { code: '+49', label: '🇩🇪 Germany (+49)' },
  { code: '+33', label: '🇫🇷 France (+33)' },
  { code: '+86', label: '🇨🇳 China (+86)' },
];

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', company: '', subject: '', message: '', hp_field_9x2: '' });
  const [dialCode, setDialCode] = useState('+234');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  async function handleSubmit(e: React.FormEvent) {
  e.preventDefault();
  setStatus('sending');
  setErrorMsg('');

  try {
    await api.submitContact({ ...form, phone: `${dialCode} ${form.phone}`.trim() });

    if (typeof window !== 'undefined' && window.fbq) {
      window.fbq('track', 'Lead');
    }

    setStatus('sent');
    setForm({
      name: '',
      email: '',
      phone: '',
      company: '',
      subject: '',
      message: '',
      hp_field_9x2: '',
    });
    setDialCode('+234');
  } catch (err) {
    setStatus('error');
    setErrorMsg(err instanceof Error ? err.message : 'Something went wrong.');
  }
}

  return (
    <>
      <Navbar />
      <main className="pt-[150px] pb-24 max-w-2xl mx-auto px-8">
        <div className="mb-10 text-center">
          <div className="font-mono text-[13px] font-medium text-blue-primary uppercase tracking-widest mb-3">Get in touch</div>
          <h1 className="font-heading font-bold text-navy-primary text-3xl mb-3">Let&apos;s talk about your project</h1>
          <p className="text-text-soft">Tell us what you need — we usually respond within one business day.</p>
        </div>

        {status === 'sent' ? (
          <div className="bg-success/10 border border-success/30 text-success rounded-md p-6 text-center font-medium">
            Thanks — your message has been received. We&apos;ll be in touch shortly.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Honeypot — hidden from real users, bots that auto-fill every field will trip it.
                Field name deliberately avoids "website"/"url"/"company" etc. so browser
                autofill (Chrome/Safari saved-address data) doesn't populate it and false-flag
                real users. */}
            <input
              type="text"
              name="hp_field_9x2"
              id="hp_field_9x2"
              value={form.hp_field_9x2}
              onChange={(e) => setForm({ ...form, hp_field_9x2: e.target.value })}
              tabIndex={-1}
              autoComplete="new-password"
              aria-hidden="true"
              className="absolute -left-[9999px] w-px h-px opacity-0"
            />
            <div className="grid sm:grid-cols-2 gap-5">
              <input
                required
                placeholder="Full name (first & last)"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full border border-slate-300 rounded-sm px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-accent"
              />
              <input
                required
                type="email"
                placeholder="Email address"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full border border-slate-300 rounded-sm px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-accent"
              />
            </div>
            <div className="grid sm:grid-cols-2 gap-5">
              <div className="flex gap-2">
                <select
                  value={dialCode}
                  onChange={(e) => setDialCode(e.target.value)}
                  aria-label="Country code"
                  className="border border-slate-300 rounded-sm px-2 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-accent bg-white shrink-0 w-[110px]"
                >
                  {COUNTRY_CODES.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.label}
                    </option>
                  ))}
                </select>
                <input
                  required
                  type="tel"
                  placeholder="Phone number"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full border border-slate-300 rounded-sm px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-accent"
                />
              </div>
              <input
                placeholder="Company (optional)"
                value={form.company}
                onChange={(e) => setForm({ ...form, company: e.target.value })}
                className="w-full border border-slate-300 rounded-sm px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-accent"
              />
            </div>
            <input
              required
              placeholder="Subject"
              value={form.subject}
              onChange={(e) => setForm({ ...form, subject: e.target.value })}
              className="w-full border border-slate-300 rounded-sm px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-accent"
            />
            <textarea
              required
              minLength={15}
              rows={5}
              placeholder="Tell us about your project... (min. 15 characters)"
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              className="w-full border border-slate-300 rounded-sm px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-accent"
            />

            {status === 'error' && (
              <p className="text-danger text-sm">{errorMsg}</p>
            )}

            <button
              type="submit"
              disabled={status === 'sending'}
              className="w-full py-3.5 rounded-sm font-semibold text-white bg-gradient-to-br from-blue-primary to-blue-accent shadow-[0_4px_18px_rgba(37,99,235,0.35)] disabled:opacity-60"
            >
              {status === 'sending' ? 'Sending...' : 'Send message'}
            </button>
          </form>
        )}
      </main>
      <Footer />
    </>
  );
}