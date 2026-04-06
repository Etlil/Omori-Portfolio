import type { Metadata } from "next";
import localFont from "next/font/local"; // 1. Import the local font utility
import "./globals.css";

// 2. Define your custom font
const omoriFont = localFont({
  src: "../public/font/omori_font.ttf", 
  variable: "--font-omori",
});

export const metadata: Metadata = {
  title: "My Portfolio",
  description: "Omori styled Portfolio.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      {/* 3. Apply the font variable to the body */}
      <body className={`${omoriFont.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}