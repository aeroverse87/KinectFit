"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { getHistoryRange } from "@/lib/firebase/firestore";
import type { DailySummary } from "@/types";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

function formatDate(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export default function HistoryPage() {
  const { user } = useAuth();
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [summaries, setSummaries] = useState<Map<string, DailySummary>>(new Map());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const loadHistory = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const startDate = formatDate(year, month, 1);
      const endDate = formatDate(year, month, getDaysInMonth(year, month));
      const data = await getHistoryRange(user.uid, startDate, endDate);
      const map = new Map<string, DailySummary>();
      data.forEach((s) => map.set(s.date, s));
      setSummaries(map);
    } catch (e) {
      console.error("Error loading history:", e);
    } finally {
      setLoading(false);
    }
  }, [user, year, month]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const prevMonth = () => {
    if (month === 0) {
      setMonth(11);
      setYear(year - 1);
    } else setMonth(month - 1);
  };

  const nextMonth = () => {
    if (month === 11) {
      setMonth(0);
      setYear(year + 1);
    } else setMonth(month + 1);
  };

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const today = formatDate(now.getFullYear(), now.getMonth(), now.getDate());

  const getStatusColor = (date: string) => {
    const summary = summaries.get(date);
    if (!summary) {
      // If the date is in the past, it's missed
      if (date < today) return "bg-error/20 text-error";
      return "";
    }
    if (summary.status === "goal_met") return "bg-primary/20 text-primary";
    if (summary.status === "partial") return "bg-warning/20 text-warning";
    return "bg-error/20 text-error";
  };

  const getStatusIcon = (date: string) => {
    const summary = summaries.get(date);
    if (!summary) {
      if (date < today) return "❌";
      return "";
    }
    if (summary.status === "goal_met") return "✅";
    if (summary.status === "partial") return "⚠️";
    return "❌";
  };

  const selected = selectedDate ? summaries.get(selectedDate) : null;

  return (
    <div className="px-5 pt-4 pb-6 max-w-md mx-auto">
      <motion.h1
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-2xl font-display font-extrabold tracking-tight mb-5"
      >
        Your <span className="text-primary">History</span>
      </motion.h1>

      {/* Month Navigation */}
      <div className="flex items-center justify-between mb-4">
        <button onClick={prevMonth} className="w-9 h-9 rounded-full bg-surface-container flex items-center justify-center">
          <ChevronLeft size={18} className="text-on-surface-variant" />
        </button>
        <h2 className="text-lg font-display font-bold">
          {MONTHS[month]} {year}
        </h2>
        <button onClick={nextMonth} className="w-9 h-9 rounded-full bg-surface-container flex items-center justify-center">
          <ChevronRight size={18} className="text-on-surface-variant" />
        </button>
      </div>

      {/* Calendar */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl bg-surface-container-low p-4 mb-6"
      >
        {/* Day headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {DAYS.map((d) => (
            <div key={d} className="text-center text-[10px] font-bold tracking-widest text-on-surface-variant uppercase">
              {d}
            </div>
          ))}
        </div>

        {/* Days */}
        <div className="grid grid-cols-7 gap-1">
          {/* Empty cells for offset */}
          {Array.from({ length: firstDay }).map((_, i) => (
            <div key={`empty-${i}`} />
          ))}

          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const date = formatDate(year, month, day);
            const isToday = date === today;
            const isSelected = date === selectedDate;
            const statusColor = getStatusColor(date);

            return (
              <button
                key={day}
                onClick={() => setSelectedDate(isSelected ? null : date)}
                className={`
                  aspect-square rounded-xl flex items-center justify-center text-xs font-semibold no-select transition-all
                  ${isToday ? "ring-1 ring-primary" : ""}
                  ${isSelected ? "bg-primary text-surface" : statusColor || "text-on-surface-variant hover:bg-surface-container"}
                `}
              >
                {day}
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 mb-6">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-primary/20" />
          <span className="text-[10px] text-on-surface-variant">Goal Met</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-warning/20" />
          <span className="text-[10px] text-on-surface-variant">Partial</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-error/20" />
          <span className="text-[10px] text-on-surface-variant">Missed</span>
        </div>
      </div>

      {/* Selected Day Detail */}
      {selectedDate && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl bg-surface-container-low p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-display font-bold">
              {new Date(selectedDate + "T12:00:00").toLocaleDateString("en-US", {
                weekday: "long",
                month: "short",
                day: "numeric",
              })}
            </h3>
            <span className="text-lg">{getStatusIcon(selectedDate)}</span>
          </div>

          {selected ? (
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-xs text-on-surface-variant">Calories</span>
                <span className="text-xs font-semibold text-on-surface">
                  {selected.totalCalories} / {selected.targetCalories} kcal
                </span>
              </div>
              <div className="h-1.5 rounded-full bg-surface-container-highest overflow-hidden">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{
                    width: `${Math.min((selected.totalCalories / selected.targetCalories) * 100, 100)}%`,
                  }}
                />
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-on-surface-variant">Protein</span>
                <span className="text-xs font-semibold text-on-surface">
                  {selected.totalProtein} / {selected.targetProtein}g
                </span>
              </div>
              <div className="h-1.5 rounded-full bg-surface-container-highest overflow-hidden">
                <div
                  className="h-full rounded-full bg-secondary transition-all"
                  style={{
                    width: `${Math.min((selected.totalProtein / selected.targetProtein) * 100, 100)}%`,
                  }}
                />
              </div>
              {selected.aiSummary && (
                <p className="text-xs text-on-surface-variant leading-relaxed mt-2 italic">
                  {selected.aiSummary}
                </p>
              )}
            </div>
          ) : (
            <p className="text-xs text-on-surface-variant">
              {selectedDate < today ? "No data logged for this day." : "Upcoming day."}
            </p>
          )}
        </motion.div>
      )}
    </div>
  );
}
