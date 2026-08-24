'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronsLeft, ChevronsRight, LogOut, Menu, X, type LucideIcon } from 'lucide-react';

export interface SidebarNavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

export interface SidebarNavGroup {
  /** Omit for a top-level item with no section header (e.g. Dashboard). */
  label?: string;
  items: SidebarNavItem[];
}

interface DashboardSidebarProps {
  brand: string;
  rootHref: string;
  groups: SidebarNavGroup[];
  userName: string;
  onLogout: () => void;
  /** Rendered in the mobile header, next to the user's name (e.g. WhatsApp button). */
  headerExtra?: React.ReactNode;
  /**
   * Rendered at the bottom of the content column, below `children`.
   * Deliberately scoped to the content column (not spanning the full
   * viewport width as a page-level sibling) — otherwise the outer
   * `min-h-screen` row would stretch to match the sidebar's full height on
   * short pages, pushing this down behind an oversized sidebar block
   * instead of following the actual content it belongs to.
   */
  footer?: React.ReactNode;
  children: React.ReactNode;
}

const COLLAPSE_STORAGE_KEY = 'abeekey-sidebar-collapsed';

function isItemActive(pathname: string, href: string, rootHref: string): boolean {
  if (href === rootHref) return pathname === rootHref;
  return pathname === href || pathname.startsWith(`${href}/`);
}

/**
 * Shared grouped sidebar shell for /admin and /portal. Desktop: fixed
 * left column, collapsible to an icon-only rail (preference persisted in
 * localStorage — this is a real browser environment, not an in-chat
 * artifact preview, so localStorage is safe to use here). Mobile: an
 * off-canvas drawer triggered by a hamburger button in the top header,
 * since there's no room for a persistent sidebar at that width.
 */
export default function DashboardSidebar({
  brand,
  rootHref,
  groups,
  userName,
  onLogout,
  headerExtra,
  footer,
  children,
}: DashboardSidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem(COLLAPSE_STORAGE_KEY);
    if (stored === '1') setCollapsed(true);
  }, []);

  function toggleCollapsed() {
    setCollapsed((prev) => {
      const next = !prev;
      window.localStorage.setItem(COLLAPSE_STORAGE_KEY, next ? '1' : '0');
      return next;
    });
  }

  // Closing the drawer on navigation avoids it staying open (and covering
  // the newly-loaded page) after tapping a link on mobile.
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const navContent = (
    <nav className="flex-1 overflow-y-auto scrollbar-hide px-3 py-4 space-y-5">
      {groups.map((group, i) => (
        <div key={group.label ?? `group-${i}`}>
          {group.label && !collapsed && (
            <p className="px-3 mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-white/40">
              {group.label}
            </p>
          )}
          <div className="space-y-0.5">
            {group.items.map((item) => {
              const active = isItemActive(pathname, item.href, rootHref);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={collapsed ? item.label : undefined}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                    active
                      ? 'bg-white/10 text-white'
                      : 'text-white/65 hover:bg-white/5 hover:text-white'
                  } ${collapsed ? 'justify-center' : ''}`}
                >
                  <Icon size={18} className="shrink-0" />
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );

  return (
    <div className="min-h-screen flex bg-bg">
      {/* Desktop sidebar */}
      <aside
        className={`hidden md:flex flex-col bg-navy-primary shrink-0 sticky top-0 h-screen transition-[width] duration-200 print:hidden ${
          collapsed ? 'w-[76px]' : 'w-64'
        }`}
      >
        <div className="h-16 flex items-center px-4 border-b border-white/10">
          {!collapsed && <span className="font-heading font-bold text-white text-lg truncate">{brand}</span>}
          <button
            onClick={toggleCollapsed}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className={`text-white/60 hover:text-white transition-colors ${collapsed ? 'mx-auto' : 'ml-auto'}`}
          >
            {collapsed ? <ChevronsRight size={18} /> : <ChevronsLeft size={18} />}
          </button>
        </div>
        {navContent}
        <div className="border-t border-white/10 p-3">
          <button
            onClick={onLogout}
            title={collapsed ? 'Log out' : undefined}
            className={`flex items-center gap-3 w-full rounded-lg px-3 py-2.5 text-sm font-medium text-white/65 hover:bg-white/5 hover:text-white transition-colors ${
              collapsed ? 'justify-center' : ''
            }`}
          >
            <LogOut size={18} className="shrink-0" />
            {!collapsed && <span>Log out</span>}
          </button>
        </div>
      </aside>

      {/* Mobile off-canvas drawer */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div
            className="absolute inset-0 bg-navy-primary/60 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="relative w-72 max-w-[80vw] bg-navy-primary flex flex-col">
            <div className="h-16 flex items-center justify-between px-4 border-b border-white/10">
              <span className="font-heading font-bold text-white text-lg truncate">{brand}</span>
              <button
                onClick={() => setMobileOpen(false)}
                aria-label="Close menu"
                className="text-white/60 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            {navContent}
            <div className="border-t border-white/10 p-3">
              <button
                onClick={onLogout}
                className="flex items-center gap-3 w-full rounded-lg px-3 py-2.5 text-sm font-medium text-white/65 hover:bg-white/5 hover:text-white transition-colors"
              >
                <LogOut size={18} className="shrink-0" />
                <span>Log out</span>
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Main column */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 shrink-0 bg-navy-primary md:bg-transparent flex items-center gap-3 px-4 sm:px-6 md:px-8 border-b border-slate-200/70 md:border-slate-200 print:hidden">
          <button
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
            className="md:hidden text-white/80 hover:text-white transition-colors"
          >
            <Menu size={22} />
          </button>
          <span className="md:hidden font-heading font-bold text-white truncate">{brand}</span>
          <div className="ml-auto flex items-center gap-4">
            {headerExtra}
            <span className="text-sm text-white/70 md:text-text-soft hidden sm:inline">{userName}</span>
          </div>
        </header>

        <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 md:px-8 py-8">{children}</main>
        {footer && <div className="print:hidden">{footer}</div>}
      </div>
    </div>
  );
}
