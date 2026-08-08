'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';

export default function PortalDashboard() {
  const { user } = useAuth();

  return (
    <div>
      <h1 className="font-heading font-bold text-navy-primary text-2xl mb-2">
        Welcome{user ? `, ${user.name.split(' ')[0]}` : ''}
      </h1>
      <p className="text-text-soft mb-10">Here&apos;s a snapshot of your account with Abeekey.</p>

      <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-6">
        <Link
          href="/portal/invoices"
          className="bg-white border border-slate-200 rounded-[20px] p-6 hover:border-blue-primary/40 hover:-translate-y-0.5 transition-all"
        >
          <h3 className="font-heading font-semibold text-navy-primary mb-1">Invoices</h3>
          <p className="text-text-soft text-sm">View invoices and pay outstanding ones online.</p>
        </Link>
        <Link
          href="/portal/quotations"
          className="bg-white border border-slate-200 rounded-[20px] p-6 hover:border-blue-primary/40 hover:-translate-y-0.5 transition-all"
        >
          <h3 className="font-heading font-semibold text-navy-primary mb-1">Quotations</h3>
          <p className="text-text-soft text-sm">Track quotations and accept or decline them.</p>
        </Link>
        <Link
          href="/portal/contracts"
          className="bg-white border border-slate-200 rounded-[20px] p-6 hover:border-blue-primary/40 hover:-translate-y-0.5 transition-all"
        >
          <h3 className="font-heading font-semibold text-navy-primary mb-1">Contracts</h3>
          <p className="text-text-soft text-sm">Access agreements and project scopes.</p>
        </Link>
        <Link
          href="/portal/domains"
          className="bg-white border border-slate-200 rounded-[20px] p-6 hover:border-blue-primary/40 hover:-translate-y-0.5 transition-all"
        >
          <h3 className="font-heading font-semibold text-navy-primary mb-1">Domains</h3>
          <p className="text-text-soft text-sm">Domains registered through Abeekey.</p>
        </Link>
        <Link
          href="/portal/transactions"
          className="bg-white border border-slate-200 rounded-[20px] p-6 hover:border-blue-primary/40 hover:-translate-y-0.5 transition-all"
        >
          <h3 className="font-heading font-semibold text-navy-primary mb-1">Transactions</h3>
          <p className="text-text-soft text-sm">View payment history and download receipts.</p>
        </Link>
      </div>
    </div>
  );
}