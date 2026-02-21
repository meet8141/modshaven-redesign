import Image from "next/image";
import SplitText from "../components/SplitText";
import DecryptedText from '../components/DecryptedText';
import Grainient from '../components/Grainient';






export default function Home() {
  return (
    <>
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, width: '100%', height: '100%' }}>
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
   
    
 

    </>

  );
}
