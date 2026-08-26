import type { Metadata } from 'next';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { fetchPublic, HostingPlan } from '@/lib/api';

export const metadata: Metadata = {
  title: 'Web Hosting Plans in Nigeria',
  description:
    'Fast, reliable web hosting from Abeekey — SSD storage, free SSL, and full support for websites hosted on Nigerian infrastructure.',
  alternates: { canonical: '/hosting' },
  openGraph: {
    title: 'Web Hosting Plans | Abeekey',
    description: 'Fast, reliable web hosting with free SSL and full support.',
    url: 'https://abeekey.com/hosting',
    type: 'website',
  },
};

function formatCurrency(amount: string, currency: string) {
  const symbol = currency === 'NGN' ? '₦' : `${currency} `;
  return `${symbol}${Number(amount).toLocaleString()}`;
}

async function getPlans(): Promise<HostingPlan[]> {
  try {
    const res = await fetchPublic<{ data: HostingPlan[] }>('/hosting-plans');
    return res.data;
  } catch {
    return [];
  }
}

export default async function HostingPage() {
  const plans = await getPlans();

  return (
    <>
      <Navbar />
      <main className="pt-[72px] min-h-screen bg-bg">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <p className="text-blue-primary font-semibold text-sm tracking-wide uppercase mb-2">Hosting</p>
          <h1 className="font-heading font-bold text-navy-primary text-4xl sm:text-5xl mb-4">
            Web hosting built for Nigerian businesses
          </h1>
          <p className="text-text-soft text-lg max-w-2xl mb-12">
            Fast SSD storage, free SSL, and a support team that answers. Pick a plan and we&apos;ll have
            your site live the same day.
          </p>

          {plans.length === 0 ? (
            <p className="text-text-soft text-sm">
              Hosting plans aren&apos;t available right now — reach us at{' '}
              <a href="mailto:info@abeekey.com" className="text-blue-primary hover:underline">
                info@abeekey.com
              </a>{' '}
              and we&apos;ll set you up directly.
            </p>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {plans.map((plan) => (
                <div
                  key={plan.id}
                  className="bg-white border border-slate-200 rounded-[24px] p-8 flex flex-col hover:border-blue-accent transition-colors"
                >
                  <h2 className="font-heading font-bold text-navy-primary text-xl mb-1">{plan.name}</h2>
                  {plan.description && <p className="text-text-soft text-sm mb-5">{plan.description}</p>}

                  <div className="mb-6">
                    <span className="font-heading font-bold text-navy-primary text-3xl">
                      {formatCurrency(plan.price_monthly, plan.currency)}
                    </span>
                    <span className="text-text-soft text-sm">/mo</span>
                    <p className="text-text-soft text-xs mt-1">
                      or {formatCurrency(plan.price_annual, plan.currency)}/yr
                    </p>
                  </div>

                  <ul className="space-y-2.5 text-sm text-text-soft mb-8 flex-1">
                    <li>{plan.disk_gb}GB SSD storage</li>
                    <li>{plan.bandwidth_gb ? `${plan.bandwidth_gb}GB bandwidth` : 'Unlimited bandwidth'}</li>
                    <li>{plan.website_count} website{plan.website_count > 1 ? 's' : ''}</li>
                    <li>{plan.email_accounts ? `${plan.email_accounts} email accounts` : 'Unlimited email accounts'}</li>
                    <li>{plan.databases ? `${plan.databases} databases` : 'Unlimited databases'}</li>
                    {plan.free_ssl && <li>Free SSL certificate</li>}
                    {plan.features?.map((feature) => <li key={feature}>{feature}</li>)}
                  </ul>

                  <Link
                    href={`/portal/hosting/purchase?plan=${plan.slug}`}
                    className="text-center py-3 rounded-sm font-semibold text-white bg-gradient-to-br from-blue-primary to-blue-accent hover:opacity-90 transition-opacity"
                  >
                    Choose {plan.name}
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
