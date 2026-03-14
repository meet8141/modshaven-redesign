'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, SlidersHorizontal, X, ListFilterPlus, ChevronDown, Check } from 'lucide-react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import BrandIcon from './BrandIcon';

const MOD_TYPES = ['all', 'car', 'truck', 'maps'];

const BRANDS = [
  'all','Aston Martin','Audi','BMW','Bugatti','Chevrolet','Dodge','Ferrari',
  'Ford','Honda','Infiniti','Kia','Lamborghini','Land Rover','Lexus',
  'Lotus','Mazda','McLaren','Mercedes','Mitsubishi','Nissan','Pagani',
  'Peugeot','Porsche','Renault','Subaru','Toyota','Volkswagen','Volvo','Skoda',
];

const SORT_OPTIONS = [
  { value: 'latest',    label: 'Latest' },
  { value: 'oldest',    label: 'Oldest' },
  { value: 'downloads', label: 'Most Downloaded' },
  { value: 'featured',  label: 'Featured' },
];

export default function SearchFilterBar() {
  const router       = useRouter();
  const searchParams = useSearchParams();

  const [filterOpen, setFilterOpen] = useState(false);
  const [brandOpen,  setBrandOpen]  = useState(false);
  const brandRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (brandRef.current && !brandRef.current.contains(e.target as Node)) {
        setBrandOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  const [search,   setSearch]   = useState(searchParams.get('search') || '');
  const [modType,  setModType]  = useState(searchParams.get('type')   || 'all');
  const [brand,    setBrand]    = useState(searchParams.get('brand')  || 'all');
  const [game,     setGame]     = useState(searchParams.get('game')   || 'all');
  const [sort,     setSort]     = useState(searchParams.get('sort')   || 'latest');

  /* keep local state in sync when browsing back/forward */
  useEffect(() => {
    setSearch(searchParams.get('search') || '');
    setModType(searchParams.get('type')   || 'all');
    setBrand(searchParams.get('brand')  || 'all');
    setGame(searchParams.get('game')   || 'all');
    setSort(searchParams.get('sort')   || 'latest');
  }, [searchParams]);

  const activeFilterCount = [
    modType !== 'all',
    brand   !== 'all',
    game    !== 'all',
    sort    !== 'latest',
  ].filter(Boolean).length;

  const buildParams = (overrides: Record<string, string> = {}) => {
    const p: Record<string, string> = {
      ...(search  ? { search  } : {}),
      ...(modType !== 'all' ? { type:  modType  } : {}),
      ...(brand   !== 'all' ? { brand             } : {}),
      ...(game    !== 'all' ? { game              } : {}),
      ...(sort    !== 'latest' ? { sort           } : {}),
      ...overrides,
    };
    return new URLSearchParams(p).toString();
  };

  const handleApply = () => {
    const qs = buildParams();
    router.push(`/mods${qs ? `?${qs}` : ''}`);
    setFilterOpen(false);
  };

  const handleClear = () => {
    setSearch(''); setModType('all'); setBrand('all');
    setGame('all'); setSort('latest');
    router.push('/mods');
    setFilterOpen(false);
  };

  const handleSearchKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleApply();
  };

  return (
    <div className="w-full mb-8">

      {/* ── Row: search input + filter button ── */}
      <div className="flex items-center gap-3">

        {/* Search input */}
        <div className="relative flex-1 max-w-lg">
          <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#ff6600] z-10" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={handleSearchKey}
            placeholder="Search mods…"
            className="w-full pl-12 pr-4 py-3 rounded-[0.75rem] bg-black/40 backdrop-blur-lg
                       border-2 border-white/10 focus:border-[#ff6600]
                       text-white placeholder:text-white/30 outline-none transition-colors text-[0.95rem]"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filter toggle button */}
        <button
          onClick={() => setFilterOpen(v => !v)}
          className={`relative flex items-center gap-2 px-5 py-3 rounded-[0.75rem]
                      border-2 font-bold text-sm transition-all duration-200
                      ${filterOpen
                        ? 'bg-[#ff6600] border-[#ff6600] text-white shadow-[0_0_18px_#ff660055]'
                        : 'bg-black/40 backdrop-blur-lg border-white/10 text-white hover:border-[#ff6600]'
                      }`}
        >
          <SlidersHorizontal className="w-5 h-5" />
          <span className="hidden sm:inline">Filters</span>
          {activeFilterCount > 0 && (
            <span className="absolute -top-2 -right-2 w-5 h-5 flex items-center justify-center
                             rounded-full bg-white text-[#ff6600] text-[11px] font-black">
              {activeFilterCount}
            </span>
          )}
        </button>

        {/* Search / Go button */}
        <button
          onClick={handleApply}
          className="flex items-center gap-2 px-5 py-3 rounded-[0.75rem]
                     border-2 border-[#ff6600] bg-[#ff6600] text-white font-bold text-sm
                     hover:bg-[#e65c00] hover:border-[#e65c00] transition-all duration-200"
        >
          <ListFilterPlus className="w-5 h-5" />
          <span className="hidden sm:inline">Apply</span>
        </button>

        {/* Clear button — only visible when something is active */}
        {(search || activeFilterCount > 0) && (
          <button
            onClick={handleClear}
            className="flex items-center gap-2 px-5 py-3 rounded-[0.75rem]
                       border-2 border-white/20 bg-black/40 backdrop-blur-lg text-white/60 font-bold text-sm
                       hover:border-white/50 hover:text-white transition-all duration-200"
          >
            <X className="w-4 h-4" />
            <span className="hidden sm:inline">Clear</span>
          </button>
        )}
      </div>

      {/* ── Collapsible filter panel ── */}
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out
                    ${filterOpen ? 'max-h-[750px] opacity-100 mt-4' : 'max-h-0 opacity-0'}`}
      >
        <div className="bg-black/50 backdrop-blur-xl border-2 border-[#ff6600]/60 rounded-[1rem] p-6">

          <div className="flex items-center justify-between mb-5">
            <span className="font-bold text-[#ff6600] text-base flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4" /> Filter Options
            </span>
            <button onClick={() => setFilterOpen(false)} className="text-white/40 hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">

            {/* Type of Mod */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold uppercase tracking-widest text-white/50">Mod Type</label>
              <div className="flex flex-wrap gap-2">
                {MOD_TYPES.map(t => (
                  <button
                    key={t}
                    onClick={() => setModType(t)}
                    className={`capitalize px-3 py-1.5 rounded-[0.5rem] text-sm font-semibold border transition-all
                                ${modType === t
                                  ? 'bg-[#ff6600] border-[#ff6600] text-white'
                                  : 'bg-white/5 border-white/10 text-white/70 hover:border-[#ff6600] hover:text-white'
                                }`}
                  >
                    {t === 'all' ? 'All' : t}
                  </button>
                ))}
              </div>
            </div>

            {/* Car Brand – custom dropdown */}
            <div className="flex flex-col gap-2" ref={brandRef}>
              <label className="text-xs font-bold uppercase tracking-widest text-white/50">Brand</label>
              <div className="relative">
                {/* trigger */}
                <button
                  type="button"
                  onClick={() => setBrandOpen(v => !v)}
                  className={`w-full flex items-center justify-between gap-2 px-3 py-2.5
                              rounded-[0.6rem] text-sm font-semibold border-2 transition-all
                                text-white
                              ${brandOpen ? 'border-[#ff6600] shadow-[0_0_10px_#ff660033]' : 'border-white/10 hover:border-[#ff6600]/60'}`}
                >
                  <span className="flex items-center gap-2">
                    {brand !== 'all' && (
                      <BrandIcon brand={brand} width={18} height={18} />
                    )}
                    {brand === 'all' ? 'All Brands' : brand}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-[#ff6600] transition-transform duration-200 ${brandOpen ? 'rotate-180' : ''}`}
                  />
                </button>

                {/* dropdown list */}
                {brandOpen && (
                  <div className="scrollbar-themed absolute z-50 mt-1 w-full max-h-56 overflow-y-auto
                                  rounded-[0.75rem] bg-black/80 backdrop-blur-lg  border-2 border-[#ff6600]/60
                                   shadow-[0_8px_32px_#ff660022]">
                    {BRANDS.map(b => {
                      const val   = b === 'all' ? 'all' : b;
                      const label = b === 'all' ? 'All Brands' : b;
                      const active = brand === val;
                      return (
                        <button
                          key={b}
                          type="button"
                          onClick={() => { setBrand(val); setBrandOpen(false); }}
                          className={`w-full flex items-center justify-between px-4 py-2.5 text-sm
                                      transition-all duration-150 first:rounded-t-[0.65rem] last:rounded-b-[0.65rem]
                                      ${ active
                                          ? 'bg-[#ff6600] text-white font-bold'
                                          : 'text-white/75 hover:bg-[#ff6600]/15 hover:text-white font-medium'
                                      }`}
                        >
                          <span className="flex items-center gap-2.5">
                            {val !== 'all' && (
                              <span className="shrink-0">
                                <BrandIcon brand={val} width={18} height={18} />
                              </span>
                            )}
                            {label}
                          </span>
                          {active && <Check className="w-3.5 h-3.5 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Game */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold uppercase tracking-widest text-white/50">Game</label>
              <div className="flex flex-col gap-2">
                {[
                  { value: 'all',           label: 'All Games',     icon: null },
                  { value: 'BeamNG.drive',  label: 'BeamNG.drive',  icon: '/icon/icon-beamng.ico' },
                  { value: 'Assetto Corsa', label: 'Assetto Corsa', icon: '/icon/icon-assetto.ico' },
                ].map(g => (
                  <label
                    key={g.value}
                    className={`flex items-center gap-3 px-3 py-2 rounded-[0.6rem] cursor-pointer border transition-all
                                ${game === g.value
                                  ? 'border-[#ff6600] bg-[#ff6600]/10'
                                  : 'border-white/10 hover:border-[#ff6600]/50'
                                }`}
                  >
                    <input
                      type="radio"
                      name="game"
                      value={g.value}
                      checked={game === g.value}
                      onChange={() => setGame(g.value)}
                      className="accent-[#ff6600]"
                    />
                    {g.icon && <Image src={g.icon} alt={g.label} width={20} height={20} style={{ borderRadius: 3 }} />}
                    <span className="text-sm font-medium text-white/80">{g.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Sort By */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold uppercase tracking-widest text-white/50">Sort By</label>
              <div className="flex flex-col gap-2">
                {SORT_OPTIONS.map(s => (
                  <button
                    key={s.value}
                    onClick={() => setSort(s.value)}
                    className={`text-left px-3 py-2 rounded-[0.6rem] text-sm font-semibold border transition-all
                                ${sort === s.value
                                  ? 'bg-[#ff6600] border-[#ff6600] text-white'
                                  : 'bg-white/5 border-white/10 text-white/70 hover:border-[#ff6600] hover:text-white'
                                }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-between mt-6 pt-5 border-t border-white/10">
            <button
              onClick={handleClear}
              className="flex items-center gap-2 px-4 py-2 rounded-[0.6rem] border-2 border-white/20
                         text-white/60 font-semibold text-sm hover:border-white/50 hover:text-white transition-all"
            >
              <X className="w-4 h-4" /> Clear All
            </button>
            <button
              onClick={handleApply}
              className="flex items-center gap-2 px-6 py-2.5 rounded-[0.75rem] bg-[#ff6600] border-2 border-[#ff6600]
                         text-white font-bold text-sm hover:bg-[#e65c00] hover:border-[#e65c00] transition-all
                         shadow-[0_0_18px_#ff660044]"
            >
              <ListFilterPlus className="w-4 h-4" /> Apply Filters
            </button>
          </div>

        </div>
      </div>

    </div>
  );
}
