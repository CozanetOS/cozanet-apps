import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Cozanet OS',
  description: 'Next-generation AI-native operating system',
  icons: { icon: '/favicon.ico' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="h-full">{children}</body>
    </html>
  );
}
