'use client';

import { useEffect, useState } from 'react';
import { adminApi, ClientAccount, HostingOrder } from '@/lib/api';
import StatusBadge from '@/components/StatusBadge';

function formatDate(date: string | null) {
  if (!date) return '—';
  return new Date(date).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function AdminHostingOrdersPage() {
  const [orders, setOrders] = useState<(HostingOrder & { user: ClientAccount })[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actioningId, setActioningId] = useState<number | null>(null);
  const [actionError, setActionError] = useState<{ id: number; message: string } | null>(null);

  function reload() {
    setLoading(true);
    adminApi
      .getHostingOrders()
      .then((res) => setOrders(res.data))
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load hosting orders.'))
      .finally(() => setLoading(false));
  }

  useEffect(reload, []);

  async function handleRetry(id: number) {
    setActioningId(id);
    setActionError(null);
    try {
      await adminApi.retryHostingOrder(id);
      reload();
    } catch (err) {
      setActionError({ id, message: err instanceof Error ? err.message : 'Retry failed.' });
    } finally {
      setActioningId(null);
    }
  }

  async function handleCancel(id: number) {
    if (!confirm('This permanently deletes the site on the server. This cannot be undone. Continue?')) return;
    setActioningId(id);
    setActionError(null);
    try {
      await adminApi.cancelHostingOrder(id);
      reload();
    } catch (err) {
      setActionError({ id, message: err instanceof Error ? err.message : 'Cancellation failed.' });
    } finally {
      setActioningId(null);
    }
  }

  return (
    <div>
      <h1 className="font-heading font-bold text-navy-primary text-2xl mb-1">Hosting Orders</h1>
      <p className="text-text-soft mb-8">All hosting orders across every client.</p>

      {loading && <p className="text-text-soft text-sm">Loading hosting orders...</p>}
      {error && <p className="text-danger text-sm">{error}</p>}
      {!loading && !error && orders.length === 0 && (
        <p className="text-text-soft text-sm">No hosting orders yet.</p>
      )}

      <div className="space-y-4">
        {orders.map((order) => (
          <div key={order.id} className="bg-white border border-slate-200 rounded-[20px] p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-2">
              <div className="flex items-center gap-3">
                <span className="font-heading font-semibold text-navy-primary">{order.domain_name}</span>
                <StatusBadge status={order.status} />
              </div>
              <div className="font-heading font-bold text-navy-primary text-lg">
                ₦{parseFloat(order.sale_price).toLocaleString()}
                <span className="text-text-soft text-xs font-normal">
                  /{order.billing_cycle === 'annual' ? 'yr' : 'mo'}
                </span>
              </div>
            </div>
            <p className="text-text-soft text-sm">
              {order.user?.name} ({order.user?.email}) · {order.plan?.name ?? 'Unknown plan'}
            </p>
            {order.status === 'active' && (
              <p className="text-text-soft text-xs mt-2">
                Provisioned {formatDate(order.provisioned_at)} · Renews {formatDate(order.expires_at)}
                {order.site_user && ` · Site user: ${order.site_user}`}
              </p>
            )}
            {order.status === 'provisioning_failed' && order.failure_reason && (
              <p className="text-danger text-xs mt-2">{order.failure_reason}</p>
            )}

            {actionError?.id === order.id && (
              <p className="text-danger text-xs mt-2">{actionError.message}</p>
            )}

            {order.status === 'provisioning_failed' && (
              <div className="border-t border-slate-100 mt-4 pt-4">
                <button
                  onClick={() => handleRetry(order.id)}
                  disabled={actioningId === order.id}
                  className="px-4 py-2 rounded-sm text-sm font-semibold text-white bg-gradient-to-br from-blue-primary to-blue-accent disabled:opacity-60"
                >
                  {actioningId === order.id ? 'Retrying...' : 'Retry Provisioning'}
                </button>
              </div>
            )}

            {order.status === 'active' && (
              <div className="border-t border-slate-100 mt-4 pt-4">
                <button
                  onClick={() => handleCancel(order.id)}
                  disabled={actioningId === order.id}
                  className="px-4 py-2 rounded-sm text-sm font-semibold text-danger border border-danger/30 hover:bg-danger/5 disabled:opacity-60"
                >
                  {actioningId === order.id ? 'Cancelling...' : 'Cancel & Delete Site'}
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
