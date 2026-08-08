'use client';

import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { api, Registrant } from '@/lib/api';

const NIGERIAN_STATES = [
  'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue', 'Borno',
  'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 'FCT', 'Gombe', 'Imo',
  'Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara', 'Lagos', 'Nasarawa',
  'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo', 'Plateau', 'Rivers', 'Sokoto', 'Taraba',
  'Yobe', 'Zamfara',
];

function RegisterContent() {
  const params = useSearchParams();
  const domain = params.get('domain') || '';
  const tld = params.get('tld') || '';

  const [years, setYears] = useState(1);
  const [form, setForm] = useState<Registrant>({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: 'Plateau',
    postal_code: '',
    country: 'NG',
  });
  const [status, setStatus] = useState<'idle' | 'submitting' | 'error'>('idle');
  const [error, setError] = useState('');

  function update<K extends keyof Registrant>(key: K, value: Registrant[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('submitting');
    setError('');
    try {
      const res = await api.createDomainOrder({ domain, tld, years, registrant: form });
      if (res.data.payment_link) {
        window.location.href = res.data.payment_link;
      } else {
        setError('Payment link unavailable. Please try again.');
        setStatus('error');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start registration.');
      setStatus('error');
    }
  }

  if (!domain || !tld) {
    return (
      <p className="text-danger text-sm">
        No domain specified. Please search for a domain from the homepage first.
      </p>
    );
  }

  return (
    <div className="max-w-xl mx-auto">
      <h1 className="font-heading font-bold text-navy-primary text-2xl mb-1">
        Register {domain}
        {tld}
      </h1>
      <p className="text-text-soft mb-8">Registrant details are required by domain registry policy.</p>

      <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-[20px] p-7 space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <input
            required
            placeholder="First name"
            value={form.first_name}
            onChange={(e) => update('first_name', e.target.value)}
            className="border border-slate-300 rounded-sm px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-accent"
          />
          <input
            required
            placeholder="Last name"
            value={form.last_name}
            onChange={(e) => update('last_name', e.target.value)}
            className="border border-slate-300 rounded-sm px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-accent"
          />
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <input
            required
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) => update('email', e.target.value)}
            className="border border-slate-300 rounded-sm px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-accent"
          />
          <input
            required
            placeholder="Phone"
            value={form.phone}
            onChange={(e) => update('phone', e.target.value)}
            className="border border-slate-300 rounded-sm px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-accent"
          />
        </div>

        <input
          required
          placeholder="Street address"
          value={form.address}
          onChange={(e) => update('address', e.target.value)}
          className="w-full border border-slate-300 rounded-sm px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-accent"
        />

        <div className="grid sm:grid-cols-3 gap-4">
          <input
            required
            placeholder="City"
            value={form.city}
            onChange={(e) => update('city', e.target.value)}
            className="border border-slate-300 rounded-sm px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-accent"
          />
          <select
            value={form.state}
            onChange={(e) => update('state', e.target.value)}
            className="border border-slate-300 rounded-sm px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-accent"
          >
            {NIGERIAN_STATES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <input
            placeholder="Postal code (optional)"
            value={form.postal_code}
            onChange={(e) => update('postal_code', e.target.value)}
            className="border border-slate-300 rounded-sm px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-accent"
          />
        </div>

        <label className="text-sm text-text-soft block">
          Registration period
          <select
            value={years}
            onChange={(e) => setYears(Number(e.target.value))}
            className="block mt-1 w-full border border-slate-300 rounded-sm px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-accent"
          >
            {[1, 2, 3, 5, 10].map((y) => (
              <option key={y} value={y}>
                {y} year{y > 1 ? 's' : ''}
              </option>
            ))}
          </select>
        </label>

        {error && <p className="text-danger text-sm">{error}</p>}

        <button
          type="submit"
          disabled={status === 'submitting'}
          className="w-full py-3.5 rounded-sm font-semibold text-white bg-gradient-to-br from-blue-primary to-blue-accent shadow-[0_4px_18px_rgba(37,99,235,0.35)] disabled:opacity-60"
        >
          {status === 'submitting' ? 'Redirecting to payment...' : 'Continue to Payment'}
        </button>
      </form>
    </div>
  );
}

export default function DomainRegisterPage() {
  return (
    <Suspense fallback={null}>
      <RegisterContent />
    </Suspense>
  );
}