'use client';

import { useEffect, useState } from 'react';
import { adminApi, ClientAccount, Transaction } from '@/lib/api';
import StatusBadge from '@/components/StatusBadge';

function formatMoney(amount: string, currency: string) {
  return `${currency === 'NGN' ? '₦' : currency + ' '}${parseFloat(amount).toLocaleString()}`;
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function AdminTransactionsPage() {
  const [transactions, setTransactions] = useState<(Transaction & { user: ClientAccount })[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    adminApi
      .getTransactions()
      .then((res) => setTransactions(res.data))
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load transactions.'))
      .finally(() => setLoading(false));
  }, []);

  const totalReceived = transactions
    .filter((t) => t.status === 'successful')
    .reduce((sum, t) => sum + parseFloat(t.amount), 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-heading font-bold text-navy-primary text-2xl mb-1">Transactions</h1>
          <p className="text-text-soft">All payments across every client.</p>
        </div>
        <div className="text-right">
          <div className="text-text-soft text-xs uppercase tracking-wide">Total Received</div>
          <div className="font-heading font-bold text-navy-primary text-xl">
            ₦{totalReceived.toLocaleString()}
          </div>
        </div>
      </div>

      {loading && <p className="text-text-soft text-sm">Loading transactions...</p>}
      {error && <p className="text-danger text-sm">{error}</p>}
      {!loading && !error && transactions.length === 0 && (
        <p className="text-text-soft text-sm">No transactions yet.</p>
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
                {tx.user?.name} ({tx.user?.email})
                {tx.invoice?.invoice_number && ` · Invoice ${tx.invoice.invoice_number}`}
                {' · '}
                {formatDate(tx.created_at)}
              </p>
            </div>
            <div className="font-heading font-bold text-navy-primary text-lg">
              {formatMoney(tx.amount, tx.currency)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}