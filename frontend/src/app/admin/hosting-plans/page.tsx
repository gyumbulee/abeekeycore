'use client';

import { useEffect, useState } from 'react';
import { adminApi, HostingPlan, CreateHostingPlanPayload } from '@/lib/api';

function formatCurrency(amount: string | number, currency: string) {
  const symbol = currency === 'NGN' ? '₦' : `${currency} `;
  return `${symbol}${Number(amount).toLocaleString()}`;
}

export default function AdminHostingPlansPage() {
  const [plans, setPlans] = useState<HostingPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState<HostingPlan | 'new' | null>(null);

  function reload() {
    setLoading(true);
    adminApi
      .getHostingPlans()
      .then((res) => setPlans(res.data))
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load plans.'))
      .finally(() => setLoading(false));
  }

  useEffect(reload, []);

  async function handleDelete(id: number) {
    if (!confirm('Delete this plan? This is only possible if it has no existing orders.')) return;
    try {
      await adminApi.deleteHostingPlan(id);
      reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete plan.');
    }
  }

  if (editing) {
    return (
      <PlanEditor
        plan={editing === 'new' ? null : editing}
        onSaved={() => {
          setEditing(null);
          reload();
        }}
        onCancel={() => setEditing(null)}
      />
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-heading font-bold text-navy-primary text-2xl mb-1">Hosting Plans</h1>
          <p className="text-text-soft">The catalog clients choose from when purchasing hosting.</p>
        </div>
        <button
          onClick={() => setEditing('new')}
          className="px-5 py-2.5 rounded-sm text-sm font-semibold text-white bg-gradient-to-br from-blue-primary to-blue-accent"
        >
          + New Plan
        </button>
      </div>

      {loading && <p className="text-text-soft text-sm">Loading plans...</p>}
      {error && <p className="text-danger text-sm mb-4">{error}</p>}
      {!loading && !error && plans.length === 0 && <p className="text-text-soft text-sm">No plans yet.</p>}

      <div className="space-y-3">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className="bg-white border border-slate-200 rounded-[20px] p-6 flex items-center justify-between gap-4"
          >
            <div>
              <div className="flex items-center gap-2 mb-1">
                <p className="font-medium text-navy-primary">{plan.name}</p>
                <span
                  className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                    plan.is_active ? 'bg-success/10 text-success' : 'bg-slate-200 text-text-soft'
                  }`}
                >
                  {plan.is_active ? 'active' : 'inactive'}
                </span>
              </div>
              <p className="text-text-soft text-xs">
                {formatCurrency(plan.price_monthly, plan.currency)}/mo ·{' '}
                {formatCurrency(plan.price_annual, plan.currency)}/yr · {plan.disk_gb}GB disk ·{' '}
                {plan.bandwidth_gb ? `${plan.bandwidth_gb}GB bandwidth` : 'Unlimited bandwidth'}
              </p>
            </div>
            <div className="flex items-center gap-4 shrink-0">
              <button
                onClick={() => setEditing(plan)}
                className="text-sm font-medium text-blue-primary hover:underline"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(plan.id)}
                className="text-sm font-medium text-danger hover:underline"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PlanEditor({
  plan,
  onSaved,
  onCancel,
}: {
  plan: HostingPlan | null;
  onSaved: () => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(plan?.name ?? '');
  const [description, setDescription] = useState(plan?.description ?? '');
  const [diskGb, setDiskGb] = useState(plan?.disk_gb ?? 10);
  const [bandwidthGb, setBandwidthGb] = useState(plan?.bandwidth_gb?.toString() ?? '');
  const [websiteCount, setWebsiteCount] = useState(plan?.website_count ?? 1);
  const [emailAccounts, setEmailAccounts] = useState(plan?.email_accounts?.toString() ?? '');
  const [databases, setDatabases] = useState(plan?.databases?.toString() ?? '');
  const [freeSsl, setFreeSsl] = useState(plan?.free_ssl ?? true);
  const [features, setFeatures] = useState((plan?.features ?? []).join(', '));
  const [priceMonthly, setPriceMonthly] = useState(plan?.price_monthly ?? '');
  const [priceAnnual, setPriceAnnual] = useState(plan?.price_annual ?? '');
  const [phpVersion, setPhpVersion] = useState(plan?.php_version ?? '8.4');
  const [isActive, setIsActive] = useState(plan?.is_active ?? true);
  const [sortOrder, setSortOrder] = useState(plan?.sort_order ?? 0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      const payload: CreateHostingPlanPayload = {
        name,
        description: description || undefined,
        disk_gb: Number(diskGb),
        bandwidth_gb: bandwidthGb ? Number(bandwidthGb) : undefined,
        website_count: Number(websiteCount),
        email_accounts: emailAccounts ? Number(emailAccounts) : undefined,
        databases: databases ? Number(databases) : undefined,
        free_ssl: freeSsl,
        features: features.trim() ? features.split(',').map((f) => f.trim()).filter(Boolean) : undefined,
        price_monthly: Number(priceMonthly),
        price_annual: Number(priceAnnual),
        php_version: phpVersion,
        is_active: isActive,
        sort_order: Number(sortOrder),
      };

      if (plan) {
        await adminApi.updateHostingPlan(plan.id, payload);
      } else {
        await adminApi.createHostingPlan(payload);
      }
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save plan.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-2xl">
      <button onClick={onCancel} className="text-sm text-blue-primary font-medium hover:underline mb-6">
        ← Back to plans
      </button>

      <h1 className="font-heading font-bold text-navy-primary text-2xl mb-6">
        {plan ? 'Edit Plan' : 'New Plan'}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Plan name, e.g. Starter"
          className="w-full border border-slate-300 rounded-sm px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-accent"
        />

        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          placeholder="Short description shown on the pricing page (optional)"
          className="w-full border border-slate-300 rounded-sm px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-accent"
        />

        <div className="grid sm:grid-cols-2 gap-4">
          <label className="text-xs text-text-soft block">
            Disk (GB)
            <input
              required
              type="number"
              min={1}
              value={diskGb}
              onChange={(e) => setDiskGb(Number(e.target.value))}
              className="mt-1 w-full border border-slate-300 rounded-sm px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-accent"
            />
          </label>
          <label className="text-xs text-text-soft block">
            Bandwidth (GB, blank = unlimited)
            <input
              type="number"
              min={1}
              value={bandwidthGb}
              onChange={(e) => setBandwidthGb(e.target.value)}
              className="mt-1 w-full border border-slate-300 rounded-sm px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-accent"
            />
          </label>
        </div>

        <div className="grid sm:grid-cols-3 gap-4">
          <label className="text-xs text-text-soft block">
            Websites
            <input
              required
              type="number"
              min={1}
              value={websiteCount}
              onChange={(e) => setWebsiteCount(Number(e.target.value))}
              className="mt-1 w-full border border-slate-300 rounded-sm px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-accent"
            />
          </label>
          <label className="text-xs text-text-soft block">
            Email accounts (blank = unlimited)
            <input
              type="number"
              min={0}
              value={emailAccounts}
              onChange={(e) => setEmailAccounts(e.target.value)}
              className="mt-1 w-full border border-slate-300 rounded-sm px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-accent"
            />
          </label>
          <label className="text-xs text-text-soft block">
            Databases (blank = unlimited)
            <input
              type="number"
              min={0}
              value={databases}
              onChange={(e) => setDatabases(e.target.value)}
              className="mt-1 w-full border border-slate-300 rounded-sm px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-accent"
            />
          </label>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <label className="text-xs text-text-soft block">
            Monthly price (₦)
            <input
              required
              type="number"
              min={0}
              step="0.01"
              value={priceMonthly}
              onChange={(e) => setPriceMonthly(e.target.value)}
              className="mt-1 w-full border border-slate-300 rounded-sm px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-accent"
            />
          </label>
          <label className="text-xs text-text-soft block">
            Annual price (₦)
            <input
              required
              type="number"
              min={0}
              step="0.01"
              value={priceAnnual}
              onChange={(e) => setPriceAnnual(e.target.value)}
              className="mt-1 w-full border border-slate-300 rounded-sm px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-accent"
            />
          </label>
        </div>

        <label className="text-xs text-text-soft block">
          PHP version (must match a version installed in CloudPanel)
          <input
            required
            value={phpVersion}
            onChange={(e) => setPhpVersion(e.target.value)}
            placeholder="8.4"
            className="mt-1 w-full border border-slate-300 rounded-sm px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-accent"
          />
        </label>

        <input
          value={features}
          onChange={(e) => setFeatures(e.target.value)}
          placeholder="Feature bullets, comma-separated (e.g. Daily backups, 1-click WordPress)"
          className="w-full border border-slate-300 rounded-sm px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-accent"
        />

        <div className="flex items-center gap-6">
          <label className="flex items-center gap-2 text-sm text-text-soft">
            <input type="checkbox" checked={freeSsl} onChange={(e) => setFreeSsl(e.target.checked)} />
            Free SSL
          </label>
          <label className="flex items-center gap-2 text-sm text-text-soft">
            <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
            Active (visible to clients)
          </label>
          <label className="text-xs text-text-soft flex items-center gap-2">
            Sort order
            <input
              type="number"
              value={sortOrder}
              onChange={(e) => setSortOrder(Number(e.target.value))}
              className="w-20 border border-slate-300 rounded-sm px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-accent"
            />
          </label>
        </div>

        {error && <p className="text-danger text-sm">{error}</p>}

        <button
          type="submit"
          disabled={saving}
          className="px-6 py-2.5 rounded-sm font-semibold text-white bg-gradient-to-br from-blue-primary to-blue-accent disabled:opacity-60"
        >
          {saving ? 'Saving...' : plan ? 'Save Changes' : 'Create Plan'}
        </button>
      </form>
    </div>
  );
}
