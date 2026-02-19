import type { Metadata } from "next";
import { Inter, Orbitron } from "next/font/google";
import "./globals.css";
import ContextProvider from "@/context"; // <--- Import the new provider
import { headers } from "next/headers"; // Required for cookie handling
import { SpeedInsights } from "@vercel/speed-insights/next";

const inter = Inter({ subsets: ["latin"] });
const orbitron = Orbitron({ subsets: ["latin"], variable: "--font-orbitron" });

export const metadata: Metadata = {
  title: "AHADI",
  description: "Trust Protocol",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Required for Reown/Wagmi to work with SSR
  const cookies = (await headers()).get("cookie");

  return (
    <html lang="en">
      <body
        className={`${inter.className} ${orbitron.variable}`}
        suppressHydrationWarning
      >
        <ContextProvider cookies={cookies}>{children}</ContextProvider>
        <SpeedInsights />
      </body>
    </html>
  );
}
