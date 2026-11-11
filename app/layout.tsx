import type { Metadata, Viewport } from "next";
import { Fraunces, Archivo, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import "./account.css";
import "./upgrade.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ScrollProgress from "@/components/ScrollProgress";
import { site } from "@/lib/site";

const display = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  axes: ["SOFT", "WONK", "opsz"],
});

const sans = Archivo({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: "Wrightyard — Software, built here. Kept running.",
    template: "%s — Wrightyard",
  },
  description: site.description,
  applicationName: "Wrightyard",
  manifest: "/manifest.webmanifest",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: "/",
    siteName: "Wrightyard",
    title: "Wrightyard — Software, built here. Kept running.",
    description: site.description,
    images: [
      {
        url: "/wrightyard-og.png",
        width: 1200,
        height: 630,
        alt: "Wrightyard, a software studio and an after-hours crew.",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Wrightyard — Software, built here. Kept running.",
    description: site.description,
    images: ["/wrightyard-og.png"],
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#f0e7d3",
  colorScheme: "light",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable} ${mono.variable}`}>
      <body>
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        <ScrollProgress />
        <Header />
        <main id="main">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
