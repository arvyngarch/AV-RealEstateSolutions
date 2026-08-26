import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'AV Real Estate Solutions',
  description: 'Direct residential real-estate transactions.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
