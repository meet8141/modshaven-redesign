import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Privacy Policy",
  description: "Learn how we collect, use, and protect your personal information on Modshaven.com",
  path: "/resources/privacy",
});
export default function PrivacyPolicy() {
  return (
    <main className="min-h-screen flex flex-col items-center px-4 pt-32 pb-24">
      {/* Header */}
      <div className="w-full max-w-3xl text-center mb-12">
        <h1 className="text-white font-black text-4xl sm:text-5xl leading-tight mb-4">Privacy Policy</h1>
        <p className="text-[#a0aec0] text-base">How we collect, use, and protect your information.</p>
      </div>

      <div className="w-full max-w-3xl space-y-4">

        {/* Intro */}
        <div className="bg-black/50 backdrop-blur-lg border border-white/10 rounded-3xl p-8 relative overflow-hidden hover:border-[#ff6600]/50 transition-all duration-300">
          <div className="absolute top-0 right-0 w-48 h-48 bg-[#ff6600]/6 rounded-full blur-3xl pointer-events-none" />
          <p className="text-[#c4c9d4] text-sm leading-relaxed">
            This Privacy Policy explains how <span className="text-white font-semibold">Modshaven.com</span> (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) collects, uses, maintains, and shares information from users (&quot;you&quot; or &quot;Users&quot;) of the Modshaven.com website (&quot;Site&quot;).
          </p>
        </div>

        {/* Information We Collect */}
        <div className="bg-black/50 backdrop-blur-lg border border-white/10 rounded-3xl p-8 relative overflow-hidden hover:border-[#ff6600]/50 transition-all duration-300">
          <span className="inline-flex items-center text-[10px] font-bold tracking-[0.25em] uppercase bg-[#ff6600]/15 text-[#ff8833] px-3 py-1 rounded-full mb-4">
            Data Collection
          </span>
          <h2 className="text-white font-black text-xl mb-4">Information We Collect</h2>
          <p className="text-[#c4c9d4] text-sm leading-relaxed mb-4">When you interact with our Site, we may collect the following information:</p>
          <div className="space-y-3">
            <div className="border-l-2 border-[#ff6600]/50 pl-4">
              <p className="text-white font-semibold text-sm mb-1">Location Information</p>
              <p className="text-[#c4c9d4] text-sm leading-relaxed">We may collect your general location based on your IP address. This helps us understand our user base and potentially tailor content or features to specific regions in the future.</p>
            </div>
            <div className="border-l-2 border-[#ff6600]/50 pl-4">
              <p className="text-white font-semibold text-sm mb-1">Site Behavior Information</p>
              <p className="text-[#c4c9d4] text-sm leading-relaxed">We track how you interact with our Site, including the pages you visit, the links you click, and other actions you take. This helps us improve design and functionality.</p>
            </div>
          </div>
        </div>

        {/* Non-Personal Info */}
        <div className="bg-black/50 backdrop-blur-lg border border-white/10 rounded-3xl p-8 hover:border-[#ff6600]/50 transition-all duration-300">
          <span className="inline-flex items-center text-[10px] font-bold tracking-[0.25em] uppercase bg-[#ff6600]/15 text-[#ff8833] px-3 py-1 rounded-full mb-4">
            Aggregated Data
          </span>
          <h2 className="text-white font-black text-xl mb-3">Non-Personal Information</h2>
          <p className="text-[#c4c9d4] text-sm leading-relaxed">
            We may automatically collect non-personal information such as your browser type, operating system, and device information. This data is generally aggregated and does not directly identify you.
          </p>
        </div>

        {/* Cookies */}
        <div className="bg-black/50 backdrop-blur-lg border border-white/10 rounded-3xl p-8 hover:border-[#ff6600]/50 transition-all duration-300">
          <span className="inline-flex items-center text-[10px] font-bold tracking-[0.25em] uppercase bg-[#ff6600]/15 text-[#ff8833] px-3 py-1 rounded-full mb-4">
            Tracking
          </span>
          <h2 className="text-white font-black text-xl mb-3">Web Browser Cookies</h2>
          <p className="text-[#c4c9d4] text-sm leading-relaxed mb-4">
            Our Site uses &quot;cookies&quot; — small text files stored on your device — to enhance your browsing experience and analyze site usage.
          </p>
          <p className="text-[#c4c9d4] text-sm font-semibold mb-2">We use cookies to:</p>
          <ul className="list-disc list-inside text-[#c4c9d4] text-sm space-y-1 mb-4">
            <li>Understand how you use our Site</li>
            <li>Analyze overall site traffic and usage patterns</li>
          </ul>
          <p className="text-[#c4c9d4] text-sm leading-relaxed mb-3">
            <span className="text-white font-semibold">Analytics Cookies</span> — collect and report information anonymously (e.g. popular pages, session duration). We may use Google Analytics for this purpose.
          </p>
          <p className="text-[#c4c9d4] text-sm leading-relaxed">
            You can set your browser to refuse or alert you when cookies are sent. Disabling cookies may affect your experience on our Site.
          </p>
        </div>

        {/* Third-Party / Children / Changes / Acceptance — two-column grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-black/50 backdrop-blur-lg border border-white/10 rounded-3xl p-6 hover:border-[#ff6600]/50 transition-all duration-300">
            <h2 className="text-white font-black text-lg mb-3">Third-Party Websites</h2>
            <p className="text-[#c4c9d4] text-sm leading-relaxed">
              Our Site may contain links to other websites. We are not responsible for the privacy practices of external sites and encourage you to review their policies.
            </p>
          </div>
          <div className="bg-black/50 backdrop-blur-lg border border-white/10 rounded-3xl p-6 hover:border-[#ff6600]/50 transition-all duration-300">
            <h2 className="text-white font-black text-lg mb-3">Children&apos;s Privacy</h2>
            <p className="text-[#c4c9d4] text-sm leading-relaxed">
              We do not knowingly collect personal information from individuals under 13. Our Site is not intended for children under 13.
            </p>
          </div>
          <div className="bg-black/50 backdrop-blur-lg border border-white/10 rounded-3xl p-6 hover:border-[#ff6600]/50 transition-all duration-300">
            <h2 className="text-white font-black text-lg mb-3">Policy Changes</h2>
            <p className="text-[#c4c9d4] text-sm leading-relaxed">
              We may update this Privacy Notice at any time. Changes are effective upon posting. We encourage you to review this page periodically.
            </p>
          </div>
          <div className="bg-black/50 backdrop-blur-lg border border-white/10 rounded-3xl p-6 hover:border-[#ff6600]/50 transition-all duration-300">
            <h2 className="text-white font-black text-lg mb-3">Your Acceptance</h2>
            <p className="text-[#c4c9d4] text-sm leading-relaxed">
              By using this Site you signify acceptance of this Privacy Notice. Continued use after changes are posted constitutes acceptance of those changes.
            </p>
          </div>
        </div>

      </div>
    </main>
  );
}
