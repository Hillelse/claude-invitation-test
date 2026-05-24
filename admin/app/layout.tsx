import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './providers';

export const metadata: Metadata = {
  title: 'שיראל & הלל · RSVP Admin',
  description: 'Wedding RSVP CRM Dashboard',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased min-h-screen" style={{ backgroundColor: 'var(--cream)', color: 'var(--ink)' }}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
