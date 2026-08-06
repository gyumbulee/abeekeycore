'use client';

import { useState } from 'react';
import Link from 'next/link';

const links = [
  { href: '/services', label: 'Services' },
  { href: '/training', label: 'Training' },
  { href: '/about', label: 'About' },
  { href: '/industries', label: 'Industries' },
  { href: '/contact', label: 'Contact' },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-navy-primary/70 backdrop-blur-lg border-b border-white/10">
      <div className="max-w-6xl mx-auto px-6 sm:px-8 py-4 flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-2.5 font-heading font-bold text-xl text-white"
          onClick={() => setOpen(false)}
        >
          <span className="w-8 h-8 rounded-[9px] bg-gradient-to-br from-blue-accent to-navy-secondary flex items-center justify-center text-sm shadow-inner">
            🔷
          </span>
          Abeekey
        </Link>

        <div className="hidden md:flex gap-9 text-sm font-medium text-white/75">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="hover:text-white transition-colors">
              {link.label}
            </Link>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-4">
          <Link
            href="/login"
            className="text-sm font-medium text-white/75 hover:text-white transition-colors"
          >
            Login
          </Link>
          <Link
            href="/contact"
            className="inline-flex px-5 py-2.5 rounded-sm text-sm font-semibold text-white bg-gradient-to-br from-blue-primary to-blue-accent shadow-[0_4px_18px_rgba(37,99,235,0.35)] hover:-translate-y-px transition-transform"
          >
            Get a Quote
          </Link>
        </div>

        {/* Mobile hamburger toggle */}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          className="md:hidden inline-flex flex-col justify-center items-center gap-1.5 w-10 h-10 -mr-2"
        >
          <span
            className={`block h-0.5 w-6 bg-white transition-transform duration-200 ${open ? 'translate-y-2 rotate-45' : ''}`}
          />
          <span
            className={`block h-0.5 w-6 bg-white transition-opacity duration-200 ${open ? 'opacity-0' : 'opacity-100'}`}
          />
          <span
            className={`block h-0.5 w-6 bg-white transition-transform duration-200 ${open ? '-translate-y-2 -rotate-45' : ''}`}
          />
        </button>
      </div>

      {/* Mobile menu panel */}
      <div
        className={`md:hidden overflow-hidden transition-[max-height] duration-300 ease-in-out border-t border-white/10 ${
          open ? 'max-h-96' : 'max-h-0 border-t-0'
        }`}
      >
        <div className="px-6 py-5 flex flex-col gap-1 bg-navy-primary/95">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="py-3 text-[15px] font-medium text-white/80 hover:text-white border-b border-white/5"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/login"
            onClick={() => setOpen(false)}
            className="py-3 text-[15px] font-medium text-white/80 hover:text-white border-b border-white/5"
          >
            Login
          </Link>
          <Link
            href="/contact"
            onClick={() => setOpen(false)}
            className="mt-4 inline-flex justify-center px-5 py-3 rounded-sm text-sm font-semibold text-white bg-gradient-to-br from-blue-primary to-blue-accent"
          >
            Get a Quote
          </Link>
        </div>
      </div>
    </nav>
  );
}