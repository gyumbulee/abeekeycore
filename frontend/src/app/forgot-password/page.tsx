'use client';

import { useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useAuth } from '@/lib/auth-context';

export default function ForgotPasswordPage() {
  const { forgotPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [message, setMessage] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('sending');

    try {
      const msg = await forgotPassword(email);
      setMessage(msg);
      setStatus('sent');
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
      setStatus('error');
    }
  }

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-bg flex items-center justify-center px-6 pt-28 pb-20">
        <div className="w-full max-w-md bg-white border border-slate-200 rounded-[20px] p-8 sm:p-10">
          <div className="mb-8 text-center">
            <h1 className="font-heading font-bold text-navy-primary text-2xl mb-2">Reset your password</h1>
            <p className="text-text-soft text-sm">
              Enter the email address on your account and we&apos;ll send you a link to reset your password.
            </p>
          </div>

          {status === 'sent' ? (
            <p className="text-center text-sm text-text-soft">{message}</p>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                required
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-slate-300 rounded-sm px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-accent"
              />

              {status === 'error' && <p className="text-danger text-sm">{message}</p>}

              <button
                type="submit"
                disabled={status === 'sending'}
                className="w-full py-3.5 rounded-sm font-semibold text-white bg-gradient-to-br from-blue-primary to-blue-accent shadow-[0_4px_18px_rgba(37,99,235,0.35)] disabled:opacity-60"
              >
                {status === 'sending' ? 'Sending...' : 'Send reset link'}
              </button>
            </form>
          )}

          <p className="text-center text-xs text-text-soft mt-8">
            <Link href="/login" className="hover:text-navy-primary">
              ← Back to login
            </Link>
          </p>
        </div>
      </main>

      <Footer />
    </>
  );
}
