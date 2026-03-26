"use client";

import dynamic from "next/dynamic";

const PixelBlast = dynamic(() => import("@/app/components/PixelBlast"), {
  ssr: false,
  loading: () => null,
});

export default function PixelBlastClient() {
  return <PixelBlast 
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
  />;
}
