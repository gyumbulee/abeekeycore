'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { api, Transaction } from '@/lib/api';

function CallbackContent() {
  const params = useSearchParams();
  const [state, setState] = useState<'checking' | 'success' | 'failed' | 'error'>('checking');
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const txRef = params.get('tx_ref');
    const flwStatus = params.get('status'); // 'successful' | 'cancelled' | 'failed' from Flutterwave

    if (!txRef) {
      setState('error');
      setMessage('No transaction reference found in the redirect.');
      return;
    }

    if (flwStatus === 'cancelled') {
      setState('failed');
      setMessage('Payment was cancelled.');
      return;
    }

    api
      .verifyPayment(txRef)
      .then((res) => {
        setTransaction(res.data);
        setState(res.data.status === 'successful' ? 'success' : 'failed');
      })
      .catch((err) => {
        setState('error');
        setMessage(err instanceof Error ? err.message : 'Could not verify payment status.');
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-6">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-[20px] p-8 text-center">
        {state === 'checking' && (
          <>
            <div className="text-2xl mb-3">⏳</div>
            <h1 className="font-heading font-bold text-navy-primary text-xl mb-2">
              Confirming your payment...
            </h1>
            <p className="text-text-soft text-sm">This will only take a moment.</p>
          </>
        )}

        {state === 'success' && (
          <>
            <div className="text-3xl mb-3">✅</div>
            <h1 className="font-heading font-bold text-navy-primary text-xl mb-2">Payment successful</h1>
            <p className="text-text-soft text-sm mb-6">
              {transaction?.receipt_number && `Receipt ${transaction.receipt_number} has been generated.`}
            </p>
            <Link
              href="/portal/transactions"
              className="inline-flex px-5 py-2.5 rounded-sm text-sm font-semibold text-white bg-gradient-to-br from-blue-primary to-blue-accent"
            >
              View Receipt
            </Link>
          </>
        )}

        {state === 'failed' && (
          <>
            <div className="text-3xl mb-3">⚠️</div>
            <h1 className="font-heading font-bold text-navy-primary text-xl mb-2">Payment not completed</h1>
            <p className="text-text-soft text-sm mb-6">
              {message || 'The payment was not successful. No charge should have been made.'}
            </p>
            <Link
              href="/portal/invoices"
              className="inline-flex px-5 py-2.5 rounded-sm text-sm font-semibold text-white bg-gradient-to-br from-blue-primary to-blue-accent"
            >
              Back to Invoices
            </Link>
          </>
        )}

        {state === 'error' && (
          <>
            <div className="text-3xl mb-3">❌</div>
            <h1 className="font-heading font-bold text-navy-primary text-xl mb-2">
              Couldn&apos;t confirm payment
            </h1>
            <p className="text-text-soft text-sm mb-6">{message}</p>
            <Link
              href="/portal/invoices"
              className="inline-flex px-5 py-2.5 rounded-sm text-sm font-semibold text-white bg-gradient-to-br from-blue-primary to-blue-accent"
            >
              Back to Invoices
            </Link>
          </>
        )}
      </div>
    </div>
  );
}

export default function PaymentCallbackPage() {
  return (
    <Suspense fallback={null}>
      <CallbackContent />
    </Suspense>
  );
}