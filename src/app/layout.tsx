import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import localFont from 'next/font/local';
import { Inter } from 'next/font/google';
import { Space_Grotesk } from 'next/font/google';
import "./globals.css";
import { AuthProvider } from '@/context/AuthContext';
import PageTransitionWrapper from '@/components/layout/PageTransitionWrapper';

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

// Using JetBrains Mono instead of JetBrains Sans since it's more commonly available
import '@fontsource/jetbrains-mono';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Vibe School",
  description: "Vibe Coding School is a modern learning platform where you master prompt engineering and AI-powered coding through real projects, guided lessons, and an active builder community.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${inter.variable} ${spaceGrotesk.variable} antialiased`}
        style={{ fontFamily: 'var(--font-inter)' }}
      >
        <div className="cyber-grid"></div>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
