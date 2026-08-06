'use client';

import { useEffect, useState } from 'react';
import { adminApi, Lead, LineItem } from '@/lib/api';
import StatusBadge from '@/components/StatusBadge';

const STATUS_FILTERS = ['all', 'new', 'reviewed', 'quoted', 'won', 'lost'] as const;

const emptyItem: LineItem = { description: '', quantity: 1, unit_price: 0 };

export default function AdminLeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [filter, setFilter] = useState<(typeof STATUS_FILTERS)[number]>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openLeadId, setOpenLeadId] = useState<number | null>(null);

  function loadLeads(status: string) {
    setLoading(true);
    adminApi
      .getLeads(status === 'all' ? undefined : status)
      .then((res) => setLeads(res.data))
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load leads.'))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadLeads(filter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  return (
    <div>
      <h1 className="font-heading font-bold text-navy-primary text-2xl mb-2">Leads</h1>
      <p className="text-text-soft mb-6">Incoming quotation requests from the public website.</p>

      <div className="flex gap-2 mb-8 flex-wrap">
        {STATUS_FILTERS.map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-4 py-2 rounded-full text-sm font-medium capitalize transition-colors ${
              filter === s
                ? 'bg-navy-primary text-white'
                : 'bg-white border border-slate-200 text-text-soft hover:border-navy-primary/30'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {loading && <p className="text-text-soft text-sm">Loading leads...</p>}
      {error && <p className="text-danger text-sm">{error}</p>}
      {!loading && !error && leads.length === 0 && (
        <p className="text-text-soft text-sm">No leads in this category.</p>
      )}

      <div className="space-y-4">
        {leads.map((lead) => (
          <LeadCard
            key={lead.id}
            lead={lead}
            open={openLeadId === lead.id}
            onToggle={() => setOpenLeadId(openLeadId === lead.id ? null : lead.id)}
            onConverted={(updated) => {
              setLeads((prev) => prev.map((l) => (l.id === lead.id ? { ...l, status: 'quoted' } : l)));
              setOpenLeadId(null);
              void updated;
            }}
          />
        ))}
      </div>
    </div>
  );
}

function LeadCard({
  lead,
  open,
  onToggle,
  onConverted,
}: {
  lead: Lead;
  open: boolean;
  onToggle: () => void;
  onConverted: (updated: unknown) => void;
}) {
  const [title, setTitle] = useState(`${lead.service_interest} — Proposal`);
  const [validUntil, setValidUntil] = useState('');
  const [items, setItems] = useState<LineItem[]>([{ ...emptyItem }]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const total = items.reduce((sum, item) => sum + item.quantity * item.unit_price, 0);

  function updateItem(index: number, patch: Partial<LineItem>) {
    setItems((prev) => prev.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  }

  function addItem() {
    setItems((prev) => [...prev, { ...emptyItem }]);
  }

  function removeItem(index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleConvert() {
    setSubmitting(true);
    setError('');
    try {
      const res = await adminApi.convertLead(lead.id, {
        title,
        amount_total: total,
        valid_until: validUntil || undefined,
        items,
      });
      onConverted(res.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to convert lead.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="bg-white border border-slate-200 rounded-[20px] p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h3 className="font-heading font-semibold text-navy-primary">{lead.client_name}</h3>
            <StatusBadge status={lead.status} />
          </div>
          <p className="text-text-soft text-sm">
            {lead.company_name && `${lead.company_name} · `}
            {lead.email}
            {lead.phone && ` · ${lead.phone}`}
          </p>
        </div>
        {lead.status !== 'quoted' && lead.status !== 'won' && (
          <button
            onClick={onToggle}
            className="px-4 py-2 rounded-sm text-sm font-semibold text-blue-primary border border-blue-primary/30 hover:bg-blue-primary/5 whitespace-nowrap"
          >
            {open ? 'Cancel' : 'Convert to Quotation'}
          </button>
        )}
      </div>

      <p className="text-sm text-text mb-1">
        <span className="font-medium">{lead.service_interest}</span>
        {lead.budget_range && <span className="text-text-soft"> · Budget: {lead.budget_range}</span>}
      </p>
      <p className="text-text-soft text-sm">{lead.project_summary}</p>

      {open && (
        <div className="mt-6 pt-6 border-t border-slate-100 space-y-4">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Quotation title"
            className="w-full border border-slate-300 rounded-sm px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-accent"
          />

          <div className="space-y-2">
            {items.map((item, i) => (
              <div key={i} className="grid grid-cols-[1fr_70px_110px_28px] gap-2 items-center">
                <input
                  value={item.description}
                  onChange={(e) => updateItem(i, { description: e.target.value })}
                  placeholder="Description"
                  className="border border-slate-300 rounded-sm px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-accent"
                />
                <input
                  type="number"
                  value={item.quantity}
                  onChange={(e) => updateItem(i, { quantity: parseFloat(e.target.value) || 0 })}
                  placeholder="Qty"
                  className="border border-slate-300 rounded-sm px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-accent"
                />
                <input
                  type="number"
                  value={item.unit_price}
                  onChange={(e) => updateItem(i, { unit_price: parseFloat(e.target.value) || 0 })}
                  placeholder="Unit price"
                  className="border border-slate-300 rounded-sm px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-accent"
                />
                <button
                  onClick={() => removeItem(i)}
                  disabled={items.length === 1}
                  className="text-text-soft hover:text-danger disabled:opacity-30 text-lg leading-none"
                  aria-label="Remove item"
                >
                  ×
                </button>
              </div>
            ))}
            <button onClick={addItem} className="text-sm text-blue-primary font-medium hover:underline">
              + Add line item
            </button>
          </div>

          <div className="flex items-center gap-4">
            <label className="text-sm text-text-soft">
              Valid until
              <input
                type="date"
                value={validUntil}
                onChange={(e) => setValidUntil(e.target.value)}
                className="block mt-1 border border-slate-300 rounded-sm px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-accent"
              />
            </label>
            <div className="ml-auto text-right">
              <div className="text-text-soft text-xs">Total</div>
              <div className="font-heading font-bold text-navy-primary text-lg">
                ₦{total.toLocaleString()}
              </div>
            </div>
          </div>

          {error && <p className="text-danger text-sm">{error}</p>}

          <button
            onClick={handleConvert}
            disabled={submitting || !title || items.some((i) => !i.description)}
            className="w-full py-3 rounded-sm font-semibold text-white bg-gradient-to-br from-blue-primary to-blue-accent disabled:opacity-60"
          >
            {submitting ? 'Sending...' : 'Send Quotation to Client'}
          </button>
        </div>
      )}
    </div>
  );
}