import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Masters Pool 2026",
  description: "Run your Masters Golf Tournament pool — live leaderboard, tier-based picks, and pool standings.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50">
        {children}
      </body>
    </html>
  );
}
