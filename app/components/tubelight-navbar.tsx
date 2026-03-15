"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  Home,
  Info,
  FolderGit,
  Send,
  Mail,

  Users,
  LogOut,

  Settings,
  CloudUpload,
  LucideIcon,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useUser } from "@/hooks/useUser"

const iconMap: Record<string, LucideIcon> = {
  Home,
  Info,
  Send,
  Mail,
  FolderGit,
  CloudUpload,
  Users,
  LogOut,
  Settings

}

interface NavItem {
  name: string
  url: string
  icon: string
}

interface NavBarProps {
  className?: string
}

const guestItems: NavItem[] = [
  { name: "Home", url: "/", icon: "Home" },
  { name: "Mods", url: "/mods", icon: "FolderGit" },
  { name: "Send", url: "/send", icon: "Send" },
  { name: "About", url: "/about", icon: "Info" },
  { name: "Contact", url: "/contact", icon: "Mail" },
]

const userItems: NavItem[] = [
  { name: "Home", url: "/", icon: "Home" },
  { name: "Mods", url: "/mods", icon: "FolderGit" },
  { name: "About", url: "/about", icon: "Info" },
  { name: "Logout", url: "/user/logout", icon: "LogOut" },
]

const moderatorItems: NavItem[] = [
  { name: "Home", url: "/", icon: "Home" },
  { name: "Mods", url: "/mods", icon: "FolderGit" },
  { name: "Add Mod", url: "/mods/AddMod", icon: "CloudUpload" },
  { name: "User Management", url: "/user-management", icon: "Users" },
  { name: "Logout", url: "/user/logout", icon: "LogOut" },
]

const adminItems: NavItem[] = [
  { name: "Home", url: "/", icon: "Home" },
  { name: "Mods", url: "/mods", icon: "FolderGit" },
  { name: "Add Mod", url: "/mods/AddMod", icon: "CloudUpload" },
  { name: "Admin", url: "/admin", icon: "Settings" },
  { name: "Logout", url: "/user/logout", icon: "LogOut" },
]

export function NavBar({ className }: NavBarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { user } = useUser()

  async function handleLogout() {
    try {
      await fetch("/api/auth/logout", { method: "GET", cache: "no-store" })
    } finally {
      router.push("/user/login")
      router.refresh()
    }
  }

  const items =
    user?.role === "ADMIN"
      ? adminItems
      : user?.role === "MODERATOR"
        ? moderatorItems
        : user?.role === "USER"
          ? userItems
          : guestItems

  return (
    <div
      className={cn(
        "fixed top-1  left-1/2 -translate-x-1/2 z-50",
        className,
      )}
    >
      <div className="flex items-center w-80 sm:w-full gap-1 border-2 border-[#f44b00] backdrop-blur-lg py-2 px-2 rounded-full shadow-brand">
        {items.map((item) => {
          const Icon = iconMap[item.icon] || Home
          const isActive = item.url === pathname

          if (item.name === "Logout") {
            return (
              <button
                key={item.name}
                type="button"
                onClick={handleLogout}
                className="relative cursor-pointer text-sm font-black px-4.5 sm:px-6 py-2.5 rounded-full transition-all duration-200 text-[#fff] hover:text-[#f44b00]"
              >
                <span className="relative z-10">
                  <Icon size={20} strokeWidth={2.5} />
                </span>
              </button>
            )
          }

          return (
            <Link
              key={item.name}
              href={item.url}
              className={cn(
                "relative cursor-pointer  text-sm font-black px-4.5 sm:px-6 py-2.5 rounded-full transition-all duration-200",
                isActive 
                  ? "text-white" 
                  : "text-[#fff] hover:text-[#f44b00]",
              )}
            >
              <span className="relative z-10">
                <Icon size={20} strokeWidth={2.5} />
              </span>
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 rounded-full bg-[#f44b00] -z-0"
                  initial={false}
                  transition={{
                    type: "spring",
                    stiffness: 380,
                    damping: 30,
                  }}
                />
              )}
            </Link>
          )
        })}
      </div>
    </div>
  )
}
