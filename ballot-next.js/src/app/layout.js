import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { ClientProvider } from '@/components/layout/ClientProvider';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata = {
  title: 'BallotDApp - Decentralized Voting System',
  description: 'A decentralized voting application built on Ethereum',
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-gray-50">
        <ClientProvider>
          {children}
        </ClientProvider>
      </body>
    </html>
  );
}