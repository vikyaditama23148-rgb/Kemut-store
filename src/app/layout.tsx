import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ScrollReveal from "@/components/ScrollReveal";

export const metadata: Metadata = {
  title: "KEMUT.STORE | Unspoken Luxury",
  description: "Curated premium marketplace — elevated minimalism, unspoken luxury.",
  keywords: "luxury fashion, premium marketplace, curated fashion, kemut store",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className="scroll-smooth">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-[#f8f6f3] antialiased">
        <Navbar />
        <main className="pt-[88px]">{children}</main>
        <Footer />
        <ScrollReveal />
      </body>
    </html>
  );
}