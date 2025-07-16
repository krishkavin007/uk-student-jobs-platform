import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css"; // This import is correct
import ClientBody from "./ClientBody";
import Script from "next/script";
import { CookieConsent } from "../components/ui/cookie-consent";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "StudentJobs UK - Connect Students with Part-Time Jobs",
  description: "The UK's premier platform connecting local businesses with talented students seeking flexible part-time work. Start at just £1 per job post.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <head>
        {/* <Script
          crossOrigin="anonymous"
          src="//unpkg.com/same-runtime/dist/index.global.js"
        /> */}
      </head>
      {/* CORRECTED LINE BELOW: Added bg-background and text-foreground classes */}
      <body suppressHydrationWarning className="antialiased bg-background text-foreground">
        <ClientBody>{children}</ClientBody>
        <CookieConsent />
      </body>
    </html>
  );
}