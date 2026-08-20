'use client';

import { useEffect, useState } from 'react';
import { adminApi, ClientAccount, Invoice, LineItem, MarkInvoicePaidPayload } from '@/lib/api';
import StatusBadge from '@/components/StatusBadge';

const emptyItem: LineItem = { description: '', quantity: 1, unit_price: 0 };

function formatMoney(amount: string, currency: string) {
  return `${currency === 'NGN' ? '₦' : currency + ' '}${parseFloat(amount).toLocaleString()}`;
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function AdminInvoicesPage() {
  const [invoices, setInvoices] = useState<(Invoice & { user: ClientAccount })[]>([]);
  const [clients, setClients] = useState<ClientAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);

  function reload() {
    setLoading(true);
    Promise.all([adminApi.getInvoices(), adminApi.getClients()])
      .then(([invRes, clientRes]) => {
        setInvoices(invRes.data);
        setClients(clientRes.data);
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load data.'))
      .finally(() => setLoading(false));
  }

  useEffect(reload, []);

  function handleMarkedPaid(updated: Invoice & { user: ClientAccount }) {
    setInvoices((prev) => prev.map((inv) => (inv.id === updated.id ? updated : inv)));
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-heading font-bold text-navy-primary text-2xl mb-1">Invoices</h1>
          <p className="text-text-soft">All client invoices.</p>
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="px-5 py-2.5 rounded-sm text-sm font-semibold text-white bg-gradient-to-br from-blue-primary to-blue-accent"
        >
          {showForm ? 'Cancel' : '+ New Invoice'}
        </button>
      </div>

      {showForm && (
        <NewInvoiceForm
          clients={clients}
          onCreated={(invoice) => {
            setInvoices((prev) => [invoice, ...prev]);
            setShowForm(false);
          }}
        />
      )}

      {loading && <p className="text-text-soft text-sm">Loading invoices...</p>}
      {error && <p className="text-danger text-sm">{error}</p>}
      {!loading && !error && invoices.length === 0 && (
        <p className="text-text-soft text-sm">No invoices yet.</p>
      )}

      <div className="space-y-4">
        {invoices.map((invoice) => (
          <div
            key={invoice.id}
            className="bg-white border border-slate-200 rounded-[20px] p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
          >
            <div>
              <div className="flex items-center gap-3 mb-1">
                <span className="font-mono text-sm text-navy-secondary font-semibold">
                  {invoice.invoice_number}
                </span>
                <StatusBadge status={invoice.status} />
              </div>
              <p className="text-text-soft text-sm">
                {invoice.user?.name} ({invoice.user?.email}) · Due {formatDate(invoice.due_date)}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="font-heading font-bold text-navy-primary text-lg">
                {formatMoney(invoice.amount_total, invoice.currency)}
              </div>
              {invoice.status !== 'paid' && (
                <MarkPaidControl invoice={invoice} onMarkedPaid={handleMarkedPaid} />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MarkPaidControl({
  invoice,
  onMarkedPaid,
}: {
  invoice: Invoice & { user: ClientAccount };
  onMarkedPaid: (updated: Invoice & { user: ClientAccount }) => void;
}) {
  const [open, setOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('bank_transfer');
  const [reference, setReference] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function handleConfirm() {
    setSubmitting(true);
    setError('');
    try {
      const payload: MarkInvoicePaidPayload = {
        payment_method: paymentMethod,
        reference: reference || undefined,
      };
      const res = await adminApi.markInvoicePaid(invoice.id, payload);
      onMarkedPaid(res.data);
      setOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to mark invoice as paid.');
    } finally {
      setSubmitting(false);
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="text-sm font-medium text-blue-primary hover:underline whitespace-nowrap"
      >
        Mark as Paid
      </button>
    );
  }

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 flex flex-col gap-2 w-full sm:w-64">
      <select
        value={paymentMethod}
        onChange={(e) => setPaymentMethod(e.target.value)}
        className="border border-slate-300 rounded-sm px-2 py-1.5 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-accent"
      >
        <option value="bank_transfer">Bank transfer</option>
        <option value="cash">Cash</option>
        <option value="pos">POS</option>
        <option value="other">Other</option>
      </select>
      <input
        value={reference}
        onChange={(e) => setReference(e.target.value)}
        placeholder="Reference (optional)"
        className="border border-slate-300 rounded-sm px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-accent"
      />
      {error && <p className="text-danger text-xs">{error}</p>}
      <div className="flex gap-2">
        <button
          onClick={handleConfirm}
          disabled={submitting}
          className="flex-1 text-xs font-semibold text-white bg-success rounded-sm py-1.5 disabled:opacity-60"
        >
          {submitting ? 'Saving...' : 'Confirm Paid'}
        </button>
        <button
          onClick={() => setOpen(false)}
          className="text-xs font-medium text-text-soft px-2"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

function NewInvoiceForm({
  clients,
  onCreated,
}: {
  clients: ClientAccount[];
  onCreated: (invoice: Invoice & { user: ClientAccount }) => void;
}) {
  const [userId, setUserId] = useState<number | ''>('');
  const [issueDate, setIssueDate] = useState(new Date().toISOString().slice(0, 10));
  const [dueDate, setDueDate] = useState('');
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState<LineItem[]>([{ ...emptyItem }]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const total = items.reduce((sum, item) => sum + item.quantity * item.unit_price, 0);

  function updateItem(index: number, patch: Partial<LineItem>) {
    setItems((prev) => prev.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!userId || !dueDate) return;
    setSubmitting(true);
    setError('');
    try {
      const res = await adminApi.createInvoice({
        user_id: userId,
        issue_date: issueDate,
        due_date: dueDate,
        notes: notes || undefined,
        items,
      });
      onCreated(res.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create invoice.');
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
        <label className="text-sm text-text-soft">
          Issue date
          <input
            type="date"
            required
            value={issueDate}
            onChange={(e) => setIssueDate(e.target.value)}
            className="block mt-1 w-full border border-slate-300 rounded-sm px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-accent"
          />
        </label>
        <label className="text-sm text-text-soft">
          Due date
          <input
            type="date"
            required
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
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

      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Notes (optional)"
        rows={2}
        className="w-full border border-slate-300 rounded-sm px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-accent"
      />

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
          {submitting ? 'Creating...' : 'Create Invoice'}
        </button>
      </div>
    </form>
  );
}