'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import Footer from '@/components/Footer';
import WhatsAppButton from '@/components/WhatsAppButton';

const PORTAL_NAV = [
  { href: '/portal', label: 'Dashboard' },
  { href: '/portal/invoices', label: 'Invoices' },
  { href: '/portal/quotations', label: 'Quotations' },
  { href: '/portal/contracts', label: 'Contracts' },
  { href: '/portal/domains', label: 'Domains' },
  { href: '/portal/transactions', label: 'Transactions' },
  { href: '/portal/support', label: 'Support' },
  { href: '/portal/security', label: 'Security' },
  { href: '/portal/profile', label: 'Profile' },
];

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace('/login');
    } else if (user.role === 'admin') {
      router.replace('/admin');
    }
  }, [loading, user, router]);

  if (loading || (user && user.role === 'admin')) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg text-text-soft text-sm">
        {loading ? 'Loading your portal...' : 'Redirecting...'}
      </div>
    );
  }

  if (!user) {
    // Brief flash before the redirect above kicks in
    return null;
  }

  return (
    <div className="min-h-screen bg-bg">
      <header className="bg-navy-primary print:hidden">
        <div className="max-w-6xl mx-auto px-6 sm:px-8 py-4 flex items-center justify-between">
          <div className="font-heading font-bold text-white text-lg">Abeekey Portal</div>
          <div className="flex items-center gap-5">
            <WhatsAppButton variant="dark" />
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
          {PORTAL_NAV.map((item) => (
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

      <div className="print:hidden">
        <Footer />
      </div>
    </div>
  );
}