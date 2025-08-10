// app/layout.tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ClientBody from "./ClientBody";
import Script from "next/script";
import { CookieConsent } from "../components/ui/cookie-consent";
import { Footer } from "../components/ui/footer";

// --- ADD THIS IMPORT ---
import { AuthProvider } from './context/AuthContext';
import { Toaster } from '@/components/ui/toaster'; // <--- ADD THIS IMPORT
// --- END ADDITION ---

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
    <html 
      lang="en" 
      className={`dark ${geistSans.variable} ${geistMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/* Theme initialization script - runs before page renders */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('theme');
                  if (theme === 'light') {
                    document.documentElement.classList.remove('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
        {/* Keep your existing head content, including any Script components */}
        {/* <Script
          crossOrigin="anonymous"
          src="//unpkg.com/same-runtime/dist/index.global.js"
        /> */}
      </head>
      <body suppressHydrationWarning className="antialiased bg-background text-foreground">

        {/* --- WRAP YOUR CLIENTBODY WITH AUTHPROVIDER --- */}
        <AuthProvider>
          <ClientBody>
            {children}
            <Footer />
          </ClientBody>
        </AuthProvider>
        {/* --- END WRAP --- */}

        <CookieConsent />
        <Toaster /> {/* <--- ADD THIS LINE */}
      </body>
    </html>
  );
}