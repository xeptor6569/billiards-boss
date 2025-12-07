import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ScoringInterfaceProviderWrapper from "@/components/ScoringInterfaceProviderWrapper";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Billiards Boss - Free Billiards Bowling Scoring",
  description: "Track your billiards bowling scores completely free. Real-time multiplayer, detailed statistics, and unlimited game saving.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ScoringInterfaceProviderWrapper>
          {children}
        </ScoringInterfaceProviderWrapper>
      </body>
    </html>
  );
}
