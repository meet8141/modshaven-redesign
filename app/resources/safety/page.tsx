import Image from "next/image";
import SplitText from "@/app/components/SplitText";
import DecryptedText from '@/app/components/DecryptedText';
import Grainient from '@/app/components/Grainient';





export default function Home() {
  return (
    <>
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, width: '100%', height: '100%' }}>
        <Grainient
          color1="#202020"
          color2="#717171"
          color3="#202020"
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
   
    
 

    </>

  );
}
