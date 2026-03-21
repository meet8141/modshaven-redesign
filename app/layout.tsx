import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import HoverFooter from "./components/footer_setup";
import { NavBar } from "./components/tubelight-navbar"
import PixelBlast from '@/app/components/PixelBlast';
import PageTransition from '@/app/components/PageTransition';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",

});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Mods Haven - Game Modification Platform",
  description: "Mods Haven - The ultimate destination for game modifications and enhancements.",
  icons: {
    icon: '/icon/logo_1.ico',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="dns-prefetch" href="https://image.modshaven.com" />
        <link rel="preconnect" href="https://image.modshaven.com" crossOrigin="anonymous" />
      </head>
      <body
        className={`${inter.variable} antialiased `}
      >
        <NavBar />
        <div style={{ width: '100%', height: '100%', position: 'fixed', top: 0, left: 0, zIndex: 0 }}>
          <PixelBlast
            variant="square"
            pixelSize={25}
            color="#d55500"
            patternScale={20}
            patternDensity={0.1}
            pixelSizeJitter={0}
            enableRipples={false}
            rippleSpeed={0.4}
            rippleThickness={0.12}
            rippleIntensityScale={1.5}
            liquid={false}
            liquidStrength={0.12}
            liquidRadius={1.2}
            liquidWobbleSpeed={5}
            speed={0.9}
            edgeFade={0.3}
          />
        </div>
        <div className="relative " style={{ zIndex: 1 }}>
          <PageTransition>{children}</PageTransition>
        </div>
        <HoverFooter />
      </body>
    </html>
  );
}
