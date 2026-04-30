import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FractPath — Debt-Free Equity Access",
  description:
    "Model your path to homeownership or unlock your home equity without debt. Scenario modeling for homeowners, buyers, and realtors.",
  icons: {
    icon: "/brand/FractPath_Icon_Black.svg",
    apple: "/brand/FractPath_Icon_Black.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <Toaster />

        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-QXZ6MG89LD"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-QXZ6MG89LD');
          `}
        </Script>
      </body>
    </html>
  );
}
