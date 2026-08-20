'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { api, ApiError } from '@/lib/api';

export default function PortalProfilePage() {
  const { user, setUser } = useAuth();

  if (!user) return null;

  return (
    <div className="max-w-lg">
      <h1 className="font-heading font-bold text-navy-primary text-2xl mb-1">Profile</h1>
      <p className="text-text-soft mb-8">Manage your account details.</p>

      <ProfileForm name={user.name} phone={user.phone} onSaved={setUser} />
      <PasswordForm />
    </div>
  );
}

function ProfileForm({
  name,
  phone,
  onSaved,
}: {
  name: string;
  phone: string | null;
  onSaved: (user: import('@/lib/api').AuthUser) => void;
}) {
  const [formName, setFormName] = useState(name);
  const [formPhone, setFormPhone] = useState(phone ?? '');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess(false);
    try {
      const res = await api.updateProfile({ name: formName, phone: formPhone || undefined });
      onSaved(res.data);
      setSuccess(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to update profile.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white border border-slate-200 rounded-[20px] p-6 mb-6 space-y-4"
    >
      <h2 className="font-heading font-semibold text-navy-primary">Account details</h2>

      <label className="block text-sm text-text-soft">
        Full name
        <input
          required
          value={formName}
          onChange={(e) => setFormName(e.target.value)}
          className="block mt-1 w-full border border-slate-300 rounded-sm px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-accent"
        />
      </label>

      <label className="block text-sm text-text-soft">
        Phone
        <input
          value={formPhone}
          onChange={(e) => setFormPhone(e.target.value)}
          placeholder="+234 8012345678"
          className="block mt-1 w-full border border-slate-300 rounded-sm px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-accent"
        />
      </label>

      <p className="text-text-soft text-xs">
        Email changes aren&apos;t supported yet — contact us if you need to update it.
      </p>

      {error && <p className="text-danger text-sm">{error}</p>}
      {success && <p className="text-success text-sm">Profile updated.</p>}

      <button
        type="submit"
        disabled={submitting}
        className="px-6 py-2.5 rounded-sm font-semibold text-white bg-gradient-to-br from-blue-primary to-blue-accent disabled:opacity-60"
      >
        {submitting ? 'Saving...' : 'Save changes'}
      </button>
    </form>
  );
}

function PasswordForm() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess(false);
    try {
      await api.updatePassword({
        current_password: currentPassword,
        password,
        password_confirmation: passwordConfirmation,
      });
      setSuccess(true);
      setCurrentPassword('');
      setPassword('');
      setPasswordConfirmation('');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to update password.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white border border-slate-200 rounded-[20px] p-6 space-y-4"
    >
      <h2 className="font-heading font-semibold text-navy-primary">Change password</h2>

      <label className="block text-sm text-text-soft">
        Current password
        <input
          required
          type="password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          className="block mt-1 w-full border border-slate-300 rounded-sm px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-accent"
        />
      </label>

      <label className="block text-sm text-text-soft">
        New password
        <input
          required
          type="password"
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="block mt-1 w-full border border-slate-300 rounded-sm px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-accent"
        />
      </label>

      <label className="block text-sm text-text-soft">
        Confirm new password
        <input
          required
          type="password"
          minLength={8}
          value={passwordConfirmation}
          onChange={(e) => setPasswordConfirmation(e.target.value)}
          className="block mt-1 w-full border border-slate-300 rounded-sm px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-accent"
        />
      </label>

      {error && <p className="text-danger text-sm">{error}</p>}
      {success && <p className="text-success text-sm">Password updated.</p>}

      <button
        type="submit"
        disabled={submitting}
        className="px-6 py-2.5 rounded-sm font-semibold text-white bg-gradient-to-br from-blue-primary to-blue-accent disabled:opacity-60"
      >
        {submitting ? 'Updating...' : 'Update password'}
      </button>
    </form>
  );
}