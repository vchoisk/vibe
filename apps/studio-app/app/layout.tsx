import type { Metadata } from "next";
import { SessionProvider } from "@/contexts/SessionContext";
import { ShootProvider } from "@/contexts/ShootContext";
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
        <ShootProvider>
          <SessionProvider>
            {children}
          </SessionProvider>
        </ShootProvider>
      </body>
    </html>
  );
}