'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { adminApi, SettingsOverview } from '@/lib/api';

function SourceTag({ source }: { source: 'db' | 'env' }) {
  return (
    <span
      className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
        source === 'db' ? 'bg-success/10 text-success' : 'bg-slate-200 text-text-soft'
      }`}
    >
      {source === 'db' ? 'Custom' : 'Default (.env)'}
    </span>
  );
}

export default function AdminSettingsPage() {
  const { user } = useAuth();
  const [settings, setSettings] = useState<SettingsOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [markupPercent, setMarkupPercent] = useState('');
  const [usdToNgnRate, setUsdToNgnRate] = useState('');
  const [tldOverrides, setTldOverrides] = useState<{ tld: string; percent: string }[]>([]);
  const [saving, setSaving] = useState(false);

  function reload() {
    setLoading(true);
    adminApi
      .getSettings()
      .then((res) => {
        setSettings(res.data);
        setMarkupPercent(String(res.data.domains.markup_percent.value));
        setUsdToNgnRate(String(res.data.domains.usd_to_ngn_rate.value));
        setTldOverrides(
          Object.entries(res.data.domains.tld_markup_overrides.value).map(([tld, percent]) => ({
            tld,
            percent: String(percent),
          }))
        );
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load settings.'))
      .finally(() => setLoading(false));
  }

  useEffect(reload, []);

  // Non-admin staff never reach this page (nav hides it, and the backend
  // enforces it too via the 'settings' permission), but guard anyway in
  // case of a direct navigation.
  if (user && user.role !== 'admin') {
    return <p className="text-text-soft text-sm">Only admins can manage platform settings.</p>;
  }

  function updateOverrideRow(index: number, patch: Partial<{ tld: string; percent: string }>) {
    setTldOverrides((prev) => prev.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess(false);

    const overridesObject: Record<string, number> = {};
    for (const row of tldOverrides) {
      if (!row.tld.trim()) continue;
      const percent = parseFloat(row.percent);
      if (Number.isNaN(percent)) {
        setError(`Invalid percentage for ${row.tld}.`);
        setSaving(false);
        return;
      }
      overridesObject[row.tld.trim()] = percent;
    }

    try {
      const res = await adminApi.updateSettings({
        markup_percent: parseFloat(markupPercent),
        usd_to_ngn_rate: parseFloat(usdToNgnRate),
        tld_markup_overrides: overridesObject,
      });
      setSettings(res.data);
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save settings.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-2xl">
      <h1 className="font-heading font-bold text-navy-primary text-2xl mb-1">Settings</h1>
      <p className="text-text-soft mb-8">Domain pricing — takes effect immediately, no redeploy needed.</p>

      {loading && <p className="text-text-soft text-sm">Loading...</p>}
      {error && <p className="text-danger text-sm mb-4">{error}</p>}

      {settings && (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-[20px] p-6">
            <div className="flex items-center justify-between mb-1">
              <label className="font-heading font-semibold text-navy-primary text-sm">
                Default markup (%)
              </label>
              <SourceTag source={settings.domains.markup_percent.source} />
            </div>
            <p className="text-text-soft text-xs mb-2">
              Applied to any TLD without its own override below.
            </p>
            <input
              type="number"
              min={0}
              step="0.1"
              value={markupPercent}
              onChange={(e) => setMarkupPercent(e.target.value)}
              className="w-40 border border-slate-300 rounded-sm px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-accent"
            />
          </div>

          <div className="bg-white border border-slate-200 rounded-[20px] p-6">
            <div className="flex items-center justify-between mb-1">
              <label className="font-heading font-semibold text-navy-primary text-sm">
                USD → NGN rate
              </label>
              <SourceTag source={settings.domains.usd_to_ngn_rate.source} />
            </div>
            <p className="text-text-soft text-xs mb-2">
              ConnectReseller quotes USD-priced TLDs — this converts them to NGN before markup.
            </p>
            <input
              type="number"
              min={1}
              step="1"
              value={usdToNgnRate}
              onChange={(e) => setUsdToNgnRate(e.target.value)}
              className="w-40 border border-slate-300 rounded-sm px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-accent"
            />
          </div>

          <div className="bg-white border border-slate-200 rounded-[20px] p-6">
            <div className="flex items-center justify-between mb-1">
              <label className="font-heading font-semibold text-navy-primary text-sm">
                Per-TLD markup overrides (%)
              </label>
              <SourceTag source={settings.domains.tld_markup_overrides.source} />
            </div>
            <p className="text-text-soft text-xs mb-3">
              e.g. <span className="font-mono">.com</span> → 30 means .com sells at cost + 30%.
            </p>

            <div className="space-y-2">
              {tldOverrides.map((row, i) => (
                <div key={i} className="grid grid-cols-[1fr_100px_28px] gap-2 items-center">
                  <input
                    value={row.tld}
                    onChange={(e) => updateOverrideRow(i, { tld: e.target.value })}
                    placeholder=".com"
                    className="border border-slate-300 rounded-sm px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-accent"
                  />
                  <input
                    type="number"
                    min={0}
                    step="0.1"
                    value={row.percent}
                    onChange={(e) => updateOverrideRow(i, { percent: e.target.value })}
                    placeholder="30"
                    className="border border-slate-300 rounded-sm px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-accent"
                  />
                  <button
                    type="button"
                    onClick={() => setTldOverrides((prev) => prev.filter((_, idx) => idx !== i))}
                    className="text-text-soft hover:text-danger text-lg leading-none"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setTldOverrides((prev) => [...prev, { tld: '', percent: '' }])}
              className="text-sm text-blue-primary font-medium hover:underline mt-3"
            >
              + Add TLD override
            </button>
          </div>

          {success && <p className="text-success text-sm">Settings saved — new prices apply immediately.</p>}

          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 rounded-sm font-semibold text-white bg-gradient-to-br from-blue-primary to-blue-accent disabled:opacity-60"
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </form>
      )}
    </div>
  );
}