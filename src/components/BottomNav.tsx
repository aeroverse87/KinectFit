"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Home, PlusCircle, BookOpen, CalendarDays } from "lucide-react";
import { motion } from "framer-motion";

const navItems = [
  { href: "/dashboard", label: "HOME", icon: Home },
  { href: "/log", label: "ADD", icon: PlusCircle },
  { href: "/library", label: "LIBRARY", icon: BookOpen },
  { href: "/history", label: "HISTORY", icon: CalendarDays },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass-nav safe-bottom">
      <div className="max-w-md mx-auto flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="no-select flex flex-col items-center gap-1 px-4 py-1 relative"
            >
              {isActive && (
                <motion.div
                  layoutId="nav-indicator"
                  className="absolute inset-0 rounded-xl bg-primary/10"
                  transition={{ type: "spring", duration: 0.5, bounce: 0.15 }}
                />
              )}
              <Icon
                size={20}
                className={
                  isActive ? "text-primary relative z-10" : "text-on-surface-variant relative z-10"
                }
              />
              <span
                className={`text-[10px] font-bold tracking-widest relative z-10 ${
                  isActive ? "text-primary" : "text-on-surface-variant"
                }`}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
