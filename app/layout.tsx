import type React from "react";
import { Geist, Geist_Mono } from "next/font/google";
import "../styles/globals.css";

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <head>
        <link rel="icon" href="./assets/duck.png" sizes="any" />
      </head>
      <body className={`font-sans antialiased`}>{children}</body>
    </html>
  );
}
