'use client';

import { useEffect, useState } from 'react';
import { adminApi, ClientAccount, Contract } from '@/lib/api';
import StatusBadge from '@/components/StatusBadge';

const STATUS_OPTIONS: Contract['status'][] = [
  'draft',
  'sent',
  'signed',
  'active',
  'completed',
  'terminated',
];

function formatDate(date: string | null) {
  if (!date) return '—';
  return new Date(date).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function AdminContractsPage() {
  const [contracts, setContracts] = useState<(Contract & { user: ClientAccount })[]>([]);
  const [clients, setClients] = useState<ClientAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);

  function reload() {
    setLoading(true);
    Promise.all([adminApi.getContracts(), adminApi.getClients()])
      .then(([contractRes, clientRes]) => {
        setContracts(contractRes.data);
        setClients(clientRes.data);
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load data.'))
      .finally(() => setLoading(false));
  }

  useEffect(reload, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-heading font-bold text-navy-primary text-2xl mb-1">Contracts</h1>
          <p className="text-text-soft">All client contracts.</p>
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="px-5 py-2.5 rounded-sm text-sm font-semibold text-white bg-gradient-to-br from-blue-primary to-blue-accent"
        >
          {showForm ? 'Cancel' : '+ New Contract'}
        </button>
      </div>

      {showForm && (
        <NewContractForm
          clients={clients}
          onCreated={(contract) => {
            setContracts((prev) => [contract, ...prev]);
            setShowForm(false);
          }}
        />
      )}

      {loading && <p className="text-text-soft text-sm">Loading contracts...</p>}
      {error && <p className="text-danger text-sm">{error}</p>}
      {!loading && !error && contracts.length === 0 && (
        <p className="text-text-soft text-sm">No contracts yet.</p>
      )}

      <div className="space-y-4">
        {contracts.map((contract) => (
          <div key={contract.id} className="bg-white border border-slate-200 rounded-[20px] p-6">
            <div className="flex items-center gap-3 mb-2">
              <span className="font-mono text-sm text-navy-secondary font-semibold">
                {contract.contract_number}
              </span>
              <StatusBadge status={contract.status} />
            </div>
            <h3 className="font-heading font-semibold text-navy-primary mb-1">{contract.title}</h3>
            <p className="text-text-soft text-sm mb-2">
              {contract.user?.name} ({contract.user?.email})
            </p>
            {contract.summary && <p className="text-text-soft text-sm mb-2">{contract.summary}</p>}
            <p className="text-text-soft text-xs">
              {formatDate(contract.start_date)} — {formatDate(contract.end_date)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function NewContractForm({
  clients,
  onCreated,
}: {
  clients: ClientAccount[];
  onCreated: (contract: Contract & { user: ClientAccount }) => void;
}) {
  const [userId, setUserId] = useState<number | ''>('');
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [status, setStatus] = useState<Contract['status']>('draft');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!userId || !title) return;
    setSubmitting(true);
    setError('');
    try {
      const res = await adminApi.createContract({
        user_id: userId,
        title,
        summary: summary || undefined,
        status,
        start_date: startDate || undefined,
        end_date: endDate || undefined,
      });
      onCreated(res.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create contract.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white border border-slate-200 rounded-[20px] p-6 mb-8 space-y-4"
    >
      <div className="grid sm:grid-cols-2 gap-4">
        <select
          required
          value={userId}
          onChange={(e) => setUserId(Number(e.target.value))}
          className="border border-slate-300 rounded-sm px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-accent"
        >
          <option value="" disabled>
            Select client
          </option>
          {clients.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name} ({c.email})
            </option>
          ))}
        </select>
        <input
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Contract title"
          className="border border-slate-300 rounded-sm px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-accent"
        />
      </div>

      <textarea
        value={summary}
        onChange={(e) => setSummary(e.target.value)}
        placeholder="Scope / summary (optional)"
        rows={3}
        className="w-full border border-slate-300 rounded-sm px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-accent"
      />

      <div className="grid sm:grid-cols-3 gap-4">
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as Contract['status'])}
          className="border border-slate-300 rounded-sm px-3 py-2.5 text-sm bg-white capitalize focus:outline-none focus:ring-2 focus:ring-blue-accent"
        >
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s} className="capitalize">
              {s}
            </option>
          ))}
        </select>
        <label className="text-sm text-text-soft">
          Start date
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="block mt-1 w-full border border-slate-300 rounded-sm px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-accent"
          />
        </label>
        <label className="text-sm text-text-soft">
          End date
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="block mt-1 w-full border border-slate-300 rounded-sm px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-accent"
          />
        </label>
      </div>

      <div className="flex items-center justify-end gap-4">
        {error && <p className="text-danger text-sm">{error}</p>}
        <button
          type="submit"
          disabled={submitting}
          className="px-6 py-3 rounded-sm font-semibold text-white bg-gradient-to-br from-blue-primary to-blue-accent disabled:opacity-60"
        >
          {submitting ? 'Creating...' : 'Create Contract'}
        </button>
      </div>
    </form>
  );
}