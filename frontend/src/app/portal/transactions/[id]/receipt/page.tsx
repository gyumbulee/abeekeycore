'use client';

import { useEffect, useState, use as usePromise } from 'react';
import { api, Transaction } from '@/lib/api';

function formatMoney(amount: string, currency: string) {
  return `${currency === 'NGN' ? '₦' : currency + ' '}${parseFloat(amount).toLocaleString()}`;
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' });
}

export default function ReceiptPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = usePromise(params);
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .getTransaction(Number(id))
      .then((res) => setTransaction(res.data))
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load receipt.'));
  }, [id]);

  if (error) return <p className="text-danger text-sm">{error}</p>;
  if (!transaction) return <p className="text-text-soft text-sm">Loading receipt...</p>;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex justify-end mb-4 print:hidden">
        <button
          onClick={() => window.print()}
          className="px-5 py-2.5 rounded-sm text-sm font-semibold text-white bg-gradient-to-br from-blue-primary to-blue-accent"
        >
          Print / Save as PDF
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-[20px] p-10 print:border-0 print:rounded-none print:shadow-none">
        <div className="flex items-center justify-between border-b border-slate-100 pb-6 mb-6">
          <div className="flex items-center gap-2.5 font-heading font-bold text-xl text-navy-primary">
            <span className="w-8 h-8 rounded-[9px] bg-gradient-to-br from-blue-accent to-navy-secondary flex items-center justify-center text-sm">
              🔷
            </span>
            Abeekey
          </div>
          <div className="text-right text-xs text-text-soft">
            <div>RC 8152454</div>
            <div>51B Suleiman Street, Wase, Plateau State</div>
            <div>info@abeekey.com</div>
          </div>
        </div>

        <h1 className="font-heading font-bold text-navy-primary text-2xl mb-1">Payment Receipt</h1>
        <p className="text-text-soft text-sm mb-8">Receipt No. {transaction.receipt_number || transaction.tx_ref}</p>

        <div className="grid grid-cols-2 gap-6 mb-8 text-sm">
          <div>
            <div className="text-text-soft text-xs uppercase tracking-wide mb-1">Date Paid</div>
            <div className="font-medium text-navy-primary">
              {transaction.paid_at ? formatDate(transaction.paid_at) : '—'}
            </div>
          </div>
          <div>
            <div className="text-text-soft text-xs uppercase tracking-wide mb-1">Payment Method</div>
            <div className="font-medium text-navy-primary capitalize">
              {transaction.payment_method || '—'}
            </div>
          </div>
          {transaction.invoice?.invoice_number && (
            <div>
              <div className="text-text-soft text-xs uppercase tracking-wide mb-1">Invoice Reference</div>
              <div className="font-medium text-navy-primary">{transaction.invoice.invoice_number}</div>
            </div>
          )}
          <div>
            <div className="text-text-soft text-xs uppercase tracking-wide mb-1">Transaction Reference</div>
            <div className="font-mono text-navy-secondary text-xs">{transaction.tx_ref}</div>
          </div>
        </div>

        <div className="bg-bg rounded-[14px] p-6 flex items-center justify-between mb-8">
          <span className="font-heading font-semibold text-navy-primary">Amount Paid</span>
          <span className="font-heading font-bold text-navy-primary text-2xl">
            {formatMoney(transaction.amount, transaction.currency)}
          </span>
        </div>

        <p className="text-text-soft text-xs text-center">
          This receipt confirms payment received by ASGL Limited (trading as Abeekey). Thank you for your business.
        </p>
      </div>
    </div>
  );
}