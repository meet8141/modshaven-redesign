'use client';

import { useEffect, useState } from 'react';
import { Download, FileText } from 'lucide-react';

type Mod = {
  _id: string;
  name: string;
  author: string;
  game: string;
  downloads_size: string;
  date_added: string | null;
  downloads: number;
  mod_image: string;
  AD_link: string;
  download_link: string;
};

export default function DownloadClient({ mod }: { mod: Mod }) {
  const [adSeen, setAdSeen] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem(`dl_ad_${mod._id}`)) {
      setAdSeen(true);
    }
  }, [mod._id]);

  const handleDownload = () => {
    if (!adSeen) {
      sessionStorage.setItem(`dl_ad_${mod._id}`, '1');
      window.location.href = mod.AD_link;
    } else {
      window.location.href = mod.download_link;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 mt-15">
      <div className="bg-black/50   backdrop-blur-lg border border-[#2a2a3e] rounded-[1.25rem] p-6 flex flex-col items-center gap-5 max-w-[100%]  sm:max-w-[35%] w-full text-white text-center shadow-2xl">

        {/* Title */}
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl sm:text-3xl font-[900]">{mod.name}</h1>
          <p className="text-sm font-[700] text-white/80">
            Mod for {mod.game} by {mod.author}
          </p>
        </div>

        {/* Image */}
        {mod.mod_image && (
          <img
            src={mod.mod_image}
            alt={mod.name}
            className="w-full max-h-52 object-cover rounded-[0.75rem]"
          />
        )}

        {/* File info row */}
        <div className="flex items-center gap-4 w-full bg-black/10 backdrop-blur-lg border-1  border-[#ff6600]  hover:cursor-pointer transition-all duration-200 rounded-[0.75rem] px-4 py-3">
          <div className="bg-white/10 p-2.5 rounded-[0.5rem] shrink-0">
            <FileText className="w-6 h-6 text-[#ff6600]" />
          </div>
          <div className="flex flex-col items-start">
            <p className="font-[800] text-sm sm:text-base">{mod.name}.zip</p>
            <p className="text-xs text-white/60 font-[600]">{mod.downloads_size}</p>
          </div>
        </div>

        {/* Download button */}
        <button
          onClick={handleDownload}
          className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-[0.75rem] bg-[#ff6600] hover:bg-[#ff5500] transition-colors font-[800] text-base sm:text-lg w-full cursor-pointer"
        >
          <Download className="w-5 h-5 stroke-[3]" />
          Download
        </button>

        {/* Footer notes */}
        <div className="flex flex-col gap-1 text-left p-1 text-sm text-white/50 font-[600]">
          <p>Ads support the platform. Thank you for your patience.</p>
          <p>You are on the secure download page.</p>
          <p>If download didn&apos;t start Then click on download button again.</p>
        </div>

      </div>
    </div>
  );
}
