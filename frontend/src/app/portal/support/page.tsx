'use client';

import { useEffect, useState } from 'react';
import { api, SupportTicket, SupportTicketMessage } from '@/lib/api';
import StatusBadge from '@/components/StatusBadge';

function formatDateTime(date: string) {
  return new Date(date).toLocaleString('en-NG', {
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export default function PortalSupportPage() {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [activeTicketId, setActiveTicketId] = useState<number | null>(null);

  function reload() {
    setLoading(true);
    api
      .getSupportTickets()
      .then((res) => setTickets(res.data))
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load tickets.'))
      .finally(() => setLoading(false));
  }

  useEffect(reload, []);

  const activeTicket = tickets.find((t) => t.id === activeTicketId);

  if (activeTicket) {
    return (
      <TicketThread
        ticketId={activeTicket.id}
        onBack={() => {
          setActiveTicketId(null);
          reload();
        }}
      />
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-heading font-bold text-navy-primary text-2xl mb-1">Support</h1>
          <p className="text-text-soft">Your support tickets.</p>
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="px-5 py-2.5 rounded-sm text-sm font-semibold text-white bg-gradient-to-br from-blue-primary to-blue-accent"
        >
          {showForm ? 'Cancel' : '+ New Ticket'}
        </button>
      </div>

      {showForm && (
        <NewTicketForm
          onCreated={(ticket) => {
            setTickets((prev) => [ticket, ...prev]);
            setShowForm(false);
          }}
        />
      )}

      {loading && <p className="text-text-soft text-sm">Loading tickets...</p>}
      {error && <p className="text-danger text-sm">{error}</p>}
      {!loading && !error && tickets.length === 0 && (
        <p className="text-text-soft text-sm">No support tickets yet.</p>
      )}

      <div className="space-y-3">
        {tickets.map((ticket) => (
          <button
            key={ticket.id}
            onClick={() => setActiveTicketId(ticket.id)}
            className="w-full text-left bg-white border border-slate-200 rounded-[20px] p-6 flex items-center justify-between gap-4 hover:border-blue-accent transition-colors"
          >
            <div>
              <div className="flex items-center gap-3 mb-1">
                <span className="font-mono text-sm text-navy-secondary font-semibold">
                  {ticket.ticket_number}
                </span>
                <StatusBadge status={ticket.status} />
              </div>
              <p className="font-medium text-navy-primary text-sm">{ticket.subject}</p>
            </div>
            <div className="text-text-soft text-xs whitespace-nowrap">
              {ticket.last_message_at && formatDateTime(ticket.last_message_at)}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function NewTicketForm({ onCreated }: { onCreated: (ticket: SupportTicket) => void }) {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [priority, setPriority] = useState<SupportTicket['priority']>('normal');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const res = await api.createSupportTicket({ subject, message, priority });
      onCreated(res.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to open ticket.');
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
        <input
          required
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="Subject"
          className="sm:col-span-2 border border-slate-300 rounded-sm px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-accent"
        />
        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value as SupportTicket['priority'])}
          className="border border-slate-300 rounded-sm px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-accent"
        >
          <option value="low">Low priority</option>
          <option value="normal">Normal priority</option>
          <option value="high">High priority</option>
        </select>
      </div>
      <textarea
        required
        minLength={10}
        rows={4}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Describe your issue..."
        className="w-full border border-slate-300 rounded-sm px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-accent"
      />
      {error && <p className="text-danger text-sm">{error}</p>}
      <button
        type="submit"
        disabled={submitting}
        className="px-6 py-2.5 rounded-sm font-semibold text-white bg-gradient-to-br from-blue-primary to-blue-accent disabled:opacity-60"
      >
        {submitting ? 'Opening...' : 'Open Ticket'}
      </button>
    </form>
  );
}

function TicketThread({ ticketId, onBack }: { ticketId: number; onBack: () => void }) {
  const [ticket, setTicket] = useState<SupportTicket | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reply, setReply] = useState('');
  const [sending, setSending] = useState(false);

  function reload() {
    setLoading(true);
    api
      .getSupportTicket(ticketId)
      .then((res) => setTicket(res.data))
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load ticket.'))
      .finally(() => setLoading(false));
  }

  useEffect(reload, [ticketId]);

  async function handleReply(e: React.FormEvent) {
    e.preventDefault();
    if (!reply.trim()) return;
    setSending(true);
    try {
      await api.addSupportTicketMessage(ticketId, reply);
      setReply('');
      reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message.');
    } finally {
      setSending(false);
    }
  }

  return (
    <div>
      <button onClick={onBack} className="text-sm text-blue-primary font-medium hover:underline mb-6">
        ← Back to tickets
      </button>

      {loading && <p className="text-text-soft text-sm">Loading...</p>}
      {error && <p className="text-danger text-sm mb-4">{error}</p>}

      {ticket && (
        <>
          <div className="flex items-center gap-3 mb-1">
            <span className="font-mono text-sm text-navy-secondary font-semibold">
              {ticket.ticket_number}
            </span>
            <StatusBadge status={ticket.status} />
          </div>
          <h1 className="font-heading font-bold text-navy-primary text-xl mb-6">{ticket.subject}</h1>

          <div className="space-y-4 mb-6">
            {ticket.messages?.map((msg: SupportTicketMessage) => (
              <div
                key={msg.id}
                className={`max-w-lg p-4 rounded-2xl text-sm ${
                  msg.is_staff
                    ? 'bg-navy-primary/5 border border-navy-primary/10 mr-auto'
                    : 'bg-blue-primary/10 ml-auto'
                }`}
              >
                <p className="text-xs font-semibold text-navy-secondary mb-1">
                  {msg.is_staff ? 'Abeekey Support' : 'You'} · {formatDateTime(msg.created_at)}
                </p>
                <p className="whitespace-pre-line">{msg.message}</p>
              </div>
            ))}
          </div>

          <form onSubmit={handleReply} className="flex gap-2">
            <input
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              placeholder="Type a reply..."
              className="flex-1 border border-slate-300 rounded-sm px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-accent"
            />
            <button
              type="submit"
              disabled={sending}
              className="px-5 py-2.5 rounded-sm font-semibold text-white bg-gradient-to-br from-blue-primary to-blue-accent disabled:opacity-60"
            >
              {sending ? 'Sending...' : 'Send'}
            </button>
          </form>
        </>
      )}
    </div>
  );
}