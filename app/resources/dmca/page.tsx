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
              className="flex items-center gap-4 bg-white/5 hover:bg-[#ff6600]/10 border border-white/10 hover:border-[#ff6600]/40 rounded-2xl px-5 py-4 transition-all duration-200 group"
            >
              <span className="text-xl">✉️</span>
              <div>
                <p className="text-white font-semibold text-sm">Email</p>
                <p className="text-[#ff8833] text-sm group-hover:text-orange-400 transition-colors">contact@modshaven.com</p>
              </div>
            </a>
            <a
              href="https://discord.gg/rznaVXeNX8"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 bg-white/5 hover:bg-[#ff6600]/10 border border-white/10 hover:border-[#ff6600]/40 rounded-2xl px-5 py-4 transition-all duration-200 group"
            >
              <span className="text-xl">💬</span>
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
