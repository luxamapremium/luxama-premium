import type { Metadata } from "next";
import { Outfit, Playfair_Display, Geist_Mono } from "next/font/google";
import "./globals.css";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const outfit = Outfit({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const playfair = Playfair_Display({
  variable: "--font-serif",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Luxama Premium Group",
  description: "Management and Scheduling Portal",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" dir="ltr">
      <body
        suppressHydrationWarning
        className={`${outfit.variable} ${playfair.variable} ${geistMono.variable} font-sans antialiased`}
      >
        {/* Toast Notifications */}
        <ToastContainer position="top-right" autoClose={3000} />

        <main>{children}</main>
      </body>
    </html>
  );
}
