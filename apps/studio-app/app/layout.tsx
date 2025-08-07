import type { Metadata } from "next";
import { SessionProvider } from "@/contexts/SessionContext";
import { EventProvider } from "@/contexts/EventContext";
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
        <EventProvider>
          <SessionProvider>
            {children}
          </SessionProvider>
        </EventProvider>
      </body>
    </html>
  );
}