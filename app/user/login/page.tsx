// /user/login page (GET)
import React from 'react';
import Grainient from '@/app/components/Grainient';
import { MoveRight } from 'lucide-react';
export default function LoginPage() {
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
      <div style={{ maxWidth: 800, margin: '100px auto', padding: 24, position: 'relative', zIndex: 1}} className='flex flex-col justify-center items-center gap-4' >
      <h2 className='font-[800] text-[2rem]' >Login</h2>
      <form method="POST" action="/user/login"  className= ' max-w-8xl flex gap-4 flex-col items-center justify-center p-8 rounded-[1rem] bg-black/30 backdrop-blur-lg border-2 border-[#ff6600]'>
        <div style={{ marginBottom: 16 }} className='flex flex-col justify-center items-center'>
          <label htmlFor="fullName">Username</label>
          <input type="text" id="fullName" name="fullName" required style={{ width: '100%', padding: 8, marginTop: 4 }} className='bg-[#282934] rounded-[0.5rem] focus:outline-none focus:ring-2 focus:ring-[#ff6600]'/>
        </div>
        <div style={{ marginBottom: 16 }} className='flex flex-col justify-center items-center '>
          <label htmlFor="password">Password</label>
          <input type="password" id="password" name="password" required style={{ width: '100%', padding: 8, marginTop: 4 }} className='bg-[#282934] rounded-[0.5rem] focus:outline-none focus:ring-2 focus:ring-[#ff6600]' />
        </div>
        <button type="submit" style={{ width: '50%', padding: 10, background: '#ff6600', color: '#fff', border: 'none'  }} className='rounded-[1rem] flex items-center justify-center gap-2'>Login <MoveRight size={16} /></button>
      </form>
    </div>
     
    </>
  );
}
