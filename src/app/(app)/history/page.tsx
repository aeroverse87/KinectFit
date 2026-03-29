"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useUser } from "@/contexts/UserContext";
import { getHistoryRange, getMealLogs } from "@/lib/firebase/firestore";
import NutritionChart from "@/components/NutritionChart";
import type { DailySummary, MealLog } from "@/types";

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

// Derive a summary from meal logs when no explicit dailySummary exists
function deriveSummaryFromLogs(
  date: string,
  logs: MealLog[],
  calorieTarget: number,
  proteinTarget: number
): DailySummary {
  const totalCalories = logs.reduce((s, l) => s + l.totalCalories, 0);
  const totalProtein = logs.reduce((s, l) => s + l.totalProtein, 0);
  const calPct = totalCalories / calorieTarget;
  const proPct = totalProtein / proteinTarget;
  const avg = (calPct + proPct) / 2;

  let status: "goal_met" | "partial" | "missed" = "missed";
  if (avg >= 0.85) status = "goal_met";
  else if (avg >= 0.5) status = "partial";

  return {
    date,
    totalCalories,
    totalProtein,
    totalFats: 0,
    totalCarbs: 0,
    targetCalories: calorieTarget,
    targetProtein: proteinTarget,
    status,
    meals: logs,
  };
}

export default function HistoryPage() {
  const { user } = useAuth();
  const { profile } = useUser();
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [summaries, setSummaries] = useState<Map<string, DailySummary>>(new Map());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedDetail, setSelectedDetail] = useState<DailySummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);

  const calorieTarget = profile?.calorieTarget || 2000;
  const proteinTarget = profile?.proteinTarget || 150;

  const loadHistory = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const startDate = formatDate(year, month, 1);
      const endDate = formatDate(year, month, getDaysInMonth(year, month));
      const data = await getHistoryRange(user.uid, startDate, endDate);
      const map = new Map<string, DailySummary>();
      data.forEach((s) => map.set(s.date, s));

      // Also check mealLogs for each day in the month to find days with logs but no summary
      const daysInMonth = getDaysInMonth(year, month);
      for (let d = 1; d <= daysInMonth; d++) {
        const date = formatDate(year, month, d);
        if (!map.has(date) && date <= formatDate(now.getFullYear(), now.getMonth(), now.getDate())) {
          try {
            const logs = await getMealLogs(user.uid, date);
            if (logs.length > 0) {
              map.set(date, deriveSummaryFromLogs(date, logs, calorieTarget, proteinTarget));
            }
          } catch {
            // Silently skip dates that fail
          }
        }
      }

      setSummaries(map);
    } catch (e) {
      console.error("Error loading history:", e);
    } finally {
      setLoading(false);
    }
  }, [user, year, month, calorieTarget, proteinTarget]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  // Load detail for selected date
  const handleSelectDate = async (date: string) => {
    if (date === selectedDate) {
      setSelectedDate(null);
      setSelectedDetail(null);
      return;
    }
    setSelectedDate(date);

    // Check if we already have a summary
    const existing = summaries.get(date);
    if (existing) {
      setSelectedDetail(existing);
      return;
    }

    // Try to load from mealLogs directly
    if (!user) return;
    setDetailLoading(true);
    try {
      const logs = await getMealLogs(user.uid, date);
      if (logs.length > 0) {
        const derived = deriveSummaryFromLogs(date, logs, calorieTarget, proteinTarget);
        setSelectedDetail(derived);
      } else {
        setSelectedDetail(null);
      }
    } catch {
      setSelectedDetail(null);
    } finally {
      setDetailLoading(false);
    }
  };

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
      if (date < today) return "";
      return "";
    }
    if (summary.status === "goal_met") return "bg-primary/20 text-primary";
    if (summary.status === "partial") return "bg-warning/20 text-warning";
    return "bg-error/20 text-error";
  };

  const getStatusIcon = (date: string) => {
    const summary = summaries.get(date);
    if (!summary) {
      if (date < today) return "—";
      return "";
    }
    if (summary.status === "goal_met") return "✅";
    if (summary.status === "partial") return "⚠️";
    return "❌";
  };

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
            const hasSummary = summaries.has(date);

            return (
              <button
                key={day}
                onClick={() => handleSelectDate(date)}
                className={`
                  aspect-square rounded-xl flex items-center justify-center text-xs font-semibold no-select transition-all relative
                  ${isToday ? "ring-1 ring-primary" : ""}
                  ${isSelected ? "bg-primary text-surface" : statusColor || "text-on-surface-variant hover:bg-surface-container"}
                `}
              >
                {day}
                {hasSummary && !isSelected && (
                  <div className="absolute bottom-0.5 w-1 h-1 rounded-full bg-primary" />
                )}
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
          <div className="w-1 h-1 rounded-full bg-primary" />
          <span className="text-[10px] text-on-surface-variant">Has Logs</span>
        </div>
      </div>

      {/* Nutrition Progress Chart */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="mb-6"
      >
        <NutritionChart
          summaries={summaries}
          year={year}
          month={month}
          calorieTarget={calorieTarget}
          proteinTarget={proteinTarget}
        />
      </motion.div>

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

          {detailLoading ? (
            <div className="flex justify-center py-4">
              <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : selectedDetail ? (
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-xs text-on-surface-variant">Calories</span>
                <span className="text-xs font-semibold text-on-surface">
                  {selectedDetail.totalCalories} / {selectedDetail.targetCalories} kcal
                </span>
              </div>
              <div className="h-1.5 rounded-full bg-surface-container-highest overflow-hidden">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{
                    width: `${Math.min((selectedDetail.totalCalories / selectedDetail.targetCalories) * 100, 100)}%`,
                  }}
                />
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-on-surface-variant">Protein</span>
                <span className="text-xs font-semibold text-on-surface">
                  {selectedDetail.totalProtein} / {selectedDetail.targetProtein}g
                </span>
              </div>
              <div className="h-1.5 rounded-full bg-surface-container-highest overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    background: "#c57eff",
                    width: `${Math.min((selectedDetail.totalProtein / selectedDetail.targetProtein) * 100, 100)}%`,
                  }}
                />
              </div>

              {/* Meals breakdown */}
              {selectedDetail.meals && selectedDetail.meals.length > 0 && (
                <div className="mt-3 pt-3 border-t border-surface-container-highest">
                  <p className="label-editorial mb-2">LOGGED MEALS</p>
                  {selectedDetail.meals.map((log, i) => (
                    <div key={i} className="flex justify-between py-1.5">
                      <span className="text-xs text-on-surface capitalize">
                        {log.mealType.replace("_", " ")}
                      </span>
                      <span className="text-xs text-on-surface-variant">
                        {log.totalCalories} kcal • {log.totalProtein}g P
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {selectedDetail.aiSummary && (
                <p className="text-xs text-on-surface-variant leading-relaxed mt-2 italic">
                  {selectedDetail.aiSummary}
                </p>
              )}
            </div>
          ) : (
            <p className="text-xs text-on-surface-variant">
              {selectedDate < today ? "No meals logged for this day." : "Upcoming day."}
            </p>
          )}
        </motion.div>
      )}
    </div>
  );
}
