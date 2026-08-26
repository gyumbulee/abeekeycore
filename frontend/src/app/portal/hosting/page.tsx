'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api, HostingOrder } from '@/lib/api';
import StatusBadge from '@/components/StatusBadge';

function formatDate(date: string | null) {
  if (!date) return '—';
  return new Date(date).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function HostingPage() {
  const [orders, setOrders] = useState<HostingOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [payingId, setPayingId] = useState<number | null>(null);
  const [payError, setPayError] = useState<{ id: number; message: string } | null>(null);

  useEffect(() => {
    api
      .getHostingOrders()
      .then((res) => setOrders(res.data))
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load hosting.'))
      .finally(() => setLoading(false));
  }, []);

  async function handleCompletePayment(orderId: number) {
    setPayingId(orderId);
    setPayError(null);
    try {
      const res = await api.payHostingOrder(orderId);
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
          <h1 className="font-heading font-bold text-navy-primary text-2xl mb-1">Hosting</h1>
          <p className="text-text-soft">Web hosting plans you&apos;ve purchased through Abeekey.</p>
        </div>
        <Link
          href="/portal/hosting/purchase"
          className="px-5 py-2.5 rounded-sm text-sm font-semibold text-white bg-gradient-to-br from-blue-primary to-blue-accent whitespace-nowrap"
        >
          + Get Hosting
        </Link>
      </div>

      {loading && <p className="text-text-soft text-sm">Loading hosting...</p>}
      {error && <p className="text-danger text-sm">{error}</p>}
      {!loading && !error && orders.length === 0 && (
        <p className="text-text-soft text-sm">You don&apos;t have any hosting plans yet.</p>
      )}

      <div className="space-y-4">
        {orders.map((order) => (
          <div key={order.id} className="bg-white border border-slate-200 rounded-[20px] p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <span className="font-heading font-semibold text-navy-primary">{order.domain_name}</span>
                  <StatusBadge status={order.status} />
                </div>
                <p className="text-text-soft text-sm">
                  {order.plan?.name ?? 'Hosting plan'} · {order.billing_cycle}
                  {order.status === 'active' && ` · Renews ${formatDate(order.expires_at)}`}
                  {order.status === 'provisioning_failed' && order.failure_reason && (
                    <span className="text-danger"> · {order.failure_reason}</span>
                  )}
                </p>
              </div>
              <div className="font-heading font-bold text-navy-primary text-lg">
                ₦{parseFloat(order.sale_price).toLocaleString()}
                <span className="text-text-soft text-xs font-normal">
                  /{order.billing_cycle === 'annual' ? 'yr' : 'mo'}
                </span>
              </div>
            </div>

            {order.status === 'pending_payment' && (
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

            {order.status === 'provisioning_failed' && (
              <div className="border-t border-slate-100 mt-4 pt-4">
                <p className="text-text-soft text-xs">
                  Your payment went through, but setup hit a snag on our end. Our team has been
                  notified and will get this resolved — no action needed from you.
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
