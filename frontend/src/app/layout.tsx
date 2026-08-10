import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/lib/auth-context';
import MetaPixel from '@/components/MetaPixel';

const siteUrl = 'https://abeekey.com';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),

  title: {
    default: 'Abeekey | Software Development & Digital Solutions in Nigeria',
    template: '%s | Abeekey',
  },

  description:
    'Abeekey is a Nigerian technology company providing custom software development, website and mobile app development, cloud and API solutions, fintech systems, IT consulting, cybersecurity, and digital training.',

  keywords: [
    'software development Nigeria',
    'web development Nigeria',
    'mobile app development Nigeria',
    'custom software development',
    'IT company Nigeria',
    'technology company Nigeria',
    'website development Nigeria',
    'fintech development Nigeria',
    'IT consulting Nigeria',
    'digital solutions Nigeria',
    'Abeekey',
  ],

  authors: [{ name: 'Abeekey' }],
  creator: 'Abeekey',
  publisher: 'Abeekey',

  alternates: {
    canonical: '/',
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },

  openGraph: {
    type: 'website',
    locale: 'en_NG',
    url: siteUrl,
    siteName: 'Abeekey',
    title: 'Abeekey | Software Development & Digital Solutions in Nigeria',
    description:
      'Custom software, websites, mobile applications, cloud solutions, fintech systems, IT consulting, and digital services for businesses and organizations.',
  },

  twitter: {
    card: 'summary_large_image',
    title: 'Abeekey | Software Development & Digital Solutions in Nigeria',
    description:
      'Custom software, websites, mobile applications, cloud solutions, fintech systems, and IT services.',
  },

  category: 'technology',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en-NG">
      <body className="font-body">
        <AuthProvider>{children}</AuthProvider>
        <MetaPixel />
      </body>
    </html>
  );
}