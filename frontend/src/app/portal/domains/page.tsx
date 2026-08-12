'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api, DomainOrder } from '@/lib/api';
import StatusBadge from '@/components/StatusBadge';

function formatDate(date: string | null) {
  if (!date) return '—';
  return new Date(date).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function DomainsPage() {
  const [orders, setOrders] = useState<DomainOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [payingId, setPayingId] = useState<number | null>(null);
  const [payError, setPayError] = useState<{ id: number; message: string } | null>(null);

  useEffect(() => {
    api
      .getDomainOrders()
      .then((res) => setOrders(res.data))
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load domains.'))
      .finally(() => setLoading(false));
  }, []);

  async function handleCompletePayment(orderId: number) {
    setPayingId(orderId);
    setPayError(null);
    try {
      const res = await api.payDomainOrder(orderId);
      if (res.data.payment_link) {
        window.location.href = res.data.payment_link;
      } else {
        setPayError({ id: orderId, message: 'Payment link unavailable. Please try again.' });
        setPayingId(null);
      }
    } catch (err) {
      setPayError({
        id: orderId,
        message: err instanceof Error ? err.message : 'Failed to start payment.',
      });
      setPayingId(null);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-heading font-bold text-navy-primary text-2xl mb-1">Domains</h1>
          <p className="text-text-soft">Domains you&apos;ve registered through Abeekey.</p>
        </div>
        <Link
          href="/#domain-search"
          className="px-5 py-2.5 rounded-sm text-sm font-semibold text-white bg-gradient-to-br from-blue-primary to-blue-accent whitespace-nowrap"
        >
          + Register a Domain
        </Link>
      </div>

      {loading && <p className="text-text-soft text-sm">Loading domains...</p>}
      {error && <p className="text-danger text-sm">{error}</p>}
      {!loading && !error && orders.length === 0 && (
        <p className="text-text-soft text-sm">You haven&apos;t registered any domains yet.</p>
      )}

      <div className="space-y-4">
        {orders.map((order) => (
          <div key={order.id} className="bg-white border border-slate-200 rounded-[20px] p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <span className="font-heading font-semibold text-navy-primary">
                    {order.domain_name}
                    {order.tld}
                  </span>
                  <StatusBadge status={order.status} />
                </div>
                <p className="text-text-soft text-sm">
                  {order.years} year{order.years > 1 ? 's' : ''}
                  {order.status === 'registered' && ` · Registered ${formatDate(order.registered_at)}`}
                  {order.status === 'registration_failed' && order.failure_reason && (
                    <span className="text-danger"> · {order.failure_reason}</span>
                  )}
                </p>
              </div>
              <div className="font-heading font-bold text-navy-primary text-lg">
                ₦{parseFloat(order.sale_price).toLocaleString()}
              </div>
            </div>

            {(order.status === 'pending_payment' || order.status === 'registration_failed') && (
              <div className="border-t border-slate-100 mt-4 pt-4">
                {payError?.id === order.id && <p className="text-danger text-xs mb-3">{payError.message}</p>}
                <button
                  onClick={() => handleCompletePayment(order.id)}
                  disabled={payingId === order.id}
                  className="px-5 py-2.5 rounded-sm text-sm font-semibold text-white bg-gradient-to-br from-blue-primary to-blue-accent disabled:opacity-60"
                >
                  {payingId === order.id ? 'Redirecting to payment...' : 'Complete Payment'}
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}