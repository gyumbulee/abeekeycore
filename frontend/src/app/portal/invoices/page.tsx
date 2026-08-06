'use client';

import { useEffect, useState } from 'react';
import { api, Invoice } from '@/lib/api';
import StatusBadge from '@/components/StatusBadge';

function formatMoney(amount: string, currency: string) {
  const num = parseFloat(amount);
  return `${currency === 'NGN' ? '₦' : currency + ' '}${num.toLocaleString()}`;
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [payingId, setPayingId] = useState<number | null>(null);
  const [payError, setPayError] = useState<{ id: number; message: string } | null>(null);

  useEffect(() => {
    api
      .getInvoices()
      .then((res) => setInvoices(res.data))
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load invoices.'))
      .finally(() => setLoading(false));
  }, []);

  async function handlePayNow(invoiceId: number) {
    setPayingId(invoiceId);
    setPayError(null);
    try {
      const res = await api.payInvoice(invoiceId);
      if (res.data.payment_link) {
        window.location.href = res.data.payment_link;
      } else {
        setPayError({ id: invoiceId, message: 'Payment link unavailable. Please try again.' });
        setPayingId(null);
      }
    } catch (err) {
      setPayError({
        id: invoiceId,
        message: err instanceof Error ? err.message : 'Failed to start payment.',
      });
      setPayingId(null);
    }
  }

  return (
    <div>
      <h1 className="font-heading font-bold text-navy-primary text-2xl mb-8">Invoices</h1>

      {loading && <p className="text-text-soft text-sm">Loading invoices...</p>}
      {error && <p className="text-danger text-sm">{error}</p>}

      {!loading && !error && invoices.length === 0 && (
        <p className="text-text-soft text-sm">You don&apos;t have any invoices yet.</p>
      )}

      <div className="space-y-4">
        {invoices.map((invoice) => (
          <div key={invoice.id} className="bg-white border border-slate-200 rounded-[20px] p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <span className="font-mono text-sm text-navy-secondary font-semibold">
                    {invoice.invoice_number}
                  </span>
                  <StatusBadge status={invoice.status} />
                </div>
                <p className="text-text-soft text-sm">
                  Issued {formatDate(invoice.issue_date)} · Due {formatDate(invoice.due_date)}
                </p>
              </div>
              <div className="text-right">
                <div className="font-heading font-bold text-navy-primary text-lg">
                  {formatMoney(invoice.amount_total, invoice.currency)}
                </div>
                {invoice.items?.[0] && (
                  <div className="text-text-soft text-xs mt-1">{invoice.items[0].description}</div>
                )}
              </div>
            </div>

            {(invoice.status === 'sent' || invoice.status === 'overdue') && (
              <div className="border-t border-slate-100 mt-4 pt-4">
                {payError?.id === invoice.id && (
                  <p className="text-danger text-xs mb-3">{payError.message}</p>
                )}
                <button
                  onClick={() => handlePayNow(invoice.id)}
                  disabled={payingId === invoice.id}
                  className="px-5 py-2.5 rounded-sm text-sm font-semibold text-white bg-gradient-to-br from-blue-primary to-blue-accent disabled:opacity-60"
                >
                  {payingId === invoice.id ? 'Redirecting to payment...' : 'Pay Now'}
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}