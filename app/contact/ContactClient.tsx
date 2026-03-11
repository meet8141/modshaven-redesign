"use client";

import { Mail, MessageSquare, Clock } from "lucide-react";

const SUPPORT_EMAIL = "support@modshaven.com";
const DISCORD_INVITE = "https://discord.gg/modshaven";

function gmailComposeUrl(to: string) {
  return `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(to)}`;
}

export default function ContactClient() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 py-24 z-10">
      {/* Heading */}
      <h1 className="text-5xl font-extrabold text-white mb-4 text-center">
        Contact Us
      </h1>
      <p className="text-[#a0aec0] text-base text-center max-w-xl mb-14">
        Have questions, suggestions, or need assistance? Our team is here to help.
      </p>

      {/* Card */}
      <div className="w-full max-w-3xl bg-black/30 backdrop-blur-lg border border-white/10 rounded-2xl px-10 py-10 grid grid-cols-1 sm:grid-cols-2 gap-8">

        {/* Email */}
        <a
          href={gmailComposeUrl(SUPPORT_EMAIL)}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-start gap-4 group cursor-pointer"
        >
          <div className="mt-1 text-orange-500 group-hover:text-orange-400 transition-colors">
            <Mail size={22} />
          </div>
          <div>
            <p className="text-white font-bold text-base mb-1">Email</p>
            <p className="text-[#a0aec0] text-sm group-hover:text-orange-400 transition-colors">
              {SUPPORT_EMAIL}
            </p>
          </div>
        </a>

        {/* Response Time */}
        <div className="flex items-start gap-4">
          <div className="mt-1 text-orange-500">
            <Clock size={22} />
          </div>
          <div>
            <p className="text-white font-bold text-base mb-1">Response Time</p>
            <p className="text-[#a0aec0] text-sm">Typically 12–10 Hour</p>
          </div>
        </div>

        {/* Discord */}
        <a
          href={DISCORD_INVITE}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-start gap-4 group cursor-pointer"
        >
          <div className="mt-1 text-orange-500 group-hover:text-orange-400 transition-colors">
            <MessageSquare size={22} />
          </div>
          <div>
            <p className="text-white font-bold text-base mb-1">Discord</p>
            <p className="text-[#a0aec0] text-sm group-hover:text-orange-400 transition-colors">
              Join our community server
            </p>
          </div>
        </a>
      </div>
    </main>
  );
}
