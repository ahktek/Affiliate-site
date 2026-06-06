import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { AuthProvider } from "@/lib/context/AuthContext";
import Chatbot from "@/components/Chatbot";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
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
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="font-sans antialiased">
        <AuthProvider>
          <div className="chassis-bg min-h-screen relative">
            <div className="relative z-10">
              {children}
            </div>
          </div>
          <Chatbot />
        </AuthProvider>
      </body>
    </html>
  );
}

