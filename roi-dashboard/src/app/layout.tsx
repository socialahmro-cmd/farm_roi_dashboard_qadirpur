import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Script from "next/script";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ARB Farms - Agricultural ROI Dashboard | Qadirpur Rawan, Multan",
  description: "Interactive agricultural Return on Investment (ROI) dashboard for 1-acre farms in Qadirpur Rawan, Multan. Model yields and profits for Rice, Sesame, and Wheat.",
  keywords: "Agriculture, ROI Dashboard, Farm Investment, Multan, Qadirpur Rawan, Rice, Sesame, Wheat, ARB Farms",
  openGraph: {
    title: "ARB Farms ROI Dashboard",
    description: "Interactive agricultural ROI dashboard for farms in Qadirpur Rawan, Multan.",
    type: "website",
    url: "https://arbfarms.com",
    siteName: "ARB Farms",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "ARB Farms ROI Dashboard",
    "description": "Interactive agricultural ROI dashboard for farms in Qadirpur Rawan, Multan. Calculates projected returns for Rice, Sesame, and Wheat.",
    "publisher": {
      "@type": "Organization",
      "name": "ARB Farms",
      "logo": {
        "@type": "ImageObject",
        "url": "https://arbfarms.com/logo.png"
      }
    },
    "spatialCoverage": {
      "@type": "Place",
      "name": "Qadirpur Rawan, Multan, Pakistan"
    }
  };

  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
        <Script
          id="json-ld"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </body>
    </html>
  );
}
