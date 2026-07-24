import React from 'react';
import './globals.css';

export const metadata = {
  title: 'Ralion Platform — Ras Ali Labs',
  description: 'AI-Powered Business Operating System by Ras Ali Labs',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-zinc-950 text-zinc-100 font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
