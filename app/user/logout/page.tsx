// /user/logout page (GET)
import React from 'react';
import Grainient from '@/app/components/Grainient';

export default function LogoutPage() {
  return (
    <>
      <div style={{ width: '100%', height: '100%', position: 'fixed', top: 0, left: 0 }}>
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
      <div style={{ maxWidth: 800, margin: '100px auto', padding: 24, position: 'relative', zIndex: 1, textAlign: 'center'}} className='flex flex-col justify-center items-center gap-4' >
        <h2 className='font-[800] text-[2rem]' >You have been logged out</h2>
        <a href="/user/login" style={{ color: '#ff6600', textDecoration: 'underline', fontWeight: 600 }}>Login again</a>
      </div>
    </>
  );
}
