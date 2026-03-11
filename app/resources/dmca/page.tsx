import {Mail} from "lucide-react"
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mods Haven - DMCA & Copyright",
  description: "Report copyright infringement on Modshaven.com. We take DMCA claims seriously and will act promptly to remove infringing content.",
  icons: {
    icon: '/icon/logo_1.ico',
  },
};
export default function DMCA() {
  return (
    <main className="min-h-screen flex flex-col items-center px-4 pt-32 pb-24">

      {/* Header */}
      <div className="w-full max-w-3xl text-center mb-12">
        <h1 className="text-white font-black text-4xl sm:text-5xl leading-tight mb-4">DMCA &amp; Copyright</h1>
        <p className="text-[#a0aec0] text-base">Report copyright infringement quickly and easily.</p>
      </div>

      <div className="w-full max-w-3xl space-y-4">

        {/* Intro */}
        <div className="bg-black/50 backdrop-blur-lg border border-white/10 rounded-3xl p-8 relative overflow-hidden hover:border-[#ff6600]/50 transition-all duration-300">
          <div className="absolute top-0 right-0 w-48 h-48 bg-[#ff6600]/6 rounded-full blur-3xl pointer-events-none" />
          <p className="text-[#c4c9d4] text-sm leading-relaxed">
            If you believe a file on <span className="text-white font-semibold">Modshaven.com</span> unlawfully uses your intellectual property, we are committed to removing it quickly.
          </p>
        </div>

        {/* How to report */}
        <div className="bg-black/50 backdrop-blur-lg border border-white/10 rounded-3xl p-8 hover:border-[#ff6600]/50 transition-all duration-300">
          <span className="inline-flex items-center text-[10px] font-bold tracking-[0.25em] uppercase bg-[#ff6600]/15 text-[#ff8833] px-3 py-1 rounded-full mb-4">
            Report
          </span>
          <h2 className="text-white font-black text-xl mb-3">How to Report Infringement</h2>
          <p className="text-[#c4c9d4] text-sm leading-relaxed mb-6">
            Send us a notice with valid proof of your ownership and the location (URL) of the file. You can reach us at:
          </p>
          <div className="space-y-3">
            <a
              href="mailto:contact@modshaven.com"
              className="flex items-center gap-4 bg-black/50 backdrop-blur-lg border border-white/10 hover:bg-[#ff6600]/10 border border-white/10 hover:border-[#ff6600]/40 rounded-2xl px-5 py-4 transition-all duration-200 group"
            >
              <svg role="img" className="w-7   h-7" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><title>Gmail</title><path fill="#fff" d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.548l6.545-4.91 1.528-1.145C21.69 2.28 24 3.434 24 5.457z"/></svg>
              <div>
                <p className="text-white font-semibold text-sm">Email</p>
                <p className="text-[#ff8833] text-sm group-hover:text-orange-400 transition-colors">contact@modshaven.com</p>
              </div>
            </a>
            <a
              href="https://discord.gg/rznaVXeNX8"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 bg-black/50  hover:bg-[#ff6600]/10 border border-white/10 hover:border-[#ff6600]/40 rounded-2xl px-5 py-4 transition-all duration-200 group"
            >
             <svg role="img" className="w-7 h-7"  viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><title>Discord</title><path fill="#fff"  d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z"/></svg>
              
              <div>
                <p className="text-white font-semibold text-sm">Discord</p>
                <p className="text-[#ff8833] text-sm group-hover:text-orange-400 transition-colors">discord.gg/rznaVXeNX8</p>
              </div>
            </a>
          </div>
        </div>

        {/* Closing statement */}
        <div className="bg-[#ff6600]/20 backdrop-blur-lg border border-[#ff6600]/30 rounded-3xl p-6 flex items-start gap-4">
          <span className="w-8 h-[2px] bg-[#ff6600] rounded-full mt-3 shrink-0" />
          <p className="text-[#c4c9d4] text-sm leading-relaxed">
            Modshaven.com does not support any form of copyright infringement and will act promptly on valid claims.
          </p>
        </div>

      </div>
    </main>
  );
}
