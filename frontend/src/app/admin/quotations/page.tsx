'use client';

import { useEffect, useState } from 'react';
import { adminApi, ClientAccountDetailed } from '@/lib/api';

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function AdminClientsPage() {
  const [clients, setClients] = useState<ClientAccountDetailed[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    adminApi
      .getClients()
      .then((res) => setClients(res.data))
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load clients.'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = clients.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-heading font-bold text-navy-primary text-2xl mb-1">Clients</h1>
          <p className="text-text-soft">All registered client accounts.</p>
        </div>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or email..."
          className="border border-slate-300 rounded-sm px-4 py-2.5 text-sm w-64 focus:outline-none focus:ring-2 focus:ring-blue-accent"
        />
      </div>

      {loading && <p className="text-text-soft text-sm">Loading clients...</p>}
      {error && <p className="text-danger text-sm">{error}</p>}
      {!loading && !error && filtered.length === 0 && (
        <p className="text-text-soft text-sm">No clients found.</p>
      )}

      <div className="space-y-3">
        {filtered.map((client) => (
          <div
            key={client.id}
            className="bg-white border border-slate-200 rounded-[20px] p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
          >
            <div>
              <p className="font-medium text-navy-primary">{client.name}</p>
              <p className="text-text-soft text-sm">
                {client.email} · Joined {formatDate(client.created_at)}
              </p>
            </div>
            <div className="flex gap-6 text-sm">
              <div className="text-center">
                <div className="font-heading font-bold text-navy-primary">{client.invoices_count}</div>
                <div className="text-text-soft text-xs">Invoices</div>
              </div>
              <div className="text-center">
                <div className="font-heading font-bold text-navy-primary">{client.quotations_count}</div>
                <div className="text-text-soft text-xs">Quotations</div>
              </div>
              <div className="text-center">
                <div className="font-heading font-bold text-navy-primary">{client.contracts_count}</div>
                <div className="text-text-soft text-xs">Contracts</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}