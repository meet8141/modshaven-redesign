"use client";

import { Layers, Gamepad2, Telescope } from "lucide-react";

const missionCards = [
  {
    icon: <Layers size={28} />,
    tag: "no cap",
    title: "Curated Mods",
    body: "We carefully select and test mods to bring you high-quality content and exciting new ways to experience your favorite games.",
  },
  {
    icon: <Gamepad2 size={28} />,
    tag: "fr fr",
    title: "Enhance Games",
    body: "We believe that mods extend the life of games and create new experiences that developers never imagined.",
  },
  {
    icon: <Telescope size={28} />,
    tag: "let's gooo",
    title: "Our Vision for the Future",
    body: "We aim to connect modders and players, fostering a vibrant ecosystem for gaming enthusiasts as our platform evolves.",
  },
];

export default function AboutPage() {
  return (
    <main className="min-h-screen flex flex-col items-center px-4 pt-36 pb-24 overflow-hidden">

     

      {/* ── Bento grid ── */}
      <div className="w-full max-w-4xl grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">

        {/* Our Story — tall card */}
        <div className="sm:row-span-2 bg-[#0f0f0f]/95 backdrop-blur-xl border border-white/10 rounded-3xl p-8 relative overflow-hidden hover:border-[#ff6600]/50 transition-all duration-300 flex flex-col justify-between">
          {/* corner glow */}
          <div className="absolute bottom-0 right-0 w-48 h-48 bg-[#ff6600]/10 rounded-full blur-3xl pointer-events-none" />

          <div>
            <span className="inline-block text-[10px] font-black tracking-[0.3em] uppercase bg-[#ff6600]/15 text-[#ff8833] px-3 py-1 rounded-full mb-5">
              origin story 🔥
            </span>
            <h2 className="text-white font-black text-3xl mb-5 leading-tight">Our Story</h2>

            <div className="space-y-4">
              <p className="text-[#c4c9d4] text-sm leading-relaxed">
                What started as a small passion project is becoming a platform with a growing
                collection of mods for popular games. We aim to enhance gameplay by offering
                players exciting new ways to experience their favorite titles.
              </p>
              <p className="text-[#c4c9d4] text-sm leading-relaxed">
                Mods Haven began with a simple vision: to create an accessible space for gaming
                modifications.
              </p>
              <p className="text-[#c4c9d4] text-sm leading-relaxed">
                Currently, we are building a diverse selection of mods, ranging from simple
                improvements to more significant changes, all geared towards enriching the player
                experience. We are enthusiastic about the future growth of Modshaven.com.
              </p>
            </div>
          </div>

          {/* bottom tag */}
          <div className="mt-8 flex items-center gap-2">
            <span className="w-8 h-[2px] bg-[#ff6600] rounded-full" />
            <span className="text-[#ff6600] text-xs font-bold tracking-widest uppercase">Modshaven.com</span>
          </div>
        </div>

        {/* Mission headline card */}
        <div className="bg-gradient-to-br from-[#ff6600]/20 to-[#ff3d00]/5 border border-[#ff6600]/25 rounded-3xl p-8 relative overflow-hidden flex flex-col justify-center">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#ff6600]/15 rounded-full blur-2xl pointer-events-none" />
          <span className="text-2xl mb-3">🎯</span>
          <h2 className="text-white font-black text-2xl leading-tight mb-3">Our Mission</h2>
          <p className="text-[#c4c9d4] text-sm leading-relaxed">
            Most accessible, creator-friendly platform for game mods — fostering a{" "}
            <span className="text-[#ff8833] font-semibold">community where innovation thrives.</span>
          </p>
        </div>

        {/* stats / vibe card */}
        <div className="bg-[#0f0f0f]/95 backdrop-blur-xl border border-white/10 rounded-3xl p-8 flex flex-col justify-center gap-5 hover:border-[#ff6600]/50 transition-all duration-300">
          <div className="flex items-center gap-4">
            <span className="text-3xl">🚀</span>
            <div>
              <p className="text-white font-black text-lg leading-none">Growing fast</p>
              <p className="text-[#888] text-xs mt-1">new mods dropping regularly</p>
            </div>
          </div>
          <div className="w-full h-px bg-white/5" />
          <div className="flex items-center gap-4">
            <span className="text-3xl">🎮</span>
            <div>
              <p className="text-white font-black text-lg leading-none">All your fav games</p>
              <p className="text-[#888] text-xs mt-1">from simple tweaks to massive overhauls</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Mission Cards ── */}
      <div className="w-full max-w-4xl grid grid-cols-1 sm:grid-cols-3 gap-4 mt-2">
        {missionCards.map(({ icon, tag, title, body }) => (
          <div
            key={title}
            className="group bg-[#0f0f0f]/95 backdrop-blur-xl border-2 border-white/10 hover:border-[#ff6600] rounded-3xl px-7 py-8 flex flex-col gap-4 transition-all duration-300 hover:scale-[1.03] hover:shadow-[0_0_30px_rgba(255,102,0,0.12)] relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-[#ff6600]/0 to-[#ff6600]/0 group-hover:from-[#ff6600]/5 group-hover:to-transparent transition-all duration-500 rounded-3xl pointer-events-none" />
            <div className="flex items-start justify-between">
              <span className="text-[#ff6600]">{icon}</span>
              <span className="text-[10px] font-black text-[#ff6600]/60 tracking-widest uppercase bg-[#ff6600]/10 px-2 py-0.5 rounded-full">
                {tag}
              </span>
            </div>
            <h3 className="text-white font-black text-base leading-snug">{title}</h3>
            <p className="text-[#c4c9d4] text-sm leading-relaxed">{body}</p>
          </div>
        ))}
      </div>

    </main>
  );
}
