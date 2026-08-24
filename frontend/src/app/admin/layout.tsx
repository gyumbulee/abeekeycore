'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import DashboardSidebar, { SidebarNavGroup } from '@/components/DashboardSidebar';
import {
  LayoutDashboard,
  Target,
  Users,
  FileText,
  Receipt,
  FileSignature,
  Globe,
  ArrowLeftRight,
  Mail,
  LifeBuoy,
  Newspaper,
  Briefcase,
  ShieldCheck,
  Settings,
} from 'lucide-react';

// Grouped so the nav scales as more modules land (HR, Finance, Marketing,
// etc. per the platform roadmap) without turning into an unscannable
// single row. Each item's optional `permission` gates it for staff
// accounts — admins always see everything (filtered below).
const ADMIN_NAV: SidebarNavGroup[] = [
  { items: [{ href: '/admin', label: 'Dashboard', icon: LayoutDashboard }] },
  {
    label: 'CRM',
    items: [
      { href: '/admin/leads', label: 'Leads', icon: Target },
      { href: '/admin/clients', label: 'Clients', icon: Users },
    ],
  },
  {
    label: 'Sales & Billing',
    items: [
      { href: '/admin/quotations', label: 'Quotations', icon: FileText },
      { href: '/admin/invoices', label: 'Invoices', icon: Receipt },
      { href: '/admin/contracts', label: 'Contracts', icon: FileSignature },
      { href: '/admin/domains', label: 'Domains', icon: Globe },
      { href: '/admin/transactions', label: 'Transactions', icon: ArrowLeftRight },
    ],
  },
  {
    label: 'Content',
    items: [
      { href: '/admin/blog', label: 'Blog', icon: Newspaper },
      { href: '/admin/portfolio', label: 'Portfolio', icon: Briefcase },
    ],
  },
  {
    label: 'Support',
    items: [
      { href: '/admin/contacts', label: 'Contact Messages', icon: Mail },
      { href: '/admin/support', label: 'Support Tickets', icon: LifeBuoy },
    ],
  },
  {
    label: 'Administration',
    items: [
      { href: '/admin/users', label: 'Users & Roles', icon: ShieldCheck },
      { href: '/admin/settings', label: 'Settings', icon: Settings },
    ],
  },
];

const PERMISSION_BY_HREF: Record<string, string> = {
  '/admin/leads': 'leads',
  '/admin/clients': 'clients',
  '/admin/quotations': 'quotations',
  '/admin/invoices': 'invoices',
  '/admin/contracts': 'contracts',
  '/admin/domains': 'domains',
  '/admin/transactions': 'transactions',
  '/admin/blog': 'blog',
  '/admin/portfolio': 'portfolio',
  '/admin/contacts': 'contacts',
  '/admin/support': 'support-tickets',
};
// '/admin/users' and '/admin/settings' are deliberately absent — staff
// management and pricing settings are admin-only regardless of the
// permissions array (see App\Support\Permissions on the backend).
const ADMIN_ONLY_HREFS = new Set(['/admin/users', '/admin/settings']);

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

  const visibleGroups: SidebarNavGroup[] = ADMIN_NAV.map((group) => ({
    ...group,
    items: group.items.filter((item) => {
      if (user.role === 'admin') return true; // admins see and can access everything
      if (ADMIN_ONLY_HREFS.has(item.href)) return false;
      const permission = PERMISSION_BY_HREF[item.href];
      if (!permission) return true; // Dashboard has no permission gate
      return user.permissions?.includes(permission);
    }),
  })).filter((group) => group.items.length > 0);

  return (
    <DashboardSidebar
      brand="Abeekey Admin"
      rootHref="/admin"
      groups={visibleGroups}
      userName={user.name}
      onLogout={() => logout().then(() => router.push('/'))}
    >
      {children}
    </DashboardSidebar>
  );
}
