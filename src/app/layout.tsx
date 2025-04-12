import type {Metadata} from 'next';
import {Nunito, Playfair_Display} from 'next/font/google';
import './globals.css';

const playfairDisplay = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair-display',
  weight: ['400', '600'],
  display: 'swap',
});

const nunito = Nunito({
  subsets: ['latin'],
  variable: '--font-nunito',
  weight: ['300', '400'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Rappel de MAMAN CELI 🥰',
  description: 'A Task Management App',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${playfairDisplay.variable} ${nunito.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
