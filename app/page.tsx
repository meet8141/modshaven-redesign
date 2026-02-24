"use client";


import Image from "next/image";
import SplitText from "./components/SplitText";
import DecryptedText from './components/DecryptedText';
import Grainient from './components/Grainient';
import { FolderSearch, Download, Gamepad } from 'lucide-react';
import { useRouter } from 'next/navigation';




export default function Home() {
  const router = useRouter();
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
      <div className="relative  flex flex-col  mt-[11rem] justify-center">
        <SplitText
          text="ModsHaven"
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
            speed={20}
            sequential
            useOriginalCharsOnly={false}
            className="text-center text-[#fff] font-[900]"

          />

        </div>

        <div className="flex justify-center gap-6  align-center">
          <button
            className="mt-10 px-6 py-3 bg-gradient-to-r from-[#ff743d] via-[#ff6600] to-[#ff5500] text-white font-bold rounded-[0.75rem] shadow-lg hover:scale-110 hover:shadow-2xl hover:bg-gradient-to-br transition-all duration-300 relative overflow-hidden focus:outline-none focus:ring-4 focus:ring-[#ff743d]/50"
            style={{ position: 'relative', zIndex: 1 }}
            onClick={() => router.push('/mods')}
          >
            <span className="relative z-10">Explore Mods</span>
            <span className="absolute left-[-40%] top-0 w-[140%] h-full bg-gradient-to-r from-white via-transparent to-transparent opacity-20 blur-lg pointer-events-none animate-shine"></span>
            <style>{`
        @keyframes shine {
          0% { left: -40%; }
          100% { left: 100%; }
        }
        .animate-shine {
          animation: shine 1s linear infinite;
        }
      `}</style>
          </button>
          <button
            className="mt-10 px-4 py-2 bg-transparent border-2 border-[#ff6600] text-[#fff] font-bold rounded-[0.75rem] hover:bg-[#ff660010] hover:text-[#ff6600] transition-colors duration-300"
            onClick={() => router.push('/resources/about')}
          >
            About
          </button>
        </div>

        {/* How It Works section */}
        <div className="mt-16 w-[98%] max-w-6xl mx-auto flex flex-col items-center mx-auto justify-center p-8  gap-12">
          <h2 className="text-4xl font-bold text-white mb-10 text-center">How It Works</h2>
          <div className="flex flex-col md:flex-row gap-8 w-full justify-center">
            {/* Step 1 */}
            <div className="bg-black/30 backdrop-blur-lg rounded-[1rem]   hover:border-[#ff6600]  border-transparent  border-2   hover:scale-101 transition-all duration-300  flex-1 flex flex-col items-center p-8 min-w-[260px] max-w-[350px]">
              <span className="mb-4 text-4xl">
                <FolderSearch className="w-10 h-10 text-white" />
              </span>
              <h3 className="text-2xl font-bold mb-2 text-white">1. Find</h3>
              <p className="text-gray-300 font-semibold text-center">Browse our extensive collection of game modifications.</p>
            </div>
            {/* Step 2 */}
            <div className="bg-black/30 backdrop-blur-lg rounded-[1rem]    hover:border-[#ff6600]  border-transparent  border-2   hover:scale-101 transition-all duration-300  flex-1 flex flex-col items-center p-8 min-w-[260px] max-w-[350px]">
              <span className="mb-4 text-4xl">
                <Download className="w-10 h-10 text-white" />
              </span>
              <h3 className="text-2xl font-bold mb-2 text-white">2. Download</h3>
              <p className="text-gray-300 font-semibold text-center">Download mods with just a single click.</p>
            </div>
            {/* Step 3 */}
            <div className="bg-black/30 backdrop-blur-lg rounded-[1rem]   hover:border-[#ff6600]  border-transparent  border-2   hover:scale-101 transition-all duration-300 flex-1 flex flex-col items-center p-8 min-w-[260px] max-w-[350px]">
              <span className="mb-4 text-4xl">
                <Gamepad className="w-10 h-10 text-white" />
              </span>
              <h3 className="text-2xl font-bold mb-2 text-white">3. Play</h3>
              <p className="text-gray-300 font-semibold text-center">Install and enjoy your enhanced gaming experience.</p>
            </div>
          </div>
        </div>
        {/* community card section */}
        <div className="mt-16 w-[98%] gap-8 max-w-6xl p-8 bg-black/30 backdrop-blur-lg rounded-[1rem]   hover:border-[#ff6600]  border-transparent  border-2   transition-all duration-300  text-white flex flex-col-reverse md:flex-row sm:flex-col-reverse items-center  justify-between   mx-auto ">
          <div className="max-w-xl">
            <h2 className="text-3xl font-bold">Join Our Community</h2>
            <p className="mt-4 font-[800]">
              Connect with other gamers, share your mods, and get help with
              installations. Our community is active and always welcoming new
              members.
            </p>
            <div className="mt-4 font-[700]  flex items-center space-x-2">
              <span className="flex gap-4"><span className="flex"><span className=" fixed text-green-400 animate-ping scale-125">● </span><span className=" fixed text-green-400 scale-125">● </span></span> 2,460 online</span>
              <span> ● 22,156 members</span>
            </div>
            <button className="mt-6 px-6 py-3 bg-blue-600 rounded-[0.75rem] font-semibold hover:bg-[#5865f2] transition">
              JOIN DISCORD
            </button>
          </div>
          <div className="mt-8 md:mt-0">
            <img
              src="https://image.modshaven.com/mods/Join%20Now%20To%20Access%20High%20Quality%20Mods!.webp"
              alt="Community cars"
              className="rounded-lg shadow-lg w-full max-w-sm"
            />
          </div>
        </div>
      </div>
    </>

  );
}
