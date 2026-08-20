'use client';

import { useEffect, useState } from 'react';
import { api, SecurityOverview, ApiError } from '@/lib/api';

function formatDateTime(date: string) {
  return new Date(date).toLocaleString('en-NG', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export default function PortalSecurityPage() {
  const [overview, setOverview] = useState<SecurityOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  function reload() {
    setLoading(true);
    api
      .getSecurityOverview()
      .then((res) => setOverview(res.data))
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load security info.'))
      .finally(() => setLoading(false));
  }

  useEffect(reload, []);

  return (
    <div className="max-w-2xl">
      <h1 className="font-heading font-bold text-navy-primary text-2xl mb-1">Security</h1>
      <p className="text-text-soft mb-8">Review your login activity and active sessions.</p>

      {loading && <p className="text-text-soft text-sm">Loading...</p>}
      {error && <p className="text-danger text-sm">{error}</p>}

      {overview && (
        <>
          <div className="bg-white border border-slate-200 rounded-[20px] p-6 mb-6">
            <h2 className="font-heading font-semibold text-navy-primary mb-3">Last login</h2>
            {overview.last_login_at ? (
              <p className="text-sm text-text-soft">
                {formatDateTime(overview.last_login_at)}
                {overview.last_login_ip && ` from ${overview.last_login_ip}`}
              </p>
            ) : (
              <p className="text-sm text-text-soft">No previous login recorded.</p>
            )}
          </div>

          <div className="bg-white border border-slate-200 rounded-[20px] p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-heading font-semibold text-navy-primary">Active sessions</h2>
              <LogoutOthersButton onDone={reload} disabled={overview.sessions.length <= 1} />
            </div>

            <div className="space-y-3">
              {overview.sessions.map((session) => (
                <div
                  key={session.id}
                  className="flex items-center justify-between border border-slate-100 rounded-lg p-3"
                >
                  <div>
                    <p className="text-sm font-medium text-navy-primary">
                      {session.device}
                      {session.is_current_device && (
                        <span className="ml-2 text-xs font-semibold text-success">This device</span>
                      )}
                    </p>
                    <p className="text-text-soft text-xs">
                      {session.ip_address ?? 'Unknown IP'} · Active {formatDateTime(session.last_active_at)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function LogoutOthersButton({ onDone, disabled }: { onDone: () => void; disabled: boolean }) {
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function handleConfirm(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await api.logoutOtherSessions(password);
      setOpen(false);
      setPassword('');
      onDone();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to log out other sessions.');
    } finally {
      setSubmitting(false);
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        disabled={disabled}
        className="text-sm font-medium text-blue-primary hover:underline disabled:opacity-40 disabled:no-underline"
      >
        Log out other devices
      </button>
    );
  }

  return (
    <form onSubmit={handleConfirm} className="flex items-center gap-2">
      <input
        type="password"
        required
        placeholder="Confirm password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="border border-slate-300 rounded-sm px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-accent"
      />
      <button
        type="submit"
        disabled={submitting}
        className="text-xs font-semibold text-white bg-danger rounded-sm px-3 py-1.5 disabled:opacity-60"
      >
        {submitting ? 'Working...' : 'Confirm'}
      </button>
      <button type="button" onClick={() => setOpen(false)} className="text-xs text-text-soft">
        Cancel
      </button>
      {error && <p className="text-danger text-xs">{error}</p>}
    </form>
  );
}