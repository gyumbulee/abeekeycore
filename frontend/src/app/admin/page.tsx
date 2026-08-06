import Link from 'next/link';

export default function AdminDashboard() {
  return (
    <div>
      <h1 className="font-heading font-bold text-navy-primary text-2xl mb-2">Admin Dashboard</h1>
      <p className="text-text-soft mb-10">Manage leads, quotations, and client accounts.</p>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Link
          href="/admin/leads"
          className="bg-white border border-slate-200 rounded-[20px] p-6 hover:border-blue-primary/40 hover:-translate-y-0.5 transition-all"
        >
          <h3 className="font-heading font-semibold text-navy-primary mb-1">Leads (CRM)</h3>
          <p className="text-text-soft text-sm">
            Review incoming quotation requests and convert them into formal quotations.
          </p>
        </Link>
        <Link
          href="/admin/invoices"
          className="bg-white border border-slate-200 rounded-[20px] p-6 hover:border-blue-primary/40 hover:-translate-y-0.5 transition-all"
        >
          <h3 className="font-heading font-semibold text-navy-primary mb-1">Invoices</h3>
          <p className="text-text-soft text-sm">Create and manage client invoices.</p>
        </Link>
        <Link
          href="/admin/contracts"
          className="bg-white border border-slate-200 rounded-[20px] p-6 hover:border-blue-primary/40 hover:-translate-y-0.5 transition-all"
        >
          <h3 className="font-heading font-semibold text-navy-primary mb-1">Contracts</h3>
          <p className="text-text-soft text-sm">Draft and manage client contracts.</p>
        </Link>
        <Link
          href="/admin/transactions"
          className="bg-white border border-slate-200 rounded-[20px] p-6 hover:border-blue-primary/40 hover:-translate-y-0.5 transition-all"
        >
          <h3 className="font-heading font-semibold text-navy-primary mb-1">Transactions</h3>
          <p className="text-text-soft text-sm">View all client payments and receipts.</p>
        </Link>
      </div>
    </div>
  );
}