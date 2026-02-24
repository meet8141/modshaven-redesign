"use client"

import React, { useEffect, useState } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home,   LayoutGrid,SendHorizontal,Info,FolderGit,Send,Mail, LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"


const iconMap: Record<string, LucideIcon> = {
  Home,
  LayoutGrid,
  SendHorizontal,
  Info,
  Send,
   Mail,
  FolderGit
}

interface NavItem {
  name: string
  url: string
  icon: string
}

interface NavBarProps {
  items: NavItem[]
  className?: string
}

export function NavBar({ items, className }: NavBarProps) {
  const pathname = usePathname()
  const [isMobile, setIsMobile] = useState(false)

  // Find active item based on current pathname
  const activeItem = items.find(item => item.url === pathname) || items[0]

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
    }

    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  return (
    <div
      className={cn(
        "fixed top-1 left-1/2 -translate-x-1/2 z-50",
        className,
      )}
    >
      <div className="flex items-center gap-1 border-2 border-[#f44b00] backdrop-blur-lg py-2 px-2 rounded-full shadow-brand">
        {items.map((item) => {
          const Icon = iconMap[item.icon] || Home
          const isActive = item.url === pathname

          return (
            <Link
              key={item.name}
              href={item.url}
              className={cn(
                "relative cursor-pointer text-sm font-black px-6 py-2.5 rounded-full transition-all duration-200",
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
