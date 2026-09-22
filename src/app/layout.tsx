import type { Metadata } from "next";
import { Figtree, IBM_Plex_Mono, Instrument_Serif } from "next/font/google";
import { SiteHeader } from "@/components/SiteHeader";
import { StorageBanner } from "@/components/StorageBanner";
import "./globals.css";

const figtree = Figtree({
  variable: "--font-figtree",
  subsets: ["latin"],
});

const instrument = Instrument_Serif({
  variable: "--font-instrument",
  weight: "400",
  subsets: ["latin"],
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-ibm-plex-mono",
  weight: ["400", "500"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FrontVault — Frontend interview study",
  description:
    "Personal frontend interview vault: Quiz, DSA, System Design, Behaviour, Negotiation — beginner to principal.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body
        className={`${figtree.variable} ${instrument.variable} ${ibmPlexMono.variable} antialiased`}
      >
        <SiteHeader />
        <StorageBanner />
        <main>{children}</main>
      </body>
    </html>
  );
}
