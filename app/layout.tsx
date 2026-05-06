

import type { Metadata } from "next";

import PreloadWrapper from './components/PreloadWrapper';




import localFont from "next/font/local";
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
        <PreloadWrapper>{children}</PreloadWrapper>
      </body>
    </html>
  );
}