'use client';

import { useRef, useCallback, useState } from 'react';

import Link from 'next/link';
import { ChevronsLeft, ChevronsRight, Shuffle, ArrowUpRight, CarFront, Map, Truck } from 'lucide-react';
import ShinyText from '@/app/components/ShinyText';
import BrandIcon from '@/app/components/BrandIcon';

// Swiper
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Mousewheel, FreeMode } from 'swiper/modules';
import type { Swiper as SwiperType } from 'swiper';
import 'swiper/css';

type Mod = {
  _id: string;
  name: string;
  slug?: string;
  mod_image: string;
  game: string;
  mod_type?: string;
  brand?: string;
};

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const typeIcon = (mod_type?: string) => {
  if (mod_type === 'maps') return <Map className="w-3 h-3 sm:w-4 sm:h-4" />;
  if (mod_type === 'truck') return <Truck className="w-3 h-3 sm:w-4 sm:h-4" />;
  return <CarFront className="w-3 h-3 sm:w-4 sm:h-4" />;
};

export default function RecommendedSlider({ initialMods }: { initialMods: Mod[] }) {
  const [mods, setMods] = useState<Mod[]>(initialMods);
  const swiperRef = useRef<SwiperType | null>(null);

  const prev = () => swiperRef.current?.slidePrev();
  const next = () => swiperRef.current?.slideNext();

  const doShuffle = useCallback(() => {
    setMods((m) => shuffle(m));
    setTimeout(() => swiperRef.current?.slideTo(0), 0);
  }, []);

  return (
    <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-10 mt-10 sm:mt-1">
      {/* Heading */}
      <div className="flex flex-col items-center mb-8">
        
        <ShinyText text="Recommended Mods" speed={4} shineColor='#fff' color='#fff' className="text-2xl sm:text-3xl font-[800]" />
      </div>

      {/* Swiper slider */}
      <Swiper
        modules={[Navigation, Mousewheel, FreeMode]}
        spaceBetween={20}
        slidesPerView={1}
        loop={true}
        grabCursor={true}
        freeMode={{ enabled: true, sticky: false }}
        mousewheel={{ forceToAxis: true }}
        onSwiper={(swiper) => { swiperRef.current = swiper; }}
        breakpoints={{
          640:  { slidesPerView: 2, spaceBetween: 20 },
          1024: { slidesPerView: 4, spaceBetween: 24 },
        }}
      >
        {mods.map((mod) => (
          <SwiperSlide key={mod._id}>
            <div className="bg-black/30 backdrop-blur-lg  border-2 border-transparent hover:border-[#ff6600] rounded-[1rem] p-3 flex flex-col gap-3 transition-all duration-300  h-full">
              {/* Image */}
              <div className="w-full h-34 rounded-[0.75rem] overflow-hidden bg-black/40">
                <img
                  src={mod.mod_image}
                  alt={mod.name}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Name */}
              <h3 className="text-base sm:text-lg font-[800] leading-tight px-1">
                <ShinyText text={mod.name} speed={4} shineColor='#fff' color='#fff' className="text-base sm:text-lg font-[800]" />
              </h3>

              {/* Badges */}
              <div className="flex flex-col gap-2 px-1">
                {/* Game badge */}
                <div className="flex items-center gap-1.5 bg-[#362a1f] border-2 border-[#563a1a] rounded-[0.5rem] px-3 py-1 w-fit">
                  <img
                    src={mod.game === 'BeamNG.drive' ? '/icon/icon-beamng.ico' : '/icon/icon-assetto.ico'}
                    alt={mod.game}
                    width={16}
                    height={16}
                    className="rounded-sm"
                  />
                  <span className="text-[1rem] font-[700] text-white">{mod.game}</span>
                </div>

                {/* Type + brand */}
                <div className="flex flex-wrap gap-2">
                  {mod.mod_type && (
                    <div className="flex items-center gap-1.5 border-2 border-[#294371] bg-[#222938] rounded-[0.5rem] px-2 py-1 w-fit">
                      {typeIcon(mod.mod_type)}
                      <span className="text-[1rem] font-[700]">{mod.mod_type}</span>
                    </div>
                  )}
                  {mod.brand && mod.mod_type !== 'truck' && mod.mod_type !== 'maps' && (
                    <div className="flex items-center gap-1.5 border-2 border-[#3b2352] bg-[#2a2036] rounded-[0.5rem] px-2 py-1 w-fit">
                      <BrandIcon brand={mod.brand} width={16} height={16} />
                      <span className="text-[1rem] font-[700]">{mod.brand}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Arrow link */}
              <div className="mt-auto px-1">
                <Link
                  href={`/mods/${mod.slug ?? encodeURIComponent(mod.name)}`}
                  className="w-9 h-9 rounded-full border-2 border-[#ff6600] flex items-center justify-center text-[#ff6600] hover:bg-[#ff6600] hover:text-white transition-all duration-200"
                >
                  <ArrowUpRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Navigation */}
      <div className="flex items-center w-55 p-2 rounded-[1rem] mx-auto  justify-center gap-4 mt-7 bg-black/30 backdrop-blur-lg">
        <button
          onClick={prev}
          className="w-13 h-13 flex items-center justify-center    text-[#ff6600] hover:border-[#ff6600] transition-all"
          aria-label="Previous"
        >
          <ChevronsLeft className="w-10 h-10" />
        </button>

        <button
          onClick={doShuffle}
          className="w-13 h-13 flex items-center justify-center rounded-[1rem] bg-black/10 backdrop-blur-lg border-1 border-[#444] text-white hover:border-[#ff6600] transition-all"
          aria-label="Shuffle"
        >
          <Shuffle className="w-6 h-6" />
        </button>

        <button
          onClick={next}
          className="w-13 h-13 flex items-center justify-center text-[#ff6600] hover:border-[#ff6600] transition-all"
          aria-label="Next"
        >
          <ChevronsRight className="w-10 h-10" />
        </button>
      </div>
    </section>
  );
}
