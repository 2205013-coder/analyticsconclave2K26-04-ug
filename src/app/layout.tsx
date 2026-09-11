import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import LogoHeader from '@/components/shared/LogoHeader';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
  title: 'Beyond The Stage — Live Entertainment Forecasting Challenge',
  description: 'A live-entertainment forecasting challenge by Optix Analytics Club, KIIT School of Management. Predict attendance across 6 competitive rounds using 60 historical events.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <LogoHeader />
        {children}
      </body>
    </html>
  );
}
