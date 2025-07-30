import type { Metadata } from "next";
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
      <body>{children}</body>
    </html>
  );
}