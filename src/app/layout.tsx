import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Seat Cover Before/After Gallery",
  description: "Public before/after gallery for seat cover transformations with admin management.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-dvh bg-white text-neutral-900 antialiased">{children}</body>
    </html>
  );
}
