'use client';

import { useEffect, useState } from 'react';
import { adminApi, ClientAccount, SupportTicket, SupportTicketMessage } from '@/lib/api';
import StatusBadge from '@/components/StatusBadge';

type AdminTicket = SupportTicket & { user: ClientAccount };

function formatDateTime(date: string) {
  return new Date(date).toLocaleString('en-NG', {
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
  });
}

const STATUS_FILTERS: { value: string; label: string }[] = [
  { value: '', label: 'All' },
  { value: 'open', label: 'Open' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'closed', label: 'Closed' },
];

export default function AdminSupportPage() {
  const [tickets, setTickets] = useState<AdminTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [activeTicketId, setActiveTicketId] = useState<number | null>(null);

  function reload() {
    setLoading(true);
    adminApi
      .getAdminSupportTickets(statusFilter || undefined)
      .then((res) => setTickets(res.data))
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load tickets.'))
      .finally(() => setLoading(false));
  }

  useEffect(reload, [statusFilter]);

  if (activeTicketId) {
    return (
      <AdminTicketThread
        ticketId={activeTicketId}
        onBack={() => {
          setActiveTicketId(null);
          reload();
        }}
      />
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-heading font-bold text-navy-primary text-2xl mb-1">Support Tickets</h1>
          <p className="text-text-soft">All client support tickets.</p>
        </div>
      </div>

      <div className="flex gap-2 mb-6">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setStatusFilter(f.value)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold ${
              statusFilter === f.value
                ? 'bg-navy-primary text-white'
                : 'bg-slate-100 text-text-soft hover:bg-slate-200'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading && <p className="text-text-soft text-sm">Loading tickets...</p>}
      {error && <p className="text-danger text-sm">{error}</p>}
      {!loading && !error && tickets.length === 0 && (
        <p className="text-text-soft text-sm">No tickets found.</p>
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
                {ticket.priority === 'high' && (
                  <span className="text-xs font-semibold text-danger">High priority</span>
                )}
              </div>
              <p className="font-medium text-navy-primary text-sm mb-0.5">{ticket.subject}</p>
              <p className="text-text-soft text-xs">
                {ticket.user?.name} ({ticket.user?.email})
              </p>
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

function AdminTicketThread({ ticketId, onBack }: { ticketId: number; onBack: () => void }) {
  const [ticket, setTicket] = useState<AdminTicket | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reply, setReply] = useState('');
  const [nextStatus, setNextStatus] = useState<SupportTicket['status']>('in_progress');
  const [sending, setSending] = useState(false);

  function reload() {
    setLoading(true);
    adminApi
      .getAdminSupportTicket(ticketId)
      .then((res) => {
        setTicket(res.data);
        setNextStatus(res.data.status === 'resolved' || res.data.status === 'closed' ? res.data.status : 'in_progress');
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load ticket.'))
      .finally(() => setLoading(false));
  }

  useEffect(reload, [ticketId]);

  async function handleReply(e: React.FormEvent) {
    e.preventDefault();
    if (!reply.trim()) return;
    setSending(true);
    try {
      await adminApi.replyToSupportTicket(ticketId, reply, nextStatus);
      setReply('');
      reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send reply.');
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
          <h1 className="font-heading font-bold text-navy-primary text-xl mb-1">{ticket.subject}</h1>
          <p className="text-text-soft text-sm mb-6">
            {ticket.user?.name} ({ticket.user?.email})
          </p>

          <div className="space-y-4 mb-6">
            {ticket.messages?.map((msg: SupportTicketMessage) => (
              <div
                key={msg.id}
                className={`max-w-lg p-4 rounded-2xl text-sm ${
                  msg.is_staff
                    ? 'bg-blue-primary/10 ml-auto'
                    : 'bg-navy-primary/5 border border-navy-primary/10 mr-auto'
                }`}
              >
                <p className="text-xs font-semibold text-navy-secondary mb-1">
                  {msg.is_staff ? 'Staff' : ticket.user?.name} · {formatDateTime(msg.created_at)}
                </p>
                <p className="whitespace-pre-line">{msg.message}</p>
              </div>
            ))}
          </div>

          <form onSubmit={handleReply} className="space-y-3">
            <textarea
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              rows={3}
              placeholder="Type your reply..."
              className="w-full border border-slate-300 rounded-sm px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-accent"
            />
            <div className="flex items-center justify-between gap-3">
              <select
                value={nextStatus}
                onChange={(e) => setNextStatus(e.target.value as SupportTicket['status'])}
                className="border border-slate-300 rounded-sm px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-accent"
              >
                <option value="in_progress">Set: In Progress</option>
                <option value="resolved">Set: Resolved</option>
                <option value="closed">Set: Closed</option>
                <option value="open">Set: Open</option>
              </select>
              <button
                type="submit"
                disabled={sending}
                className="px-6 py-2.5 rounded-sm font-semibold text-white bg-gradient-to-br from-blue-primary to-blue-accent disabled:opacity-60"
              >
                {sending ? 'Sending...' : 'Send Reply'}
              </button>
            </div>
          </form>
        </>
      )}
    </div>
  );
}