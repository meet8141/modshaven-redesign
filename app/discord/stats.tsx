"use client"
import { span } from 'motion/react-client';
import React, { useEffect, useState } from 'react';

interface DiscordStats {
  memberCount: number;
  onlineCount: number;
}

async function fetchDiscordStats(): Promise<DiscordStats> {
  const res = await fetch('/api/discord/stats');
  if (!res.ok) return { memberCount: 0, onlineCount: 0 };
  return await res.json();
}

const DiscordStatsComponent: React.FC = () => {
  const [stats, setStats] = useState<DiscordStats>({ memberCount: 0, onlineCount: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDiscordStats().then((data) => {
      setStats(data);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className='text-gray-100'>Loading Discord stats...</div>;

  return (
     <>
      <span className="text-gray-300 flex items-center gap-2 "><span className='bg-green-500 fixed rounded-full w-3 h-3 inline-block ' > </span><span className='bg-green-500 fixed rounded-full w-3 h-3 inline-block animate-ping ' > </span><p className='ml-5 '>{stats.onlineCount.toLocaleString()} Online </p></span>
      <span className="text-gray-300 flex items-center gap-2 "><span className='bg-gray-100 fixed rounded-full w-3 h-3 inline-block ' > </span><p className='ml-5 '>{stats.memberCount.toLocaleString()} Members</p></span>
     </>
  );
};

export default DiscordStatsComponent;
