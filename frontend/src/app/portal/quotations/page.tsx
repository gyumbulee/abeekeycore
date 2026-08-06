'use client';

import { useEffect, useState } from 'react';
import { api, PortalQuotation } from '@/lib/api';
import StatusBadge from '@/components/StatusBadge';

function formatMoney(amount: string, currency: string) {
  const num = parseFloat(amount);
  return `${currency === 'NGN' ? '₦' : currency + ' '}${num.toLocaleString()}`;
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function QuotationsPage() {
  const [quotations, setQuotations] = useState<PortalQuotation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [respondingId, setRespondingId] = useState<number | null>(null);
  const [respondError, setRespondError] = useState<{ id: number; message: string } | null>(null);

  useEffect(() => {
    api
      .getPortalQuotations()
      .then((res) => setQuotations(res.data))
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load quotations.'))
      .finally(() => setLoading(false));
  }, []);

  async function handleRespond(id: number, decision: 'accepted' | 'declined') {
    setRespondingId(id);
    setRespondError(null);
    try {
      const res = await api.respondToQuotation(id, decision);
      setQuotations((prev) => prev.map((q) => (q.id === id ? res.data : q)));
    } catch (err) {
      setRespondError({ id, message: err instanceof Error ? err.message : 'Something went wrong.' });
    } finally {
      setRespondingId(null);
    }
  }

  return (
    <div>
      <h1 className="font-heading font-bold text-navy-primary text-2xl mb-8">Quotations</h1>

      {loading && <p className="text-text-soft text-sm">Loading quotations...</p>}
      {error && <p className="text-danger text-sm">{error}</p>}

      {!loading && !error && quotations.length === 0 && (
        <p className="text-text-soft text-sm">You don&apos;t have any quotations yet.</p>
      )}

      <div className="space-y-4">
        {quotations.map((quotation) => (
          <div key={quotation.id} className="bg-white border border-slate-200 rounded-[20px] p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
              <div className="flex items-center gap-3">
                <span className="font-mono text-sm text-navy-secondary font-semibold">
                  {quotation.quotation_number}
                </span>
                <StatusBadge status={quotation.status} />
              </div>
              <div className="font-heading font-bold text-navy-primary text-lg">
                {formatMoney(quotation.amount_total, quotation.currency)}
              </div>
            </div>
            <h3 className="font-heading font-semibold text-navy-primary mb-1">{quotation.title}</h3>
            {quotation.valid_until && (
              <p className="text-text-soft text-xs mb-3">Valid until {formatDate(quotation.valid_until)}</p>
            )}
            {quotation.items?.length > 0 && (
              <ul className="text-sm text-text-soft space-y-1 border-t border-slate-100 pt-3 mb-2">
                {quotation.items.map((item, i) => (
                  <li key={i} className="flex justify-between">
                    <span>{item.description}</span>
                    <span>{formatMoney(String(item.quantity * item.unit_price), quotation.currency)}</span>
                  </li>
                ))}
              </ul>
            )}

            {quotation.status === 'sent' && (
              <div className="border-t border-slate-100 pt-4 mt-2">
                {respondError?.id === quotation.id && (
                  <p className="text-danger text-xs mb-3">{respondError.message}</p>
                )}
                <div className="flex gap-3">
                  <button
                    onClick={() => handleRespond(quotation.id, 'accepted')}
                    disabled={respondingId === quotation.id}
                    className="px-5 py-2.5 rounded-sm text-sm font-semibold text-white bg-gradient-to-br from-blue-primary to-blue-accent disabled:opacity-60"
                  >
                    {respondingId === quotation.id ? 'Please wait...' : 'Accept'}
                  </button>
                  <button
                    onClick={() => handleRespond(quotation.id, 'declined')}
                    disabled={respondingId === quotation.id}
                    className="px-5 py-2.5 rounded-sm text-sm font-semibold text-text-soft border border-slate-300 hover:bg-slate-50 disabled:opacity-60"
                  >
                    Decline
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}