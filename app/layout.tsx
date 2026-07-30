import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Contract to Core | AI BA Onboarding Simulation",
  description:
    "Practice 18 workplace decisions and 18 artifact-judgment exercises as a junior AI Business Analyst in an insurance automation team.",
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
