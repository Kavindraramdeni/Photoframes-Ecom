import type { Metadata } from "next";
import { Fraunces, Inter, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { CartProvider } from "@/components/cart/cart-provider";
import { SiteHeader } from "@/components/storefront/site-header";
import { SiteFooter } from "@/components/storefront/site-footer";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-plex-mono",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://ferro.store";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Ferro — Magnetic Photo Frames That Hold On Their Own",
    template: "%s | Ferro",
  },
  description:
    "Premium magnetic photo frames, custom-made from your photos. No nails, no glue — just a frame that holds itself to any metal surface. Free shipping across India.",
  keywords: [
    "magnetic photo frame",
    "custom photo frame",
    "personalized frame India",
    "photo gift",
  ],
  openGraph: {
    title: "Ferro — Magnetic Photo Frames That Hold On Their Own",
    description:
      "Custom magnetic photo frames made from your favourite photos. Designed in India.",
    url: siteUrl,
    siteName: "Ferro",
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Ferro — Magnetic Photo Frames",
    description: "Custom magnetic photo frames made from your favourite photos.",
  },
  robots: { index: true, follow: true },
  alternates: { canonical: siteUrl },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body
        className={`${fraunces.variable} ${inter.variable} ${plexMono.variable} antialiased`}
      >
        <CartProvider>
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:bg-ink focus:text-paper focus:px-4 focus:py-2 focus:rounded-full"
          >
            Skip to content
          </a>
          <SiteHeader />
          <main id="main-content">{children}</main>
          <SiteFooter />
          <Toaster position="top-center" richColors />
        </CartProvider>
      </body>
    </html>
  );
}
