import type { Metadata } from "next";
import { SessionProvider } from "@/contexts/SessionContext";
import { ShootProvider } from "@/contexts/ShootContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import "./globals.css";

export const metadata: Metadata = {
  title: "SnapStudio - Self-Service Photo Studio",
  description: "Professional photo studio software for self-service photography",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <LanguageProvider>
          <ShootProvider>
            <SessionProvider>
              {children}
            </SessionProvider>
          </ShootProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}