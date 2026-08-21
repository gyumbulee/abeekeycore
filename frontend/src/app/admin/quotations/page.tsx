'use client';

import { useEffect, useState } from 'react';
import { adminApi, ClientAccount, PortalQuotation, LineItem } from '@/lib/api';
import StatusBadge from '@/components/StatusBadge';

const emptyItem: LineItem = { description: '', quantity: 1, unit_price: 0 };

function formatMoney(amount: string, currency: string) {
  return `${currency === 'NGN' ? '₦' : currency + ' '}${parseFloat(amount).toLocaleString()}`;
}

type AdminQuotation = PortalQuotation & { user: ClientAccount };

const STATUS_OPTIONS: PortalQuotation['status'][] = ['draft', 'sent', 'accepted', 'declined', 'expired'];

export default function AdminQuotationsPage() {
  const [quotations, setQuotations] = useState<AdminQuotation[]>([]);
  const [clients, setClients] = useState<ClientAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);

  function reload() {
    setLoading(true);
    Promise.all([adminApi.getQuotations(), adminApi.getClients()])
      .then(([quoRes, clientRes]) => {
        setQuotations(quoRes.data);
        setClients(clientRes.data);
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load data.'))
      .finally(() => setLoading(false));
  }

  useEffect(reload, []);

  async function handleStatusChange(id: number, status: PortalQuotation['status']) {
    const previous = quotations;
    setQuotations((prev) => prev.map((q) => (q.id === id ? { ...q, status } : q)));
    try {
      await adminApi.updateQuotationStatus(id, { status });
    } catch (err) {
      setQuotations(previous);
      setError(err instanceof Error ? err.message : 'Failed to update quotation status.');
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-heading font-bold text-navy-primary text-2xl mb-1">Quotations</h1>
          <p className="text-text-soft">
            All client quotations — from converted leads and standalone quotes.
          </p>
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="px-5 py-2.5 rounded-sm text-sm font-semibold text-white bg-gradient-to-br from-blue-primary to-blue-accent"
        >
          {showForm ? 'Cancel' : '+ New Quotation'}
        </button>
      </div>

      <p className="text-text-soft text-xs mb-6 -mt-4">
        Quoting an incoming enquiry? Convert it directly from the{' '}
        <a href="/admin/leads" className="text-blue-primary hover:underline">
          Leads (CRM)
        </a>{' '}
        page instead — use this form only for quotes with no matching lead.
      </p>

      {showForm && (
        <NewQuotationForm
          clients={clients}
          onCreated={(quotation) => {
            setQuotations((prev) => [quotation, ...prev]);
            setShowForm(false);
          }}
        />
      )}

      {loading && <p className="text-text-soft text-sm">Loading quotations...</p>}
      {error && <p className="text-danger text-sm">{error}</p>}
      {!loading && !error && quotations.length === 0 && (
        <p className="text-text-soft text-sm">No quotations yet.</p>
      )}

      <div className="space-y-4">
        {quotations.map((quotation) => (
          <div
            key={quotation.id}
            className="bg-white border border-slate-200 rounded-[20px] p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
          >
            <div>
              <div className="flex items-center gap-3 mb-1">
                <span className="font-mono text-sm text-navy-secondary font-semibold">
                  {quotation.quotation_number}
                </span>
                <StatusBadge status={quotation.status} />
              </div>
              <p className="font-medium text-navy-primary text-sm mb-0.5">{quotation.title}</p>
              <p className="text-text-soft text-sm">
                {quotation.user?.name} ({quotation.user?.email})
                {quotation.valid_until && ` · Valid until ${quotation.valid_until}`}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="font-heading font-bold text-navy-primary text-lg">
                {formatMoney(quotation.amount_total, quotation.currency)}
              </div>
              <select
                value={quotation.status}
                onChange={(e) => handleStatusChange(quotation.id, e.target.value as PortalQuotation['status'])}
                className="border border-slate-300 rounded-sm px-2 py-1.5 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-accent"
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function NewQuotationForm({
  clients,
  onCreated,
}: {
  clients: ClientAccount[];
  onCreated: (quotation: AdminQuotation) => void;
}) {
  // Empty string is the real "nothing selected" state — kept separate from
  // any valid numeric id (including 0, which shouldn't occur but is guarded
  // against below regardless) rather than coercing '' to Number('') === 0
  // and silently allowing a submit with no client actually chosen.
  const [userId, setUserId] = useState<number | ''>('');
  const [title, setTitle] = useState('');
  const [validUntil, setValidUntil] = useState('');
  const [items, setItems] = useState<LineItem[]>([{ ...emptyItem }]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const total = items.reduce((sum, item) => sum + item.quantity * item.unit_price, 0);

  function updateItem(index: number, patch: Partial<LineItem>) {
    setItems((prev) => prev.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  }

  function handleUserSelect(value: string) {
    setUserId(value === '' ? '' : Number(value));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (userId === '' || !Number.isFinite(userId)) {
      setError('Please select a client.');
      return;
    }
    if (!title.trim()) {
      setError('Please enter a title.');
      return;
    }
    if (items.length === 0 || items.some((i) => !i.description.trim())) {
      setError('Every line item needs a description.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await adminApi.createQuotation({
        user_id: userId,
        title,
        amount_total: total,
        valid_until: validUntil || undefined,
        items,
      });
      onCreated(res.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create quotation.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white border border-slate-200 rounded-[20px] p-6 mb-8 space-y-4"
    >
      <div className="grid sm:grid-cols-3 gap-4">
        <select
          required
          value={userId}
          onChange={(e) => handleUserSelect(e.target.value)}
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
          placeholder="Quotation title"
          className="border border-slate-300 rounded-sm px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-accent"
        />
        <label className="text-sm text-text-soft">
          Valid until (optional)
          <input
            type="date"
            value={validUntil}
            onChange={(e) => setValidUntil(e.target.value)}
            className="block mt-1 w-full border border-slate-300 rounded-sm px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-accent"
          />
        </label>
      </div>

      <div className="space-y-2">
        {items.map((item, i) => (
          <div key={i} className="grid grid-cols-[1fr_70px_110px_28px] gap-2 items-center">
            <input
              required
              value={item.description}
              onChange={(e) => updateItem(i, { description: e.target.value })}
              placeholder="Description"
              className="border border-slate-300 rounded-sm px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-accent"
            />
            <input
              type="number"
              min={0}
              value={item.quantity}
              onChange={(e) => updateItem(i, { quantity: parseFloat(e.target.value) || 0 })}
              placeholder="Qty"
              className="border border-slate-300 rounded-sm px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-accent"
            />
            <input
              type="number"
              min={0}
              value={item.unit_price}
              onChange={(e) => updateItem(i, { unit_price: parseFloat(e.target.value) || 0 })}
              placeholder="Unit price"
              className="border border-slate-300 rounded-sm px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-accent"
            />
            <button
              type="button"
              onClick={() => setItems((prev) => prev.filter((_, idx) => idx !== i))}
              disabled={items.length === 1}
              className="text-text-soft hover:text-danger disabled:opacity-30 text-lg leading-none"
            >
              ×
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => setItems((prev) => [...prev, { ...emptyItem }])}
          className="text-sm text-blue-primary font-medium hover:underline"
        >
          + Add line item
        </button>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <div className="text-text-soft text-xs">Total</div>
          <div className="font-heading font-bold text-navy-primary text-lg">₦{total.toLocaleString()}</div>
        </div>
        {error && <p className="text-danger text-sm">{error}</p>}
        <button
          type="submit"
          disabled={submitting}
          className="px-6 py-3 rounded-sm font-semibold text-white bg-gradient-to-br from-blue-primary to-blue-accent disabled:opacity-60"
        >
          {submitting ? 'Creating...' : 'Create & Send Quotation'}
        </button>
      </div>
    </form>
  );
}
