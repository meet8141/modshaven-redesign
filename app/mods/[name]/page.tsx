import Image from "next/image";
import SplitText from "@/app/components/SplitText";
import DecryptedText from '@/app/components/DecryptedText';
import ImageGallery from '@/app/components/ImageGallery';

import { CarFront, ArrowUpRight, Map, Truck, CalendarFold, FolderArchive,Copyright,Download,BadgeCheck } from 'lucide-react';
import type { Metadata } from "next";
import Script from 'next/script';

export const dynamic = 'force-dynamic';
import { getModByName, getModBySlug, getRandomMods } from '@/lib/DB';
import RecommendedSlider from '@/app/components/RecommendedSlider';
import ShinyText from '@/app/components/ShinyText';
import { notFound } from 'next/navigation';
import DownloadButton from '@/app/components/DownloadButton';
import DiscordCommunityCounts from '@/components/DiscordCommunityCounts';
import { buildPageMetadata } from '@/lib/seo';
import { absoluteUrl } from '@/lib/seo';

type Props = {
  params: Promise<{ name: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { name } = await params;
  const decoded = decodeURIComponent(name);
  const mod = await getModBySlug(decoded) ?? await getModByName(decoded);

  if (!mod) {
    return buildPageMetadata({
      title: 'Mod Not Found',
      description: 'The requested mod could not be found.',
      path: '/mods',
      noIndex: true,
    });
  }

  const canonicalSlug = mod.slug || encodeURIComponent(mod.name);

  return buildPageMetadata({
    title: mod.name,
    description: mod.description || `Download ${mod.name} from Mods Haven.`,
    path: `/mods/${canonicalSlug}`,
    image: mod.mod_image || undefined,
  });
}

export default async function Home({ params }: Props) {
  const { name } = await params;
  const decoded = decodeURIComponent(name);
  const mod = await getModBySlug(decoded) ?? await getModByName(decoded);
  if (!mod) return notFound();

  const canonicalSlug = mod.slug || encodeURIComponent(mod.name);
  const canonicalPath = `/mods/${canonicalSlug}`;
  const canonicalUrl = absoluteUrl(canonicalPath);
  const imageUrls = [mod.mod_image, ...(mod.images || [])].filter(Boolean);

  const modJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: mod.name,
    description: mod.description || `Download ${mod.name} from Mods Haven.`,
    applicationCategory: 'Game Mod',
    operatingSystem: 'Windows',
    url: canonicalUrl,
    image: imageUrls,
    datePublished: mod.date_added || undefined,
    author: mod.author
      ? {
          '@type': 'Person',
          name: mod.author,
        }
      : undefined,
  };

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: absoluteUrl('/'),
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Mods',
        item: absoluteUrl('/mods'),
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: mod.name,
        item: canonicalUrl,
      },
    ],
  };

  // Combine mod_image + images array for the gallery
  const allImages = [ ...(mod.images || [])].filter(Boolean);

  // Recommended mods (random sample excluding current)
  const recommendedMods = await getRandomMods(mod.name, 8);

  return (
    <>
      <Script
        id={`mod-jsonld-${mod._id}`}
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(modJsonLd) }}
      />
      <Script
        id={`mod-breadcrumb-jsonld-${mod._id}`}
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      
      <div className="relative z-10 justify-center m-4 sm:m-6 md:m-8 flex flex-col gap-6 md:gap-8" style={{ minHeight: '100vh', padding: '24px 0' }}>

        {/* Main Content */}
        <main className="flex-1 p-2 sm:p-4 md:p-8 justify-center items-center mt-4">
            {/* mod details section */}
          <div className="flex gap-2 md:gap-6 items-stretch  mx-auto p-3 sm:p-4 md:p-10 md:px-30 justify-center flex-col lg:flex-row md:flex-col">
             {/* mod image */}
            <div className="bg-black/50 backdrop-blur-lg w-full min-h-[300px] sm:min-h-[400px] rounded-[1rem] flex flex-col items-center">
              <ImageGallery images={allImages} alt={mod.name} />
              {/* Stats bar */}
              <div className="flex justify-center items-center gap-2  sm:gap-4 md:gap-5 py-3 mt-[0.5rem] sm:mt-[0.5rem]">
                <div className="flex flex-wrap justify-center  gap-2 sm:gap-4 bg-black/10 border-1 border-[#525252] backdrop-blur-lg rounded-[1rem] px-3 sm:px-6 py-4">
                  <p className="text-xs sm:text-sm text-[#a5a6b4] font-[900] flex gap-1 sm:gap-2 items-center">
                    <FolderArchive className="w-3 h-3 sm:w-4 sm:h-4 text-white" />{mod.downloads_size}
                  </p>
                  <p className="text-xs sm:text-sm text-[#a5a6b4] font-[900] flex gap-1 sm:gap-2 items-center">
                    <Download className="w-3 h-3 sm:w-4 sm:h-4 text-white" />{mod.downloads?.toLocaleString() || 0}
                  </p>
                  <p className="text-xs sm:text-sm text-[#a5a6b4] font-[900] flex gap-1 sm:gap-2 items-center">
                    <CalendarFold className="w-3 h-3 sm:w-4 sm:h-4 text-white" />{mod.date_added ? mod.date_added.split('T')[0] : ''}
                  </p>
                </div>
              </div>
            </div>
            {/* mod details */}
            <div className="bg-black/50 backdrop-blur-lg w-full rounded-[1rem] flex flex-col gap-3 sm:gap-5 lg:gap-7 p-3 sm:p-4 md:p-6">
              <h2 className="text-xl sm:text-2xl md:text-[2.4rem] font-[800]">
                <ShinyText text={mod.name} shineColor='#fff' color='#fff' speed={4} className="text-xl sm:text-2xl md:text-[2.4rem] font-[800]" />
              </h2>
              <hr className="text-[#525252]" />
              <p className="text-sm sm:text-base font-[900] flex align-top items-start px-1 sm:px-3">{mod.description}</p>
             <hr className="text-[#525252]"/>
              <div className="flex flex-col gap-3 sm:gap-4 px-1 sm:px-2">
                <div className="flex flex-wrap gap-2">
                  <div className="border-2 border-[#5e5e60] px-3 py-1.5 sm:p-2 rounded-[0.5rem] bg-[#363638] flex items-center justify-center gap-2">
                   <Copyright className="w-3 h-3 sm:w-4 sm:h-4" />
                    <p className="text-xs sm:text-sm md:text-base font-[700]">{mod.author}</p>
                  </div>
                    <div className="border-2 border-[#563a1a] px-3 py-1.5 sm:p-2 rounded-[0.5rem] bg-[#362a1f] flex items-center justify-center gap-2">
                  <img src={mod.game === "BeamNG.drive" ? "/icon/icon-beamng.ico" : "/icon/icon-assetto.ico"} alt={mod.game} width={24} height={24} style={{ borderRadius: 4 }} /> 
                     <p className="text-xs sm:text-sm md:text-base font-[700]">{mod.game}</p>
                  </div>
                </div>
                <div>
  <div className="border-2 border-[#265619] px-3 py-1.5 sm:p-2 rounded-[0.5rem] bg-[#22351e] flex items-center justify-center gap-2 w-fit">
                    <BadgeCheck className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />
                    <p className="text-xs sm:text-sm md:text-base font-[700]">See VirusTotal <a className="text-green-500 underline" href={mod.Virustotal_link} target="_blank">Report</a></p>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-2 px-1 sm:px-2">
                <DownloadButton modId={mod._id} adLink={mod.AD_link} />
              </div>
            </div>
          </div>
             {/* recommended mods slider */}
          <RecommendedSlider initialMods={recommendedMods} />

             {/* community card section */}
                  <div className="mt-10 sm:mt-16 w-full sm:w-[98%] gap-4 sm:gap-8 max-w-6xl p-4 sm:p-6 md:p-8 bg-black/50 backdrop-blur-lg rounded-[1rem] hover:border-[#ff6600] border-transparent border-2 transition-all duration-300 text-white flex flex-col-reverse md:flex-row items-center justify-between mx-auto">
                    <div className="max-w-xl">
                      <h2 className="text-3xl font-bold">Join Our Community</h2>
                      <p className="mt-4 font-[800]">
                        Connect with other gamers, share your mods, and get help with
                        installations. Our community is active and always welcoming new
                        members.
                      </p>
                      <div className="mt-4 font-[700]  flex items-center space-x-2">
                        <DiscordCommunityCounts />
                      </div>
                      <button className="mt-6 px-6 py-3 bg-[#5865f2] rounded-[0.75rem] font-semibold hover:bg-[#4752c4] transition">
                          <a href="https://discord.com/invite/7zPyFdYK" target="_blank" rel="noopener noreferrer">
                JOIN DISCORD
              </a>
                      </button>
                    </div>
                    <div className="mt-8 md:mt-0">
                      <Image
                          width={640}
              height={400}
              sizes="(max-width: 768px) 100vw, 384px"
                        src="https://image.modshaven.com/mods/Join%20Now%20To%20Access%20High%20Quality%20Mods!.webp"
                        alt="Community cars"
                        className="rounded-lg shadow-lg w-full max-w-sm"
                      />
                    </div>
                  </div>
        </main>
      </div>
    </>
  );
}
