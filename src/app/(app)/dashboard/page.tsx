"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { User } from "lucide-react";
import { useRouter } from "next/navigation";
import ProgressRing from "@/components/ProgressRing";
import CoachInsight from "@/components/CoachInsight";
import NotificationBell from "@/components/NotificationBell";
import { useAuth } from "@/contexts/AuthContext";
import { useUser } from "@/contexts/UserContext";
import { getDailyPlan, getMealLogs } from "@/lib/firebase/firestore";
import type { DailyPlan, MealLog } from "@/types";

import { getToday } from "@/lib/utils/date";

export default function DashboardPage() {
  const { user } = useAuth();
  const { profile } = useUser();
  const router = useRouter();
  const [plan, setPlan] = useState<DailyPlan | null>(null);
  const [logs, setLogs] = useState<MealLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [streak, setStreak] = useState(0);

  const loadData = useCallback(async () => {
    if (!user) return;
    try {
      const today = getToday();
      const [p, l] = await Promise.all([
        getDailyPlan(user.uid, today),
        getMealLogs(user.uid, today),
      ]);
      setPlan(p);
      setLogs(l);
    } catch (e) {
      console.error("Error loading dashboard:", e);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (!profile && !loading) {
      router.replace("/onboarding");
    }
  }, [profile, loading, router]);

  const calorieTarget = profile?.calorieTarget || 2000;
  const proteinTarget = profile?.proteinTarget || 150;
  const consumed = logs.reduce((s, l) => s + l.totalCalories, 0);
  const proteinConsumed = logs.reduce((s, l) => s + l.totalProtein, 0);
  const remaining = Math.max(0, calorieTarget - consumed);

  const nextMeal = plan?.meals?.find((m) => !m.completed);

  // Calculate streak: count consecutive days (going backwards) with at least 1 meal log
  useEffect(() => {
    if (!user) return;
    const calcStreak = async () => {
      let count = 0;
      const d = new Date();
      d.setDate(d.getDate() - 1); // start from yesterday
      for (let i = 0; i < 60; i++) {
        const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
        try {
          const dayLogs = await getMealLogs(user.uid, dateStr);
          if (dayLogs.length > 0) count++;
          else break;
        } catch { break; }
        d.setDate(d.getDate() - 1);
      }
      // If today also has logs, add it
      if (logs.length > 0) count++;
      setStreak(count);
    };
    calcStreak();
  }, [user, logs.length]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="px-5 pt-4 pb-6 max-w-md mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-6"
      >
        <h1 className="text-2xl font-display font-extrabold tracking-tight text-primary">
          Ethereal Coach
        </h1>
        <div className="flex items-center gap-3">
          <NotificationBell plan={plan} logs={logs} profile={profile} />
          <button
            onClick={() => router.push("/profile")}
            className="w-9 h-9 rounded-full bg-surface-container flex items-center justify-center"
          >
            <User size={16} className="text-on-surface-variant" />
          </button>
        </div>
      </motion.div>

      {/* Progress Rings Section */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="bg-surface-container-low rounded-3xl p-6 mb-6"
      >
        <div className="flex items-center justify-center gap-6">
          {/* Calorie Ring */}
          <div className="flex flex-col items-center">
            <ProgressRing
              value={consumed}
              max={calorieTarget}
              size={150}
              strokeWidth={12}
              sublabel="KCAL"
            />
            <p className="text-[10px] font-bold tracking-widest text-on-surface-variant mt-2">CALORIES</p>
          </div>

          {/* Protein Ring */}
          <div className="flex flex-col items-center">
            <ProgressRing
              value={proteinConsumed}
              max={proteinTarget}
              size={150}
              strokeWidth={12}
              color="#c57eff"
              sublabel="GRAMS"
            />
            <p className="text-[10px] font-bold tracking-widest text-on-surface-variant mt-2">PROTEIN</p>
          </div>
        </div>

        {/* Macro Summary Pills */}
        <div className="flex justify-center gap-3 mt-4">
          <div className="px-3 py-1.5 rounded-full bg-surface-container flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-primary" />
            <span className="text-[10px] font-semibold text-on-surface-variant">
              {remaining} kcal left
            </span>
          </div>
          <div className="px-3 py-1.5 rounded-full bg-surface-container flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full" style={{ background: "#c57eff" }} />
            <span className="text-[10px] font-semibold text-on-surface-variant">
              {Math.max(0, proteinTarget - proteinConsumed)}g left
            </span>
          </div>
        </div>
      </motion.div>

      {/* Stats Row */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-2 gap-3 mb-8"
      >
        <div className="p-4 rounded-2xl bg-surface-container-low">
          <p className="label-editorial mb-1">WEIGHT</p>
          <p className="text-2xl font-display font-extrabold">
            {profile?.weight || "—"}
            <span className="text-sm font-normal text-on-surface-variant ml-1">kg</span>
          </p>
        </div>
        <div className="p-4 rounded-2xl bg-surface-container-low">
          <p className="label-editorial mb-1">STREAK</p>
          <p className="text-2xl font-display font-extrabold">
            {streak}
            <span className="text-sm font-normal text-on-surface-variant ml-1">days</span>
          </p>
        </div>
      </motion.div>

      {/* Next Meal */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mb-6"
      >
        <div className="flex items-baseline justify-between mb-3">
          <h2 className="text-xl font-display font-bold">Next Meal</h2>
          <span className="text-sm text-primary font-medium">
            {nextMeal?.time || "—"}
          </span>
        </div>

        {nextMeal ? (
          <button
            onClick={() => router.push("/meal-plan")}
            className="w-full rounded-2xl bg-surface-container-low overflow-hidden text-left"
          >
            {/* Meal Type Header */}
            <div className="px-4 pt-4 pb-2 flex items-center gap-2">
              <span className="text-xl">
                {nextMeal.type === "breakfast" ? "🌅" : nextMeal.type === "lunch" ? "☀️" : nextMeal.type === "dinner" ? "🌙" : nextMeal.type === "pre_workout" ? "⚡" : nextMeal.type === "post_workout" ? "💪" : "🌤️"}
              </span>
              <div>
                <p className="text-base font-display font-bold text-on-surface capitalize">
                  {nextMeal.type.replace("_", " ")}
                </p>
                <p className="text-[10px] text-on-surface-variant font-medium tracking-wider uppercase">
                  {nextMeal.time} • {nextMeal.totalCalories} kcal
                </p>
              </div>
            </div>

            {/* Food Items List */}
            <div className="px-4 pb-3 space-y-1.5">
              {nextMeal.foods.map((food, i) => (
                <div key={i} className="flex items-center justify-between py-1.5 px-3 rounded-lg bg-surface-container/50">
                  <span className="text-xs text-on-surface font-medium truncate flex-1">
                    {food.name}
                  </span>
                  <span className="text-[10px] text-on-surface-variant ml-2 shrink-0">
                    {food.quantity} {food.unit} • {food.calories} kcal
                  </span>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="px-4 pb-4 flex items-center justify-between">
              <div className="flex gap-3">
                <span className="text-[10px] text-primary font-semibold">● {nextMeal.totalProtein}g Protein</span>
                <span className="text-[10px] font-semibold" style={{ color: "#c57eff" }}>● {nextMeal.totalCalories} kcal</span>
              </div>
              <span className="text-xs text-primary font-semibold">Log →</span>
            </div>
          </button>
        ) : (
          <button
            onClick={() => router.push("/food-selection")}
            className="w-full p-6 rounded-2xl bg-surface-container-low text-center"
          >
            <p className="text-on-surface-variant text-sm">No meal plan for today</p>
            <p className="text-primary font-semibold text-sm mt-1">Tap to create one →</p>
          </button>
        )}
      </motion.div>

      {/* Coach Insight */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <CoachInsight
          message={
            remaining > calorieTarget * 0.5
              ? `You have <strong>${remaining} kcal</strong> remaining today. Start with a protein-rich breakfast to set the pace.`
              : proteinConsumed < proteinTarget * 0.5
              ? `You're slightly behind on your <strong>protein intake</strong> today. Consider adding a scoop of whey or a handful of almonds to your afternoon snack.`
              : `Great progress! You've consumed <strong>${consumed} kcal</strong> and <strong>${proteinConsumed}g protein</strong>. Keep it up!`
          }
          type={
            proteinConsumed < proteinTarget * 0.3 ? "warning" : "tip"
          }
        />
      </motion.div>
    </div>
  );
}
