"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Utensils, TrendingDown, Zap, Clock, Target, X } from "lucide-react";
import type { DailyPlan, MealLog, UserProfile } from "@/types";

interface Notification {
  id: string;
  icon: React.ReactNode;
  title: string;
  message: string;
  type: "warning" | "info" | "success";
  action?: string;
}

interface NotificationBellProps {
  plan: DailyPlan | null;
  logs: MealLog[];
  profile: UserProfile | null;
}

function generateNotifications(
  plan: DailyPlan | null,
  logs: MealLog[],
  profile: UserProfile | null
): Notification[] {
  const notifs: Notification[] = [];
  if (!profile) return notifs;

  const now = new Date();
  const hour = now.getHours();
  const consumed = logs.reduce((s, l) => s + l.totalCalories, 0);
  const proteinConsumed = logs.reduce((s, l) => s + l.totalProtein, 0);
  const calorieTarget = profile.calorieTarget || 2000;
  const proteinTarget = profile.proteinTarget || 150;
  const calPct = consumed / calorieTarget;
  const proPct = proteinConsumed / proteinTarget;
  const loggedMealTypes = new Set(logs.map((l) => l.mealType));

  // No plan created
  if (!plan) {
    notifs.push({
      id: "no-plan",
      icon: <Zap size={14} className="text-primary" />,
      title: "No meal plan today",
      message: "Create an AI meal plan to stay on track.",
      type: "warning",
      action: "/food-selection",
    });
  }

  // Morning: haven't logged breakfast
  if (hour >= 8 && hour < 12 && !loggedMealTypes.has("breakfast")) {
    notifs.push({
      id: "breakfast",
      icon: <Utensils size={14} className="text-warning" />,
      title: "Breakfast not logged",
      message: "Start your day right — log your breakfast.",
      type: "warning",
    });
  }

  // Afternoon: haven't logged lunch
  if (hour >= 13 && hour < 17 && !loggedMealTypes.has("lunch")) {
    notifs.push({
      id: "lunch",
      icon: <Clock size={14} className="text-warning" />,
      title: "Lunch not logged yet",
      message: "It's past 1 PM. Don't forget to log lunch.",
      type: "warning",
    });
  }

  // Evening: behind on calories
  if (hour >= 17 && calPct < 0.5) {
    const remaining = Math.round(calorieTarget - consumed);
    notifs.push({
      id: "cal-behind",
      icon: <TrendingDown size={14} className="text-error" />,
      title: `${remaining} kcal remaining`,
      message: "You're behind on calories. Focus on nutrient-dense foods for dinner.",
      type: "warning",
    });
  }

  // Protein behind at any point after noon
  if (hour >= 12 && proPct < 0.3) {
    notifs.push({
      id: "protein-low",
      icon: <Target size={14} className="text-secondary" />,
      title: "Protein intake is low",
      message: `Only ${Math.round(proteinConsumed)}g of ${proteinTarget}g target. Add protein-rich foods.`,
      type: "warning",
    });
  }

  // All caught up
  if (hour >= 12 && calPct >= 0.7 && proPct >= 0.6) {
    notifs.push({
      id: "on-track",
      icon: <Zap size={14} className="text-primary" />,
      title: "You're on track! 🎯",
      message: `${Math.round(calPct * 100)}% calories, ${Math.round(proPct * 100)}% protein. Keep it up!`,
      type: "success",
    });
  }

  // Late night: haven't logged dinner
  if (hour >= 20 && !loggedMealTypes.has("dinner")) {
    notifs.push({
      id: "dinner",
      icon: <Utensils size={14} className="text-warning" />,
      title: "Dinner not logged",
      message: "Log your dinner before the day ends.",
      type: "warning",
    });
  }

  return notifs;
}

export default function NotificationBell({ plan, logs, profile }: NotificationBellProps) {
  const [open, setOpen] = useState(false);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const ref = useRef<HTMLDivElement>(null);

  const allNotifs = generateNotifications(plan, logs, profile);
  const notifs = allNotifs.filter((n) => !dismissed.has(n.id));

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const typeColors = {
    warning: "bg-warning/10",
    info: "bg-primary/10",
    success: "bg-primary/10",
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="w-9 h-9 rounded-full bg-surface-container flex items-center justify-center relative"
      >
        <Bell size={16} className="text-on-surface-variant" />
        {notifs.length > 0 && (
          <div className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-primary flex items-center justify-center">
            <span className="text-[9px] font-bold text-surface">{notifs.length}</span>
          </div>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute top-12 right-0 w-72 rounded-2xl bg-surface-container border border-surface-container-highest shadow-2xl z-50 overflow-hidden"
          >
            <div className="px-4 py-3 border-b border-surface-container-highest">
              <p className="text-xs font-bold tracking-widest text-on-surface-variant">NOTIFICATIONS</p>
            </div>

            {notifs.length === 0 ? (
              <div className="px-4 py-6 text-center">
                <p className="text-xs text-on-surface-variant">All caught up! 🎉</p>
              </div>
            ) : (
              <div className="max-h-72 overflow-y-auto">
                {notifs.map((n) => (
                  <div
                    key={n.id}
                    className={`px-4 py-3 border-b border-surface-container-highest/50 ${typeColors[n.type]} flex gap-3 items-start`}
                  >
                    <div className="w-7 h-7 rounded-lg bg-surface-container-highest flex items-center justify-center shrink-0 mt-0.5">
                      {n.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-on-surface">{n.title}</p>
                      <p className="text-[10px] text-on-surface-variant leading-relaxed mt-0.5">{n.message}</p>
                    </div>
                    <button
                      onClick={() => setDismissed((prev) => new Set([...prev, n.id]))}
                      className="shrink-0 mt-0.5"
                    >
                      <X size={12} className="text-on-surface-variant" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
