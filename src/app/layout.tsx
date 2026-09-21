import type { Metadata, Viewport } from "next";
import { Anton, Space_Grotesk } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const display = Anton({ weight: "400", variable: "--font-display", subsets: ["latin"] });
const body = Space_Grotesk({ weight: ["400", "500", "600", "700"], variable: "--font-body", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "FootyMadness — Read the game first",
  description: "Prototype: ref bias, tactical bounty, sentiment, style clash. Analytics-only.",
};

export const viewport: Viewport = {
  themeColor: "#0A120B",
  width: "device-width",
  initialScale: 1,
};

const links = [
  { href: "/match", label: "Match Centre" },
  { href: "/debates", label: "Fan Hall" },
  { href: "/creator", label: "Creator" },
  { href: "/games", label: "Games" },
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} h-full antialiased`}>
      <body className="flex min-h-screen flex-col bg-pitch text-chalk tabular-nums">
        <header className="sticky top-0 z-40 border-b border-edge bg-pitch/95 backdrop-blur">
          <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 sm:px-6">
            <Link href="/" className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold font-display text-xl text-black">
                FM
              </span>
              <span className="leading-tight">
                <span className="font-display block text-lg uppercase tracking-wide">
                  Footy<span className="text-gold">Madness</span>
                </span>
                <span className="block text-[10px] uppercase tracking-[0.2em] text-fog">
                  Dugout data · mock
                </span>
              </span>
            </Link>
            <nav className="ml-auto hidden md:flex items-center gap-2">
              {links.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="min-h-[44px] flex items-center rounded-full border border-edge px-4 py-2 text-sm font-semibold text-zinc-300 transition hover:border-gold hover:text-white active:scale-[0.98]"
                >
                  {l.label}
                </Link>
              ))}
              <span className="ml-1 rounded-full bg-gold px-4 py-2 text-sm font-bold text-black">Mock</span>
            </nav>
            <Link
              href="/breakdowns"
              className="ml-auto md:hidden min-h-[44px] flex items-center rounded-full bg-gold px-4 text-sm font-bold text-black"
            >
              Open
            </Link>
          </div>
          <div className="md:hidden border-t border-edge">
            <div className="no-scrollbar mx-auto flex max-w-7xl gap-2 overflow-x-auto px-4 py-2">
              <Link href="/" className="shrink-0 rounded-full border border-edge px-3 py-1.5 text-xs font-semibold text-zinc-300">Home</Link>
              {links.map((l) => (
                <Link key={l.href} href={l.href} className="shrink-0 rounded-full border border-edge px-3 py-1.5 text-xs font-semibold text-zinc-300">
                  {l.label}
                </Link>
              ))}
            </div>
          </div>
        </header>

        <div className="mx-auto w-full max-w-7xl flex-1 px-4 sm:px-6 pb-24 pt-4 lg:pt-6">
          {children}
          <footer className="mt-12 border-t border-edge pt-4 text-xs text-zinc-500">
            Analytics-only prototype. No betting, no escrow, no private scraping. Check local laws. 18+ only. Bet responsibly.
          </footer>
        </div>
      </body>
    </html>
  );
}
