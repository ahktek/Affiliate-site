import type { Metadata } from "next";
import { Lora, Source_Serif_4, Instrument_Sans, DM_Mono } from "next/font/google";
import { AuthProvider } from "@/lib/context/AuthContext";
import { ThemeProvider } from "@/components/ThemeProvider";
import Chatbot from "@/components/Chatbot";
import CompareTray from "@/components/CompareTray";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const lora = Lora({
  subsets: ["latin"],
  variable: "--font-lora",
  display: "swap",
});

const sourceSerif = Source_Serif_4({
  subsets: ["latin"],
  variable: "--font-source-serif",
  display: "swap",
});

const instrumentSans = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-instrument-sans",
  display: "swap",
});

const dmMono = DM_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-dm-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "AI Tools & SaaS Reviews | Your Ultimate Guide",
  description: "Find the best AI tools and SaaS products for your business. We provide in-depth reviews, comparisons, and recommendations.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${lora.variable} ${sourceSerif.variable} ${instrumentSans.variable} ${dmMono.variable} font-body bg-background text-foreground antialiased`}>
        <AuthProvider>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            {children}
            <Chatbot />
            <CompareTray />
            <Toaster />
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
