import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Contract to Core | AI BA Onboarding Simulation",
  description:
    "Practice 18 first-year workplace decisions as a junior AI Business Analyst in an insurance automation team.",
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
