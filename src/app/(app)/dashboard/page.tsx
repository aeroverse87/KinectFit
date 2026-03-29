"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Bell, User } from "lucide-react";
import { useRouter } from "next/navigation";
import ProgressRing from "@/components/ProgressRing";
import CoachInsight from "@/components/CoachInsight";
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

  // Demo streak (would come from history in production)
  const streak = 12;

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
          <button className="w-9 h-9 rounded-full bg-surface-container flex items-center justify-center">
            <Bell size={16} className="text-on-surface-variant" />
          </button>
          <button
            onClick={() => router.push("/profile")}
            className="w-9 h-9 rounded-full bg-surface-container flex items-center justify-center"
          >
            <User size={16} className="text-on-surface-variant" />
          </button>
        </div>
      </motion.div>

      {/* Progress Ring Section */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="bg-surface-container-low rounded-3xl p-6 flex flex-col items-center mb-6"
      >
        <ProgressRing
          value={consumed}
          max={calorieTarget}
          size={220}
          strokeWidth={16}
          sublabel="KCAL LEFT TO GO"
        />

        {/* Secondary ring for protein */}
        <div className="mt-2 flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-primary" />
          <span className="text-xs text-on-surface-variant">Calories</span>
          <div className="w-3 h-3 rounded-full bg-secondary ml-2" />
          <span className="text-xs text-on-surface-variant">Protein</span>
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
            <div className="relative h-40 bg-gradient-to-b from-surface-container to-surface-container-low flex items-center justify-center">
              <span className="text-6xl">🥗</span>
              <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                <span className="text-surface text-lg">+</span>
              </div>
            </div>
            <div className="p-4">
              <p className="text-lg font-semibold text-on-surface">
                {nextMeal.foods[0]?.name || "Your next meal"}
              </p>
              <div className="flex gap-4 mt-1">
                <span className="text-xs text-primary">● {nextMeal.totalProtein}g Protein</span>
                <span className="text-xs text-secondary">● {nextMeal.totalCalories} kcal</span>
              </div>
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
