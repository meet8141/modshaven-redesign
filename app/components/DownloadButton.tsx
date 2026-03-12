'use client';

import { useEffect, useState } from 'react';
import { Download } from 'lucide-react';

type Props = {
  modId: string;
  adLink: string;
};

export default function DownloadButton({ modId, adLink }: Props) {
  const [adSeen, setAdSeen] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem(`mods_ad_${modId}`)) {
      setAdSeen(true);
    }
  }, [modId]);

  const handleClick = () => {
    if (!adSeen) {
      sessionStorage.setItem(`mods_ad_${modId}`, '1');
      window.location.href = adLink;
    } else {
      window.location.href = `/download?id=${modId}`;
    }
  };

  return (
    <button
      onClick={handleClick}
      className="flex items-center justify-center gap-1 px-4 cursor-pointer py-1.5 sm:py-2 rounded-[0.5rem] bg-[#ff6600] hover:bg-[#ff6600]/90 transition-colors w-fit"
    >
      <Download className="w-4 h-4 sm:w-5 sm:h-5 stroke-3 text-white" />
      <p className="text-base sm:text-lg md:text-[1.5rem] font-[800]">Download</p>
    </button>
  );
}
