'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';

const ADMIN_NAV = [
  { href: '/admin', label: 'Dashboard' },
  { href: '/admin/leads', label: 'Leads (CRM)' },
  { href: '/admin/invoices', label: 'Invoices' },
  { href: '/admin/contracts', label: 'Contracts' },
  { href: '/admin/domains', label: 'Domains' },
  { href: '/admin/transactions', label: 'Transactions' },
  { href: '/admin/contacts', label: 'Contact Messages' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace('/login');
    } else if (user.role !== 'admin') {
      router.replace('/portal');
    }
  }, [loading, user, router]);

  if (loading || !user || user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg text-text-soft text-sm">
        {loading ? 'Loading...' : 'Redirecting...'}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg">
      <header className="bg-navy-primary">
        <div className="max-w-6xl mx-auto px-6 sm:px-8 py-4 flex items-center justify-between">
          <div className="font-heading font-bold text-white text-lg">Abeekey Admin</div>
          <div className="flex items-center gap-5">
            <span className="text-sm text-white/70 hidden sm:inline">{user.name}</span>
            <button
              onClick={() => logout().then(() => router.push('/'))}
              className="text-sm font-medium text-white/75 hover:text-white transition-colors"
            >
              Log out
            </button>
          </div>
        </div>
        <nav className="max-w-6xl mx-auto px-6 sm:px-8 flex gap-6 overflow-x-auto border-t border-white/10">
          {ADMIN_NAV.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="py-3 text-sm font-medium text-white/70 hover:text-white whitespace-nowrap"
            >
              {item.label}
            </a>
          ))}
        </nav>
      </header>

      <main className="max-w-6xl mx-auto px-6 sm:px-8 py-10">{children}</main>
    </div>
  );
}