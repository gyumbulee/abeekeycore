'use client';

import Link from 'next/link';
import Image from 'next/image';
import WhatsAppButton from './WhatsAppButton';

const links = [
  { href: '/services', label: 'Services' },
  { href: '/training', label: 'Training' },
  { href: '/about', label: 'About' },
  { href: '/industries', label: 'Industries' },
  { href: '/contact', label: 'Contact' },
];

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-navy-primary/90 backdrop-blur-lg border-b border-white/10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-[72px] flex items-center gap-4">
          
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2.5 shrink-0"
            aria-label="Abeekey home"
          >
            <Image
              src="/logo.png"
              alt="Abeekey"
              width={42}
              height={42}
              priority
              className="w-9 h-9 sm:w-10 sm:h-10 object-contain"
            />
            <span className="font-heading font-bold text-xl text-white hidden sm:block">
              Abeekey
            </span>
          </Link>

          {/* Main navigation — always visible */}
          <div className="flex-1 min-w-0 overflow-x-auto scrollbar-hide">
            <div className="flex items-center gap-5 sm:gap-7 whitespace-nowrap min-w-max px-1">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm font-medium text-white/75 hover:text-white transition-colors py-2"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Desktop actions */}
          <div className="hidden lg:flex items-center gap-4 shrink-0">
            <WhatsAppButton variant="dark" />

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

          {/* Mobile login */}
          <Link
            href="/login"
            className="lg:hidden shrink-0 text-sm font-medium text-white/80 hover:text-white transition-colors"
          >
            Login
          </Link>
        </div>
      </div>
    </nav>
  );
}
