import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = { title: "Study Planner" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="sp-body">{children}</body>
    </html>
  );
}
