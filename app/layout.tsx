import type { Metadata, Viewport } from "next";
import ThemeDecor from "@/components/ThemeDecor";
import "./globals.css";

export const metadata: Metadata = {
  title: "Kåres ønskeliste",
  robots: { index: false, follow: false },
};
export const viewport: Viewport = { width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="da">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,650&family=Inter:wght@400;500;600&display=swap"
        />
      </head>
      <body>
        <div className="wrap">
          <ThemeDecor />
          {children}
        </div>
      </body>
    </html>
  );
}
