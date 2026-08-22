'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';

const ADMIN_NAV: { href: string; label: string; permission?: string }[] = [
  { href: '/admin', label: 'Dashboard' },
  { href: '/admin/leads', label: 'Leads (CRM)', permission: 'leads' },
  { href: '/admin/clients', label: 'Clients', permission: 'clients' },
  { href: '/admin/quotations', label: 'Quotations', permission: 'quotations' },
  { href: '/admin/invoices', label: 'Invoices', permission: 'invoices' },
  { href: '/admin/contracts', label: 'Contracts', permission: 'contracts' },
  { href: '/admin/domains', label: 'Domains', permission: 'domains' },
  { href: '/admin/transactions', label: 'Transactions', permission: 'transactions' },
  { href: '/admin/contacts', label: 'Contact Messages', permission: 'contacts' },
  { href: '/admin/support', label: 'Support Tickets', permission: 'support-tickets' },
  { href: '/admin/blog', label: 'Blog', permission: 'blog' },
  { href: '/admin/users', label: 'Users & Roles' }, // admin-only, filtered below
  { href: '/admin/settings', label: 'Settings' }, // admin-only, filtered below
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace('/login');
    } else if (user.role !== 'admin' && user.role !== 'staff') {
      router.replace('/portal');
    }
  }, [loading, user, router]);

  if (loading || !user || (user.role !== 'admin' && user.role !== 'staff')) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg text-text-soft text-sm">
        {loading ? 'Loading...' : 'Redirecting...'}
      </div>
    );
  }

  const visibleNav = ADMIN_NAV.filter((item) => {
    if (user.role === 'admin') return true; // admins see and can access everything
    if (item.href === '/admin/users') return false; // staff management is admin-only
    if (item.href === '/admin/settings') return false; // pricing settings are admin-only
    if (!item.permission) return true; // Dashboard has no permission gate
    return user.permissions?.includes(item.permission);
  });

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
          {visibleNav.map((item) => (
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