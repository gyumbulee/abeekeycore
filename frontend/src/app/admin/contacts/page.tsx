'use client';

import { useEffect, useState } from 'react';
import { adminApi, ContactMessageRecord } from '@/lib/api';
import StatusBadge from '@/components/StatusBadge';

const STATUS_FILTERS = ['all', 'new', 'replied'] as const;

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('en-NG', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export default function AdminContactsPage() {
  const [messages, setMessages] = useState<ContactMessageRecord[]>([]);
  const [filter, setFilter] = useState<(typeof STATUS_FILTERS)[number]>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openId, setOpenId] = useState<number | null>(null);

  function load(status: string) {
    setLoading(true);
    adminApi
      .getContacts(status === 'all' ? undefined : status)
      .then((res) => setMessages(res.data))
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load messages.'))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load(filter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  return (
    <div>
      <h1 className="font-heading font-bold text-navy-primary text-2xl mb-2">Contact Messages</h1>
      <p className="text-text-soft mb-6">Submissions from the public contact form.</p>

      <div className="flex gap-2 mb-8">
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

      {loading && <p className="text-text-soft text-sm">Loading messages...</p>}
      {error && <p className="text-danger text-sm">{error}</p>}
      {!loading && !error && messages.length === 0 && (
        <p className="text-text-soft text-sm">No messages in this category.</p>
      )}

      <div className="space-y-4">
        {messages.map((msg) => (
          <MessageCard
            key={msg.id}
            message={msg}
            open={openId === msg.id}
            onToggle={() => setOpenId(openId === msg.id ? null : msg.id)}
            onReplied={(updated) => {
              setMessages((prev) => prev.map((m) => (m.id === msg.id ? updated : m)));
              setOpenId(null);
            }}
          />
        ))}
      </div>
    </div>
  );
}

function MessageCard({
  message,
  open,
  onToggle,
  onReplied,
}: {
  message: ContactMessageRecord;
  open: boolean;
  onToggle: () => void;
  onReplied: (updated: ContactMessageRecord) => void;
}) {
  const [reply, setReply] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function handleReply() {
    if (!reply.trim()) return;
    setSubmitting(true);
    setError('');
    try {
      const res = await adminApi.replyToContact(message.id, reply);
      onReplied(res.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send reply.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="bg-white border border-slate-200 rounded-[20px] p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
        <div>
          <div className="flex items-center gap-3 mb-1 flex-wrap">
            <h3 className="font-heading font-semibold text-navy-primary">{message.name}</h3>
            <StatusBadge status={message.status} />
            {message.is_registered_user && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-navy-secondary/10 text-navy-secondary">
                Registered client
              </span>
            )}
          </div>
          <p className="text-text-soft text-sm">
            {message.email}
            {message.phone && ` · ${message.phone}`}
            {message.company && ` · ${message.company}`}
          </p>
        </div>
        <p className="text-text-soft text-xs whitespace-nowrap">{formatDate(message.created_at)}</p>
      </div>

      {message.subject && <p className="text-sm font-medium text-navy-primary mb-1">{message.subject}</p>}
      <p className="text-text-soft text-sm whitespace-pre-line">{message.message}</p>

      {message.status === 'replied' && message.reply_message && (
        <div className="mt-4 pt-4 border-t border-slate-100 bg-bg -mx-6 -mb-6 px-6 py-4 rounded-b-[20px]">
          <p className="text-xs font-semibold text-text-soft uppercase tracking-wide mb-1">Your reply</p>
          <p className="text-sm text-text whitespace-pre-line">{message.reply_message}</p>
        </div>
      )}

      {message.status === 'new' && (
        <div className="mt-4 pt-4 border-t border-slate-100">
          {!open ? (
            <button
              onClick={onToggle}
              className="px-4 py-2 rounded-sm text-sm font-semibold text-blue-primary border border-blue-primary/30 hover:bg-blue-primary/5"
            >
              Reply
            </button>
          ) : (
            <div className="space-y-3">
              <textarea
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                placeholder="Write your reply..."
                rows={4}
                className="w-full border border-slate-300 rounded-sm px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-accent"
              />
              {error && <p className="text-danger text-xs">{error}</p>}
              <div className="flex gap-3">
                <button
                  onClick={handleReply}
                  disabled={submitting || !reply.trim()}
                  className="px-5 py-2.5 rounded-sm text-sm font-semibold text-white bg-gradient-to-br from-blue-primary to-blue-accent disabled:opacity-60"
                >
                  {submitting ? 'Sending...' : 'Send Reply'}
                </button>
                <button
                  onClick={onToggle}
                  className="px-5 py-2.5 rounded-sm text-sm font-semibold text-text-soft border border-slate-300 hover:bg-slate-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}