import {ShieldCheck,Eye,CircleAlert} from "lucide-react";
import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Safety & Security",
  description: "Learn about the safety and security measures we take to protect our users on Modshaven.com.",
  path: "/resources/safety",
});
export default function Safety() {
  return (
    <main className="min-h-screen flex flex-col items-center px-4 pt-32 pb-24">

      {/* Header */}
      <div className="w-full max-w-3xl text-center mb-12">
        <h1 className="text-white font-black text-4xl sm:text-5xl leading-tight mb-4">Safety &amp; Security</h1>
        <p className="text-[#a0aec0] text-base">Your safety is our top priority.</p>
      </div>

      <div className="w-full max-w-3xl space-y-4">

        {/* Intro */}
        <div className="bg-black/50 backdrop-blur-lg border border-white/10 rounded-3xl p-8 relative overflow-hidden hover:border-[#ff6600]/50 transition-all duration-300">
          <div className="absolute top-0 right-0 w-48 h-48 bg-[#ff6600]/6 rounded-full blur-3xl pointer-events-none" />
          <p className="text-[#c4c9d4] text-sm leading-relaxed">
            At <span className="text-white font-semibold">Modshaven.com</span>, the safety and security of our users is our top priority. We understand the concerns associated with downloading files from the internet, and we take extensive measures to ensure the files available on our Site are safe and virus-free.
          </p>
        </div>

        {/* Commitment heading card */}
        <div className="bg-black/50 backdrop-blur-lg border border-white/10 rounded-3xl p-8 hover:border-[#ff6600]/50 transition-all duration-300">
          <span className="inline-flex items-center text-[10px] font-bold tracking-[0.25em] uppercase bg-[#ff6600]/15 text-[#ff8833] px-3 py-1 rounded-full mb-4">
            Our Process
          </span>
          <h2 className="text-white font-black text-xl mb-3">Our Commitment to Virus-Free Files</h2>
          <p className="text-[#c4c9d4] text-sm leading-relaxed">
            Every file uploaded to Modshaven.com undergoes a rigorous testing process that includes:
          </p>
        </div>

        {/* Testing methods grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-black/50 backdrop-blur-lg border border-white/10 rounded-3xl p-6 relative overflow-hidden hover:border-[#ff6600]/50 transition-all duration-300">
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#ff6600]/8 rounded-full blur-2xl pointer-events-none" />
            <ShieldCheck className="w-8 h-8 text-[#ff6600] mb-3" />
            <h3 className="text-white font-black text-lg mb-2">Automated Scanning</h3>
            <p className="text-[#c4c9d4] text-sm leading-relaxed mb-3">
              We utilize multiple reputable antivirus engines through{" "}
              <a href="https://www.virustotal.com/" target="_blank" rel="noopener noreferrer" className="text-[#ff8833] hover:text-orange-400 transition-colors">VirusTotal</a>{" "}
              to scan each file for known viruses, worms, trojans, and other malware before it is made available to you.
            </p>
          </div>
          <div className="bg-black/50 backdrop-blur-lg border border-white/10 rounded-3xl p-6 relative overflow-hidden hover:border-[#ff6600]/50 transition-all duration-300">
            <div className="absolute bottom-0 right-0 w-32 h-32 bg-[#ff6600]/8 rounded-full blur-2xl pointer-events-none" />
            <Eye className="w-8 h-8 text-[#ff6600] mb-3" />
            <h3 className="text-white font-black text-lg mb-2">Manual Review</h3>
            <p className="text-[#c4c9d4] text-sm leading-relaxed">
              In addition to automated scans, we manually inspect files for unusual behavior, hidden scripts, or other indicators of malware that automated systems may not detect.
            </p>
          </div>
        </div>

        {/* Assurance */}
        <div className="bg-black/50 backdrop-blur-lg border border-white/10 rounded-3xl p-8 hover:border-[#ff6600]/50 transition-all duration-300">
          <h2 className="text-white font-black text-xl mb-3">Your Assurance</h2>
          <p className="text-[#c4c9d4] text-sm leading-relaxed">
            Through these thorough testing procedures, all files available for download on Modshaven.com are virus-free at the time of upload. You can download with confidence, knowing we have taken significant steps to protect your devices and data.
          </p>
          <div className="mt-4 flex items-center gap-2">
            <span className="w-8 h-[2px] bg-[#ff6600] rounded-full" />
            <span className="text-[#ff6600] text-xs font-bold tracking-widest uppercase">Download with confidence</span>
          </div>
        </div>

        {/* Note callout */}
        <div className="bg-[#ff6600]/20 backdrop-blur-lg border border-[#ff6600]/30 rounded-3xl p-6 flex items-start gap-4">
          <CircleAlert className="w-20 h-20 text-[#ff6600]" />
          <p className="text-[#c4c9d4] text-sm leading-relaxed">
            <span className="text-white font-semibold">Please Note: </span>
            While we strive to maintain a safe environment, it&apos;s always good practice to have your own up-to-date antivirus software running on your device for an added layer of protection when downloading and executing files from any source.
          </p>
        </div>

      </div>
    </main>
  );
}
