'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { api, HostingPlan, DomainOrder } from '@/lib/api';

function formatCurrency(amount: string | number, currency: string) {
  const symbol = currency === 'NGN' ? '₦' : `${currency} `;
  return `${symbol}${Number(amount).toLocaleString()}`;
}

function PurchaseContent() {
  const params = useSearchParams();
  const preselectedSlug = params.get('plan') || '';

  const [plans, setPlans] = useState<HostingPlan[]>([]);
  const [myDomains, setMyDomains] = useState<DomainOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [selectedPlanId, setSelectedPlanId] = useState<number | null>(null);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('annual');
  const [domainSource, setDomainSource] = useState<'existing' | 'custom'>('custom');
  const [selectedDomainOrderId, setSelectedDomainOrderId] = useState<number | null>(null);
  const [customDomain, setCustomDomain] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    Promise.all([api.getHostingPlans(), api.getDomainOrders()])
      .then(([plansRes, domainsRes]) => {
        setPlans(plansRes.data);
        const registered = domainsRes.data.filter((d) => d.status === 'registered');
        setMyDomains(registered);

        const preselected = preselectedSlug
          ? plansRes.data.find((p) => p.slug === preselectedSlug)
          : null;
        setSelectedPlanId((preselected ?? plansRes.data[0])?.id ?? null);

        if (registered.length > 0) {
          setDomainSource('existing');
          setSelectedDomainOrderId(registered[0].id);
        }
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load hosting plans.'))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectedPlan = plans.find((p) => p.id === selectedPlanId) ?? null;
  const selectedDomainOrder = myDomains.find((d) => d.id === selectedDomainOrderId) ?? null;
  const domainName =
    domainSource === 'existing' && selectedDomainOrder
      ? `${selectedDomainOrder.domain_name}${selectedDomainOrder.tld}`
      : customDomain.trim().toLowerCase();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedPlan || !domainName) return;

    setSubmitting(true);
    setSubmitError('');
    try {
      const res = await api.createHostingOrder({
        hosting_plan_id: selectedPlan.id,
        domain_name: domainName,
        billing_cycle: billingCycle,
        domain_order_id: domainSource === 'existing' ? selectedDomainOrderId ?? undefined : undefined,
      });
      if (res.data.payment_link) {
        window.location.href = res.data.payment_link;
      } else {
        setSubmitError('Payment link unavailable. Please try again.');
        setSubmitting(false);
      }
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to start checkout.');
      setSubmitting(false);
    }
  }

  if (loading) return <p className="text-text-soft text-sm">Loading hosting plans...</p>;
  if (error) return <p className="text-danger text-sm">{error}</p>;
  if (plans.length === 0) {
    return <p className="text-text-soft text-sm">No hosting plans are currently available. Please contact us.</p>;
  }

  return (
    <div className="max-w-xl mx-auto">
      <h1 className="font-heading font-bold text-navy-primary text-2xl mb-1">Get Hosting</h1>
      <p className="text-text-soft mb-8">Choose a plan, point it at a domain, and you&apos;re live.</p>

      <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-[20px] p-7 space-y-6">
        <div>
          <label className="text-sm text-text-soft block mb-2">Plan</label>
          <div className="space-y-2">
            {plans.map((plan) => (
              <label
                key={plan.id}
                className={`flex items-center justify-between border rounded-lg px-4 py-3 cursor-pointer transition-colors ${
                  selectedPlanId === plan.id ? 'border-blue-accent bg-blue-accent/5' : 'border-slate-200'
                }`}
              >
                <span className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="plan"
                    checked={selectedPlanId === plan.id}
                    onChange={() => setSelectedPlanId(plan.id)}
                  />
                  <span>
                    <span className="font-medium text-navy-primary block">{plan.name}</span>
                    <span className="text-text-soft text-xs">
                      {plan.disk_gb}GB disk · {plan.bandwidth_gb ? `${plan.bandwidth_gb}GB bandwidth` : 'Unlimited bandwidth'}
                    </span>
                  </span>
                </span>
                <span className="font-heading font-semibold text-navy-primary text-sm whitespace-nowrap">
                  {formatCurrency(billingCycle === 'annual' ? plan.price_annual : plan.price_monthly, plan.currency)}
                  <span className="text-text-soft font-normal">/{billingCycle === 'annual' ? 'yr' : 'mo'}</span>
                </span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="text-sm text-text-soft block mb-2">Billing cycle</label>
          <div className="flex gap-2">
            {(['monthly', 'annual'] as const).map((cycle) => (
              <button
                key={cycle}
                type="button"
                onClick={() => setBillingCycle(cycle)}
                className={`flex-1 py-2.5 rounded-sm text-sm font-semibold border transition-colors capitalize ${
                  billingCycle === cycle
                    ? 'border-blue-accent bg-blue-accent/5 text-blue-primary'
                    : 'border-slate-300 text-text-soft'
                }`}
              >
                {cycle}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-sm text-text-soft block mb-2">Domain</label>
          {myDomains.length > 0 && (
            <div className="flex gap-2 mb-3">
              <button
                type="button"
                onClick={() => setDomainSource('existing')}
                className={`flex-1 py-2 rounded-sm text-xs font-semibold border transition-colors ${
                  domainSource === 'existing'
                    ? 'border-blue-accent bg-blue-accent/5 text-blue-primary'
                    : 'border-slate-300 text-text-soft'
                }`}
              >
                Use a domain I registered here
              </button>
              <button
                type="button"
                onClick={() => setDomainSource('custom')}
                className={`flex-1 py-2 rounded-sm text-xs font-semibold border transition-colors ${
                  domainSource === 'custom'
                    ? 'border-blue-accent bg-blue-accent/5 text-blue-primary'
                    : 'border-slate-300 text-text-soft'
                }`}
              >
                Use another domain
              </button>
            </div>
          )}

          {domainSource === 'existing' && myDomains.length > 0 ? (
            <select
              value={selectedDomainOrderId ?? ''}
              onChange={(e) => setSelectedDomainOrderId(Number(e.target.value))}
              className="w-full border border-slate-300 rounded-sm px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-accent"
            >
              {myDomains.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.domain_name}
                  {d.tld}
                </option>
              ))}
            </select>
          ) : (
            <input
              required
              placeholder="e.g. mybusiness.com"
              value={customDomain}
              onChange={(e) => setCustomDomain(e.target.value)}
              className="w-full border border-slate-300 rounded-sm px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-accent"
            />
          )}
          <p className="text-text-soft text-xs mt-2">
            Not registered with us yet? That&apos;s fine — point this domain&apos;s nameservers at our
            server once it&apos;s live, and we&apos;ll walk you through it.
          </p>
        </div>

        {submitError && <p className="text-danger text-sm">{submitError}</p>}

        <button
          type="submit"
          disabled={submitting || !selectedPlan || !domainName}
          className="w-full py-3.5 rounded-sm font-semibold text-white bg-gradient-to-br from-blue-primary to-blue-accent shadow-[0_4px_18px_rgba(37,99,235,0.35)] disabled:opacity-60"
        >
          {submitting ? 'Redirecting to payment...' : 'Continue to Payment'}
        </button>
      </form>
    </div>
  );
}

export default function HostingPurchasePage() {
  return (
    <Suspense fallback={null}>
      <PurchaseContent />
    </Suspense>
  );
}
