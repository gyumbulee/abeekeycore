'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useAuth } from '@/lib/auth-context';
import { ApiError } from '@/lib/api';

type Mode = 'login' | 'register' | 'otp';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect');
  const { login, register, verifyOtp, resendOtp } = useAuth();

  const [mode, setMode] = useState<Mode>('login');
  const [otpEmail, setOtpEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [otpInfo, setOtpInfo] = useState('');
  const [resendStatus, setResendStatus] = useState<'idle' | 'sending' | 'sent'>('idle');

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
  });
  const [status, setStatus] = useState<'idle' | 'sending' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  function goAfterAuth(role: 'client' | 'staff' | 'admin') {
    if (redirectTo && role !== 'admin') {
      router.push(redirectTo);
    } else {
      router.push(role === 'admin' ? '/admin' : '/portal');
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('sending');
    setErrorMsg('');

    try {
      if (mode === 'login') {
        const user = await login({ email: form.email, password: form.password });
        goAfterAuth(user.role);
        return;
      }

      const res = await register(form);
      setOtpEmail(res.email);
      setOtpInfo('We\u2019ve sent a 6-digit code to ' + res.email + '. Enter it below to verify your account.');
      setMode('otp');
    } catch (err) {
      if (err instanceof ApiError && err.status === 403 && err.body?.requires_verification) {
        setOtpEmail(String(err.body.email ?? form.email));
        setOtpInfo(String(err.body.message ?? 'Please verify your email to continue.'));
        setMode('otp');
        setStatus('idle');
        return;
      }
      setStatus('error');
      setErrorMsg(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
      return;
    }
    setStatus('idle');
  }

  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    setStatus('sending');
    setErrorMsg('');
    try {
      const user = await verifyOtp(otpEmail, otpCode);
      goAfterAuth(user.role);
    } catch (err) {
      setStatus('error');
      setErrorMsg(err instanceof Error ? err.message : 'Invalid or expired code.');
    }
  }

  async function handleResend() {
    setResendStatus('sending');
    try {
      await resendOtp(otpEmail);
      setResendStatus('sent');
    } catch {
      setResendStatus('idle');
    }
  }

  if (mode === 'otp') {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-bg flex items-center justify-center px-6 pt-28 pb-20">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-[20px] p-8 sm:p-10">
            <div className="mb-8 text-center">
              <h1 className="font-heading font-bold text-navy-primary text-2xl mb-2">Verify your email</h1>
              <p className="text-text-soft text-sm">{otpInfo}</p>
            </div>

            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <input
                required
                maxLength={6}
                inputMode="numeric"
                placeholder="6-digit code"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                className="w-full border border-slate-300 rounded-sm px-4 py-3 text-center text-2xl tracking-[0.5em] font-mono focus:outline-none focus:ring-2 focus:ring-blue-accent"
              />

              {status === 'error' && <p className="text-danger text-sm text-center">{errorMsg}</p>}

              <button
                type="submit"
                disabled={status === 'sending' || otpCode.length !== 6}
                className="w-full py-3.5 rounded-sm font-semibold text-white bg-gradient-to-br from-blue-primary to-blue-accent shadow-[0_4px_18px_rgba(37,99,235,0.35)] disabled:opacity-60"
              >
                {status === 'sending' ? 'Verifying...' : 'Verify & Continue'}
              </button>
            </form>

            <p className="text-center text-sm text-text-soft mt-6">
              Didn&apos;t get a code?{' '}
              <button
                type="button"
                onClick={handleResend}
                disabled={resendStatus === 'sending'}
                className="text-blue-primary font-medium hover:underline disabled:opacity-60"
              >
                {resendStatus === 'sent' ? 'Code resent' : resendStatus === 'sending' ? 'Sending...' : 'Resend code'}
              </button>
            </p>

            <p className="text-center text-xs text-text-soft mt-8">
              <Link href="/" className="hover:text-navy-primary">
                ← Back to home
              </Link>
            </p>
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
            <h1 className="font-heading font-bold text-navy-primary text-2xl mb-2">
              {mode === 'login' ? 'Welcome back' : 'Create your account'}
            </h1>
            <p className="text-text-soft text-sm">
              {mode === 'login'
                ? 'Log in to your Abeekey client portal.'
                : 'Set up access to invoices, contracts, and project updates.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <input
                required
                placeholder="Full name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full border border-slate-300 rounded-sm px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-accent"
              />
            )}

            <input
              required
              type="email"
              placeholder="Email address"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full border border-slate-300 rounded-sm px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-accent"
            />

            <input
              required
              type="password"
              placeholder="Password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full border border-slate-300 rounded-sm px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-accent"
            />

            {mode === 'register' && (
              <input
                required
                type="password"
                placeholder="Confirm password"
                value={form.password_confirmation}
                onChange={(e) => setForm({ ...form, password_confirmation: e.target.value })}
                className="w-full border border-slate-300 rounded-sm px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-accent"
              />
            )}

            {status === 'error' && <p className="text-danger text-sm">{errorMsg}</p>}

            <button
              type="submit"
              disabled={status === 'sending'}
              className="w-full py-3.5 rounded-sm font-semibold text-white bg-gradient-to-br from-blue-primary to-blue-accent shadow-[0_4px_18px_rgba(37,99,235,0.35)] disabled:opacity-60"
            >
              {status === 'sending' ? 'Please wait...' : mode === 'login' ? 'Log in' : 'Create account'}
            </button>
          </form>

          <p className="text-center text-sm text-text-soft mt-6">
            {mode === 'login' ? (
              <>
                Don&apos;t have an account?{' '}
                <button
                  type="button"
                  onClick={() => setMode('register')}
                  className="text-blue-primary font-medium hover:underline"
                >
                  Create one
                </button>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="text-blue-primary font-medium hover:underline"
                >
                  Log in
                </button>
              </>
            )}
          </p>

          <p className="text-center text-xs text-text-soft mt-8">
            <Link href="/" className="hover:text-navy-primary">
              ← Back to home
            </Link>
          </p>
        </div>
      </main>

      <Footer />
    </>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginContent />
    </Suspense>
  );
}