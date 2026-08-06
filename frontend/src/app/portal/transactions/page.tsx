'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api, Transaction } from '@/lib/api';
import StatusBadge from '@/components/StatusBadge';

function formatMoney(amount: string, currency: string) {
  return `${currency === 'NGN' ? '₦' : currency + ' '}${parseFloat(amount).toLocaleString()}`;
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .getTransactions()
      .then((res) => setTransactions(res.data))
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load transactions.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h1 className="font-heading font-bold text-navy-primary text-2xl mb-2">Transactions</h1>
      <p className="text-text-soft mb-8">Your payment history and receipts.</p>

      {loading && <p className="text-text-soft text-sm">Loading transactions...</p>}
      {error && <p className="text-danger text-sm">{error}</p>}
      {!loading && !error && transactions.length === 0 && (
        <p className="text-text-soft text-sm">You don&apos;t have any transactions yet.</p>
      )}

      <div className="space-y-4">
        {transactions.map((tx) => (
          <div
            key={tx.id}
            className="bg-white border border-slate-200 rounded-[20px] p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
          >
            <div>
              <div className="flex items-center gap-3 mb-1">
                <span className="font-mono text-sm text-navy-secondary font-semibold">
                  {tx.receipt_number || tx.tx_ref}
                </span>
                <StatusBadge status={tx.status} />
              </div>
              <p className="text-text-soft text-sm">
                {tx.invoice?.invoice_number && `Invoice ${tx.invoice.invoice_number} · `}
                {formatDate(tx.created_at)}
                {tx.payment_method && ` · ${tx.payment_method}`}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="font-heading font-bold text-navy-primary text-lg">
                {formatMoney(tx.amount, tx.currency)}
              </div>
              {tx.status === 'successful' && (
                <Link
                  href={`/portal/transactions/${tx.id}/receipt`}
                  className="px-4 py-2 rounded-sm text-sm font-semibold text-blue-primary border border-blue-primary/30 hover:bg-blue-primary/5 whitespace-nowrap"
                >
                  View Receipt
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}