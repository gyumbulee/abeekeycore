import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/lib/auth-context';

export const metadata: Metadata = {
  title: 'Abeekey — Technology That Moves Business Forward',
  description:
    'Abeekey designs, builds, and maintains secure, scalable digital solutions for businesses, governments, and institutions across Nigeria and Africa.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="font-body">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}