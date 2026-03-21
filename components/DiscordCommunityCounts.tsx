"use client";

import { useEffect, useState } from "react";

type DiscordStats = {
  memberCount: number;
  onlineCount: number;
};

export default function DiscordCommunityCounts() {
  const [discordStats, setDiscordStats] = useState<DiscordStats | null>(null);

  useEffect(() => {
    fetch("/api/discord/stats")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => setDiscordStats(data))
      .catch(() => {});
  }, []);

  return (
    <>
      <span className="flex gap-4">
        <span className="flex">
          <span className="fixed text-green-400 animate-ping scale-125">● </span>
          <span className="fixed text-green-400 scale-125">● </span>
        </span>
        {discordStats ? `${discordStats.onlineCount.toLocaleString()} online` : "— online"}
      </span>
      <span> ● {discordStats ? `${discordStats.memberCount.toLocaleString()} members` : "— members"}</span>
    </>
  );
}
