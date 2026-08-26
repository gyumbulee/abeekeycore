'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import Footer from '@/components/Footer';
import WhatsAppButton from '@/components/WhatsAppButton';
import DashboardSidebar, { SidebarNavGroup } from '@/components/DashboardSidebar';
import {
  LayoutDashboard,
  Receipt,
  FileText,
  ArrowLeftRight,
  FileSignature,
  Globe,
  Server,
  LifeBuoy,
  Lock,
  User,
} from 'lucide-react';

const PORTAL_NAV: SidebarNavGroup[] = [
  { items: [{ href: '/portal', label: 'Dashboard', icon: LayoutDashboard }] },
  {
    label: 'Billing',
    items: [
      { href: '/portal/invoices', label: 'Invoices', icon: Receipt },
      { href: '/portal/quotations', label: 'Quotations', icon: FileText },
      { href: '/portal/transactions', label: 'Transactions', icon: ArrowLeftRight },
    ],
  },
  {
    label: 'Services',
    items: [
      { href: '/portal/contracts', label: 'Contracts', icon: FileSignature },
      { href: '/portal/domains', label: 'Domains', icon: Globe },
      { href: '/portal/hosting', label: 'Hosting', icon: Server },
    ],
  },
  {
    label: 'Account',
    items: [
      { href: '/portal/support', label: 'Support', icon: LifeBuoy },
      { href: '/portal/security', label: 'Security', icon: Lock },
      { href: '/portal/profile', label: 'Profile', icon: User },
    ],
  },
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
    <DashboardSidebar
      brand="Abeekey Portal"
      rootHref="/portal"
      groups={PORTAL_NAV}
      userName={user.name}
      onLogout={() => logout().then(() => router.push('/'))}
      headerExtra={<WhatsAppButton variant="dark" />}
      footer={<Footer />}
    >
      {children}
    </DashboardSidebar>
  );
}
