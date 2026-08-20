'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import {
  adminApi,
  StaffAccount,
  PermissionOption,
  CreateStaffPayload,
} from '@/lib/api';

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function AdminUsersPage() {
  const { user: currentUser } = useAuth();
  const [staff, setStaff] = useState<StaffAccount[]>([]);
  const [permissionOptions, setPermissionOptions] = useState<PermissionOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);

  function reload() {
    setLoading(true);
    Promise.all([adminApi.getStaffAccounts(), adminApi.getPermissionOptions()])
      .then(([staffRes, permRes]) => {
        setStaff(staffRes.data);
        setPermissionOptions(permRes.data);
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load users.'))
      .finally(() => setLoading(false));
  }

  useEffect(reload, []);

  // Non-admin staff never reach this page (nav hides it, and the backend
  // enforces it too), but guard anyway in case of a direct navigation.
  if (currentUser && currentUser.role !== 'admin') {
    return <p className="text-text-soft text-sm">Only admins can manage staff accounts.</p>;
  }

  async function togglePermission(u: StaffAccount, key: string) {
    const has = u.permissions?.includes(key);
    const nextPermissions = has
      ? (u.permissions ?? []).filter((p) => p !== key)
      : [...(u.permissions ?? []), key];

    const previous = staff;
    setStaff((prev) => prev.map((s) => (s.id === u.id ? { ...s, permissions: nextPermissions } : s)));
    try {
      await adminApi.updateStaffAccount(u.id, { permissions: nextPermissions });
    } catch (err) {
      setStaff(previous);
      setError(err instanceof Error ? err.message : 'Failed to update permissions.');
    }
  }

  async function toggleActive(u: StaffAccount) {
    const previous = staff;
    setStaff((prev) => prev.map((s) => (s.id === u.id ? { ...s, is_active: !s.is_active } : s)));
    try {
      await adminApi.updateStaffAccount(u.id, { is_active: !u.is_active });
    } catch (err) {
      setStaff(previous);
      setError(err instanceof Error ? err.message : 'Failed to update account status.');
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-heading font-bold text-navy-primary text-2xl mb-1">Users & Roles</h1>
          <p className="text-text-soft">Manage staff and admin accounts.</p>
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="px-5 py-2.5 rounded-sm text-sm font-semibold text-white bg-gradient-to-br from-blue-primary to-blue-accent"
        >
          {showForm ? 'Cancel' : '+ New Account'}
        </button>
      </div>

      {showForm && (
        <NewStaffForm
          permissionOptions={permissionOptions}
          onCreated={(created) => {
            setStaff((prev) => [...prev, created]);
            setShowForm(false);
          }}
        />
      )}

      {loading && <p className="text-text-soft text-sm">Loading...</p>}
      {error && <p className="text-danger text-sm mb-4">{error}</p>}

      <div className="space-y-4">
        {staff.map((u) => (
          <div key={u.id} className="bg-white border border-slate-200 rounded-[20px] p-6">
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="font-medium text-navy-primary">{u.name}</p>
                  <span
                    className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                      u.role === 'admin' ? 'bg-navy-primary/10 text-navy-primary' : 'bg-blue-primary/10 text-blue-primary'
                    }`}
                  >
                    {u.role}
                  </span>
                  {!u.is_active && (
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-danger/10 text-danger">
                      Deactivated
                    </span>
                  )}
                </div>
                <p className="text-text-soft text-sm">
                  {u.email} · Joined {formatDate(u.created_at)}
                  {u.last_login_at && ` · Last login ${formatDate(u.last_login_at)}`}
                </p>
              </div>

              {u.id !== currentUser?.id && (
                <button
                  onClick={() => toggleActive(u)}
                  className={`text-xs font-semibold whitespace-nowrap ${
                    u.is_active ? 'text-danger hover:underline' : 'text-success hover:underline'
                  }`}
                >
                  {u.is_active ? 'Deactivate' : 'Reactivate'}
                </button>
              )}
            </div>

            {u.role === 'staff' && (
              <div className="flex flex-wrap gap-2 pt-3 border-t border-slate-100">
                {permissionOptions.map((opt) => {
                  const checked = u.permissions?.includes(opt.key) ?? false;
                  return (
                    <button
                      key={opt.key}
                      onClick={() => togglePermission(u, opt.key)}
                      className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-colors ${
                        checked
                          ? 'bg-blue-primary text-white border-blue-primary'
                          : 'bg-white text-text-soft border-slate-300 hover:border-blue-accent'
                      }`}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            )}
            {u.role === 'admin' && (
              <p className="text-text-soft text-xs pt-3 border-t border-slate-100">
                Admins have full access to every section — no permissions to configure.
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function NewStaffForm({
  permissionOptions,
  onCreated,
}: {
  permissionOptions: PermissionOption[];
  onCreated: (staff: StaffAccount) => void;
}) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'admin' | 'staff'>('staff');
  const [permissions, setPermissions] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  function togglePermission(key: string) {
    setPermissions((prev) => (prev.includes(key) ? prev.filter((p) => p !== key) : [...prev, key]));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const payload: CreateStaffPayload = { name, email, role, permissions: role === 'staff' ? permissions : [] };
      const res = await adminApi.createStaffAccount(payload);
      onCreated(res.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create account.');
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
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Full name (first & last)"
          className="border border-slate-300 rounded-sm px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-accent"
        />
        <input
          required
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="border border-slate-300 rounded-sm px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-accent"
        />
        <select
          value={role}
          onChange={(e) => setRole(e.target.value as 'admin' | 'staff')}
          className="border border-slate-300 rounded-sm px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-accent"
        >
          <option value="staff">Staff (limited access)</option>
          <option value="admin">Admin (full access)</option>
        </select>
      </div>

      {role === 'staff' && (
        <div>
          <p className="text-text-soft text-xs mb-2">Grant access to:</p>
          <div className="flex flex-wrap gap-2">
            {permissionOptions.map((opt) => (
              <button
                key={opt.key}
                type="button"
                onClick={() => togglePermission(opt.key)}
                className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-colors ${
                  permissions.includes(opt.key)
                    ? 'bg-blue-primary text-white border-blue-primary'
                    : 'bg-white text-text-soft border-slate-300 hover:border-blue-accent'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <p className="text-text-soft text-xs">
        A temporary password will be emailed to this address on creation.
      </p>

      {error && <p className="text-danger text-sm">{error}</p>}
      <button
        type="submit"
        disabled={submitting}
        className="px-6 py-2.5 rounded-sm font-semibold text-white bg-gradient-to-br from-blue-primary to-blue-accent disabled:opacity-60"
      >
        {submitting ? 'Creating...' : 'Create Account'}
      </button>
    </form>
  );
}