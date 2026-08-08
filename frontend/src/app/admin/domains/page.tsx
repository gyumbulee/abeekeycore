'use client';

import { useEffect, useState } from 'react';
import { adminApi, ClientAccount, DomainOrder } from '@/lib/api';
import StatusBadge from '@/components/StatusBadge';

function formatDate(date: string | null) {
  if (!date) return '—';
  return new Date(date).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function AdminDomainsPage() {
  const [orders, setOrders] = useState<(DomainOrder & { user: ClientAccount })[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    adminApi
      .getDomainOrders()
      .then((res) => setOrders(res.data))
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load domains.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h1 className="font-heading font-bold text-navy-primary text-2xl mb-1">Domains</h1>
      <p className="text-text-soft mb-8">All domain orders across every client.</p>

      {loading && <p className="text-text-soft text-sm">Loading domains...</p>}
      {error && <p className="text-danger text-sm">{error}</p>}
      {!loading && !error && orders.length === 0 && (
        <p className="text-text-soft text-sm">No domain orders yet.</p>
      )}

      <div className="space-y-4">
        {orders.map((order) => (
          <div key={order.id} className="bg-white border border-slate-200 rounded-[20px] p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-2">
              <div className="flex items-center gap-3">
                <span className="font-heading font-semibold text-navy-primary">
                  {order.domain_name}
                  {order.tld}
                </span>
                <StatusBadge status={order.status} />
              </div>
              <div className="font-heading font-bold text-navy-primary text-lg">
                ₦{parseFloat(order.sale_price).toLocaleString()}
              </div>
            </div>
            <p className="text-text-soft text-sm">
              {order.user?.name} ({order.user?.email}) · {order.years} year{order.years > 1 ? 's' : ''}
            </p>
            {order.status === 'registered' && (
              <p className="text-text-soft text-xs mt-2">
                Registered {formatDate(order.registered_at)}
                {order.connect_reseller_order_id && ` · Registrar Order #${order.connect_reseller_order_id}`}
              </p>
            )}
            {order.status === 'registration_failed' && order.failure_reason && (
              <p className="text-danger text-xs mt-2">{order.failure_reason}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}