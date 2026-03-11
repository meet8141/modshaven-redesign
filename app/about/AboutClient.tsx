"use client";

import { Layers, Telescope, Award, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

interface DiscordStats {
  memberCount: number;
  onlineCount: number;
}

const missionCards = [
  {
    icon: <Layers size={26} />,
    tag: "Quality First",
    title: "Curated Mods",
    body: "Every mod is carefully reviewed and tested before listing, so you always get high-quality content that works as described.",
  },
  {
    icon: <Award size={26} />,
    tag: "Extend Gameplay",
    title: "Enhance Your Games",
    body: "Mods breathe new life into games — unlocking experiences developers never imagined and keeping titles fun for years.",
  },
  {
    icon: <Telescope size={26} />,
    tag: "What's Next",
    title: "Vision for the Future",
    body: "We're building tools to connect modders and players, creating a thriving ecosystem for the entire gaming community.",
  },
];

export default function AboutClient() {
  const [discordStats, setDiscordStats] = useState<DiscordStats | null>(null);

  useEffect(() => {
    fetch("/api/discord/stats")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => setDiscordStats(data))
      .catch(() => {});
  }, []);

  return (
    <main className="min-h-screen flex flex-col items-center px-4 pt-32 pb-24 overflow-hidden">

      {/* ── Page header ── */}
      <div className="w-full max-w-4xl text-center mb-12">
        <h1 className="text-white font-black text-4xl sm:text-5xl leading-tight mb-4">
           About Mods Haven
        </h1>
      </div>

      {/* ── Bento grid ── */}
      <div className="w-full max-w-4xl grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">

        {/* Our Story — tall card */}
        <div className="sm:row-span-2 bg-black/50 backdrop-blur-lg border border-white/10 rounded-3xl p-8 relative overflow-hidden hover:border-[#ff6600]/50 transition-all duration-300 flex flex-col justify-between">
          <div className="absolute bottom-50 right-0 w-56 h-56 bg-[#ff6600]/8 rounded-full blur-3xl pointer-events-none" />

          <div>
            <span className="inline-flex items-center gap-1.5 text-[10px] font-bold tracking-[0.25em] uppercase bg-[#ff6600]/15 text-[#ff8833] px-3 py-1 rounded-full mb-5">
              Our Origin
            </span>
            <h2 className="text-white font-black text-3xl mb-5 leading-tight">Our Story</h2>

            <div className="space-y-4">
              <p className="text-[#c4c9d4] text-sm leading-relaxed">
                Mods Haven started as a small passion project with one goal: make finding quality
                game mods easy. No clutter, no shady downloads — just a clean, trustworthy place
                for gamers to explore new experiences.
              </p>
              <p className="text-[#c4c9d4] text-sm leading-relaxed">
                We believe modifications are one of gaming's greatest gifts. They extend the life
                of games, spark creativity, and bring communities together around shared passion.
              </p>
              <p className="text-[#c4c9d4] text-sm leading-relaxed">
                Today we're growing our library — from simple tweaks to large-scale overhauls —
                and we're just getting started. Every mod we add is one more way for players to
                enjoy the games they love.
              </p>
            </div>
          </div>

          <div className="mt-8 flex items-center gap-2">
            <span className="w-8 h-[2px] bg-[#ff6600] rounded-full" />
            <span className="text-[#ff6600] text-xs font-bold tracking-widest uppercase">Team Modshaven</span>
          </div>
        </div>

        {/* Mission card */}
        <div className="bg-black/50 border hover:border-[#ff6600]/40 border-white/10 rounded-3xl backdrop-blur-lg p-8 relative overflow-hidden flex flex-col justify-center">
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#ff6600]/12 rounded-full blur-2xl pointer-events-none" />
          <span className="text-2xl mb-3">🎯</span>
          <h2 className="text-white font-black text-2xl leading-tight mb-3">Our Mission</h2>
          <p className="text-[#c4c9d4] text-sm leading-relaxed">
            To be the most accessible, creator-friendly platform for game mods — fostering a{" "}
            <span className="text-[#ff8833] font-semibold">community where innovation thrives</span>{" "}
            and every player can customize their experience.
          </p>
        </div>

        {/* Stats card */}
        <div className="bg-black/50 border border-white/10 hover:border-[#ff6600]/40 rounded-3xl backdrop-blur-lg p-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-40 h-40 bg-[#ff6600]/8 rounded-full blur-3xl pointer-events-none" />
          <h2 className="text-white font-black text-lg mb-5">By the Numbers</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-0.5">
              <span className="text-[#ff6600] font-black text-2xl leading-none">
                {discordStats ? `${discordStats.memberCount.toLocaleString()}` : "—"}
              </span>
              <span className="text-[#9099a6] text-xs font-medium">Members</span>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-[#ff6600] font-black text-2xl leading-none flex items-center gap-1.5">
                <span className="inline-block w-2 h-2 rounded-full bg-green-400" />
                {discordStats ? `${discordStats.onlineCount.toLocaleString()}` : "—"}
              </span>
              <span className="text-[#9099a6] text-xs font-medium">Online Now</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Mission Cards ── */}
      <div className="w-full max-w-4xl grid grid-cols-1 sm:grid-cols-3 gap-4 mt-2">
        {missionCards.map(({ icon, tag, title, body }) => (
          <div
            key={title}
            className="group bg-black/50 backdrop-blur-xl border border-white/10 hover:border-[#ff6600] rounded-3xl px-7 py-8 flex flex-col gap-4 transition-all duration-300 relative overflow-hidden"
          >
            <div className="flex items-start justify-between">
              <span className="text-[#ff6600]">{icon}</span>
              <span className="text-[10px] font-bold text-[#ff8833]/70 tracking-wider uppercase bg-[#ff6600]/10 px-2.5 py-1 rounded-full">
                {tag}
              </span>
            </div>
            <h3 className="text-white font-black text-base leading-snug">{title}</h3>
            <p className="text-[#c4c9d4] text-sm leading-relaxed">{body}</p>
          </div>
        ))}
      </div>

      {/* ── CTA ── */}
      <div className="w-full max-w-4xl mt-6">
        <div className="bg-black/50 backdrop-blur-lg border border-[#ff6600]/30 rounded-3xl p-10 flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
          <div>
            <h3 className="text-white font-black text-2xl mb-2">Ready to explore?</h3>
            <p className="text-[#9099a6] text-sm max-w-sm">
              Browse hundreds of free mods across your favorite games and start customizing today.
            </p>
          </div>
          <Link
            href="/mods"
            className="flex-shrink-0 inline-flex items-center gap-2 bg-[#ff6600] hover:bg-[#e55a00] text-white font-bold text-sm px-6 py-3 rounded-full transition-colors duration-200"
          >
            Browse Mods <ArrowRight size={16} />
          </Link>
        </div>
      </div>

    </main>
  );
}
