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
    'Abeekey is a Nigerian technology company providing custom software development, websites, mobile apps, cloud and API solutions, fintech systems, IT consulting, cybersecurity, domain registration, shared hosting, and digital training.',

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
    'domain registration Nigeria',
    'domain name registration Nigeria',
    'shared hosting Nigeria',
    'web hosting Nigeria',
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
      'Custom software, websites, mobile applications, cloud solutions, fintech systems, IT consulting, domain registration, shared hosting, and digital services for businesses and organizations.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Abeekey — Software Development & Digital Solutions',
      },
    ],
  },

  twitter: {
    card: 'summary_large_image',
    title: 'Abeekey | Software Development & Digital Solutions in Nigeria',
    description:
      'Custom software, websites, mobile applications, cloud solutions, fintech systems, domain registration, shared hosting, and IT services.',
    images: ['/og-image.png'],
  },

  icons: {
    icon: '/logo.png',
    shortcut: '/logo.png',
    apple: '/logo.png',
  },

  category: 'technology',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-NG">
      <body>
        <AuthProvider>
          <MetaPixel />
          {children}
        </AuthProvider>

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@graph': [
                {
                  '@type': 'Organization',
                  '@id': `${siteUrl}/#organization`,
                  name: 'Abeekey',
                  url: siteUrl,
                  logo: `${siteUrl}/logo.png`,
                  description:
                    'Nigerian technology company providing software development, digital solutions, domain registration, and shared hosting.',
                  sameAs: [],
                },
                {
                  '@type': 'WebSite',
                  '@id': `${siteUrl}/#website`,
                  url: siteUrl,
                  name: 'Abeekey',
                  publisher: {
                    '@id': `${siteUrl}/#organization`,
                  },
                  inLanguage: 'en-NG',
                },
              ],
            }),
          }}
        />
      </body>
    </html>
  );
}
