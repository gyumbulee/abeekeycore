'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useAuth } from '@/lib/auth-context';

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { resetPassword } = useAuth();

  const token = searchParams.get('token') ?? '';
  const email = searchParams.get('email') ?? '';

  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('sending');
    setErrorMsg('');

    try {
      await resetPassword({
        email,
        token,
        password,
        password_confirmation: passwordConfirmation,
      });
      router.push('/login');
    } catch (err) {
      setStatus('error');
      setErrorMsg(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    }
  }

  if (!token || !email) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-bg flex items-center justify-center px-6 pt-28 pb-20">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-[20px] p-8 sm:p-10 text-center">
            <h1 className="font-heading font-bold text-navy-primary text-2xl mb-2">Invalid reset link</h1>
            <p className="text-text-soft text-sm mb-6">
              This password reset link is missing required information. Please request a new one.
            </p>
            <Link href="/forgot-password" className="text-blue-primary font-medium hover:underline text-sm">
              Request a new link
            </Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-bg flex items-center justify-center px-6 pt-28 pb-20">
        <div className="w-full max-w-md bg-white border border-slate-200 rounded-[20px] p-8 sm:p-10">
          <div className="mb-8 text-center">
            <h1 className="font-heading font-bold text-navy-primary text-2xl mb-2">Set a new password</h1>
            <p className="text-text-soft text-sm">Choose a new password for {email}.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              required
              type="password"
              placeholder="New password"
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-slate-300 rounded-sm px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-accent"
            />

            <input
              required
              type="password"
              placeholder="Confirm new password"
              minLength={8}
              value={passwordConfirmation}
              onChange={(e) => setPasswordConfirmation(e.target.value)}
              className="w-full border border-slate-300 rounded-sm px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-accent"
            />

            {status === 'error' && <p className="text-danger text-sm">{errorMsg}</p>}

            <button
              type="submit"
              disabled={status === 'sending'}
              className="w-full py-3.5 rounded-sm font-semibold text-white bg-gradient-to-br from-blue-primary to-blue-accent shadow-[0_4px_18px_rgba(37,99,235,0.35)] disabled:opacity-60"
            >
              {status === 'sending' ? 'Resetting...' : 'Reset password'}
            </button>
          </form>

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

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordContent />
    </Suspense>
  );
}
