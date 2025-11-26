import type React from "react";
import { Geist, Geist_Mono } from "next/font/google";
import "../styles/globals.css";
import duck from "../assets/duck.png";
import type { Metadata } from "next";

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Pralinvaderz",
  description: "...",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <head>
        <link rel="icon" href={duck.src} sizes="any" />
      </head>
      <body className={`font-sans antialiased`}>{children}</body>
    </html>
  );
}
