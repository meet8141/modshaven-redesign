"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

interface AuthUser {
  _id: string;
  email: string;
  role: "USER" | "MODERATOR" | "ADMIN";
  profileImageURL: string;
}

export function useUser() {
  const pathname = usePathname();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch("/api/auth/me", { cache: "no-store" })
      .then((res) => res.json())
      .then((data: { user: AuthUser | null }) => {
        setUser(data.user);
      })
      .catch(() => {
        setUser(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [pathname]);

  return { user, loading };
}
