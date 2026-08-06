'use client';

import { useAuth } from '@/lib/auth-context';

export default function PortalDashboard() {
  const { user } = useAuth();

  return (
    <div>
      <h1 className="font-heading font-bold text-navy-primary text-2xl mb-2">
        Welcome{user ? `, ${user.name.split(' ')[0]}` : ''}
      </h1>
      <p className="text-text-soft mb-10">Here&apos;s a snapshot of your account with Abeekey.</p>

      <div className="grid sm:grid-cols-3 gap-6">
        <div className="bg-white border border-slate-200 rounded-[20px] p-6">
          <h3 className="font-heading font-semibold text-navy-primary mb-1">Invoices</h3>
          <p className="text-text-soft text-sm">Coming next — view and download your invoices here.</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-[20px] p-6">
          <h3 className="font-heading font-semibold text-navy-primary mb-1">Quotations</h3>
          <p className="text-text-soft text-sm">Track quotation requests and their status.</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-[20px] p-6">
          <h3 className="font-heading font-semibold text-navy-primary mb-1">Contracts</h3>
          <p className="text-text-soft text-sm">Access signed agreements and project scopes.</p>
        </div>
      </div>
    </div>
  );
}