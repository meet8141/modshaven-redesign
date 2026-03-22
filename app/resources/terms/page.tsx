import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Terms of Service",
  description: "Learn about the terms and conditions for using Modshaven.com.",
  path: "/resources/terms",
});
export default function TermsOfService() {
  return (
    <main className="min-h-screen flex flex-col items-center px-4 pt-32 pb-24">

      {/* Header */}
      <div className="w-full max-w-3xl text-center mb-12">
        <h1 className="text-white font-black text-4xl sm:text-5xl leading-tight mb-4">Terms of Service</h1>
        <p className="text-[#a0aec0] text-base">Rules and guidelines for using Modshaven.com.</p>
      </div>

      <div className="w-full max-w-3xl space-y-4">

        {/* Intro */}
        <div className="bg-black/50 backdrop-blur-lg border border-white/10 rounded-3xl p-8 relative overflow-hidden hover:border-[#ff6600]/50 transition-all duration-300">
          <div className="absolute top-0 right-0 w-48 h-48 bg-[#ff6600]/6 rounded-full blur-3xl pointer-events-none" />
          <p className="text-[#c4c9d4] text-sm leading-relaxed">
            These Terms of Service govern your use of the <span className="text-white font-semibold">Modshaven.com</span> website (&quot;Site&quot;). By using our Site, you agree to be bound by these terms and consent to the information collection practices described in our Privacy Notice.
          </p>
        </div>

        {/* Account grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-black/50 backdrop-blur-lg border border-white/10 rounded-3xl p-6 hover:border-[#ff6600]/50 transition-all duration-300">
            <h2 className="text-white font-black text-lg mb-3">Account Creation</h2>
            <p className="text-[#c4c9d4] text-sm leading-relaxed">
              User accounts are not currently available. This feature may be implemented in the future and these Terms will be updated accordingly.
            </p>
          </div>
          <div className="bg-black/50 backdrop-blur-lg border border-white/10 rounded-3xl p-6 hover:border-[#ff6600]/50 transition-all duration-300">
            <h2 className="text-white font-black text-lg mb-3">Account Security</h2>
            <p className="text-[#c4c9d4] text-sm leading-relaxed">
              Since user accounts are not currently available, account security provisions do not apply at this time.
            </p>
          </div>
          <div className="bg-black/50 backdrop-blur-lg border border-white/10 rounded-3xl p-6 hover:border-[#ff6600]/50 transition-all duration-300">
            <h2 className="text-white font-black text-lg mb-3">User Content</h2>
            <p className="text-[#c4c9d4] text-sm leading-relaxed">
              Users are not currently permitted to submit or post content. This may be added in the future.
            </p>
          </div>
        </div>

        {/* Suspension */}
        <div className="bg-black/50 backdrop-blur-lg border border-white/10 rounded-3xl p-8 hover:border-[#ff6600]/50 transition-all duration-300">
          <span className="inline-flex items-center text-[10px] font-bold tracking-[0.25em] uppercase bg-[#ff6600]/15 text-[#ff8833] px-3 py-1 rounded-full mb-4">
            Access
          </span>
          <h2 className="text-white font-black text-xl mb-3">Account Suspension &amp; Termination</h2>
          <p className="text-[#c4c9d4] text-sm leading-relaxed">
            As user accounts are not currently available, suspension and termination provisions do not apply at this time. However, Modshaven.com reserves the right to restrict or terminate access to the Site for any reason, including activity that violates these Terms of Service or any applicable law.
          </p>
        </div>

        {/* Downloads */}
        <div className="bg-black/50 backdrop-blur-lg border border-white/10 rounded-3xl p-8 hover:border-[#ff6600]/50 transition-all duration-300">
          <span className="inline-flex items-center text-[10px] font-bold tracking-[0.25em] uppercase bg-[#ff6600]/15 text-[#ff8833] px-3 py-1 rounded-full mb-4">
            Files
          </span>
          <h2 className="text-white font-black text-xl mb-3">Downloads</h2>
          <p className="text-[#c4c9d4] text-sm leading-relaxed">
            Modshaven.com offers files for download. Your use of downloaded files is subject to any specific licenses or terms provided with those files. Modshaven.com is not responsible for any issues arising from the use or misuse of downloaded files.
          </p>
        </div>

        {/* Copyright */}
        <div className="bg-black/50 backdrop-blur-lg border border-white/10 rounded-3xl p-8 hover:border-[#ff6600]/50 transition-all duration-300">
          <span className="inline-flex items-center text-[10px] font-bold tracking-[0.25em] uppercase bg-[#ff6600]/15 text-[#ff8833] px-3 py-1 rounded-full mb-4">
            IP Rights
          </span>
          <h2 className="text-white font-black text-xl mb-3">Copyright</h2>
          <p className="text-[#c4c9d4] text-sm leading-relaxed mb-4">
            If you believe content on the Site infringes your copyright rights, notify us immediately with valid proof of ownership and the URL(s) of the infringing material. We will promptly remove confirmed content.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <a href="mailto:contact@modshaven.com" className="flex items-center gap-2 text-sm text-[#ff8833] hover:text-orange-400 transition-colors">
              <span className="w-1.5 h-1.5 rounded-full bg-[#ff6600]" />
              contact@modshaven.com
            </a>
            <a href="https://discord.gg/rznaVXeNX8" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-[#ff8833] hover:text-orange-400 transition-colors">
              <span className="w-1.5 h-1.5 rounded-full bg-[#ff6600]" />
              discord.gg/rznaVXeNX8
            </a>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="bg-black/50 backdrop-blur-lg border border-white/10 rounded-3xl p-8 hover:border-[#ff6600]/50 transition-all duration-300">
          <span className="inline-flex items-center text-[10px] font-bold tracking-[0.25em] uppercase bg-[#ff6600]/15 text-[#ff8833] px-3 py-1 rounded-full mb-4">
            Liability
          </span>
          <h2 className="text-white font-black text-xl mb-3">Disclaimer</h2>
          <p className="text-[#c4c9d4] text-sm leading-relaxed mb-3">
            While Modshaven.com takes diligent measures to test all downloadable files for viruses and compatibility issues, your use of the Site and downloaded files is ultimately at your own risk. The Site and all content are provided <span className="text-white">&quot;as is&quot;</span> without warranties of any kind.
          </p>
          <p className="text-[#c4c9d4] text-sm leading-relaxed">
            Modshaven.com does not warrant that the Site will be available, uninterrupted, or error-free. We do not accept liability for loss or damage from use of the Site or downloaded files, except for direct damages caused by our gross negligence or willful misconduct in our testing procedures.
          </p>
        </div>

        {/* Changes */}
        <div className="bg-black/50 backdrop-blur-lg border border-white/10 rounded-3xl p-8 hover:border-[#ff6600]/50 transition-all duration-300">
          <h2 className="text-white font-black text-xl mb-3">Changes to These Terms</h2>
          <p className="text-[#c4c9d4] text-sm leading-relaxed">
            Modshaven.com may update these Terms at any time. Changes will be posted on the Site. It is your responsibility to review these Terms periodically and become aware of modifications.
          </p>
        </div>

        {/* Acceptance footer */}
        <div className="bg-[#ff6600]/20 backdrop-blur-lg border border-[#ff6600]/30 rounded-3xl p-6 flex items-start gap-4">
          <span className="w-8 h-[2px] bg-[#ff6600] rounded-full mt-3 shrink-0" />
          <p className="text-[#c4c9d4] text-sm leading-relaxed">
            By continuing to use Modshaven.com, you signify your acceptance of these Terms of Service.
          </p>
        </div>

      </div>
    </main>
  );
}
