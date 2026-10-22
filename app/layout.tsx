import type { Metadata } from "next";
import "./globals.css";
import { LangToggle } from "@/lib/i18n";
import { ToastHost } from "@/lib/notify";

export const metadata: Metadata = { title: "Study Planner" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="sp-body">
        <LangToggle />
        {children}
        <ToastHost />
      </body>
    </html>
  );
}
