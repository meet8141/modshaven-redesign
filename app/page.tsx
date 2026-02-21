import Image from "next/image";
import SplitText from "./components/SplitText";
import DecryptedText from './components/DecryptedText';
import Grainient from './components/Grainient';





export default function Home() {
  return (
    <>
                 <div style={{ width: '100%', height: '100%', position: 'fixed', top: 0, left: 0 }}>
  <Grainient
    color1="#ff743d"
    color2="#000000"
    color3="#4e4d4d"
    timeSpeed={0.4}
    colorBalance={0}
    warpStrength={0.3}
    warpFrequency={5}
    warpSpeed={2}
    warpAmplitude={50}
    blendAngle={0}
    blendSoftness={0.05}
    rotationAmount={500}
    noiseScale={2}
    grainAmount={0.1}
    grainScale={2}
    grainAnimated={false}
    contrast={1.5}
    gamma={1}
    saturation={1}
    centerX={0}
    centerY={0}
    zoom={1.5}
  />
</div>
      <div className="relative  flex flex-col  mt-[12rem] justify-center">
        <SplitText
          text="Mods Haven"
          className="text-7xl font-[800] font-[family:inter] text-center "
          delay={70}
          duration={1.25}
          ease="elastic.out(1, 0.3)"
          splitType="chars"
          from={{ opacity: 0, y: 40 }}
          to={{ opacity: 1, y: 0 }}
          threshold={0.1}
          rootMargin="-50px"
          textAlign="center"

        />
        <div style={{ marginTop: '1rem', textAlign: 'center' }}>
          <DecryptedText
            text="Your ultimate destination for game modifications, tools, and resources."
            animateOn="view"
            revealDirection="start"
            sequential
            useOriginalCharsOnly={false}
            className="text-center text-[#fff] font-[900]"

          />
         
        </div>
      </div>
    </>

  );
}
