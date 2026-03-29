"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Bell, Zap } from "lucide-react";
import { useRouter } from "next/navigation";
import MealCard from "@/components/MealCard";
import MacroBar from "@/components/MacroBar";
import CoachInsight from "@/components/CoachInsight";
import { useAuth } from "@/contexts/AuthContext";
import { useUser } from "@/contexts/UserContext";
import { getDailyPlan, getMealLogs, saveDailyPlan, addMealLog, getFoodItems } from "@/lib/firebase/firestore";
import type { DailyPlan, MealLog, MealFood, FoodItem } from "@/types";

function getToday(): string {
  return new Date().toISOString().split("T")[0];
}

export default function MealPlanPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { profile } = useUser();
  const [plan, setPlan] = useState<DailyPlan | null>(null);
  const [logs, setLogs] = useState<MealLog[]>([]);
  const [foods, setFoods] = useState<FoodItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    if (!user) return;
    try {
      const today = getToday();
      const [p, l, f] = await Promise.all([
        getDailyPlan(user.uid, today),
        getMealLogs(user.uid, today),
        getFoodItems(user.uid),
      ]);
      setPlan(p);
      setLogs(l);
      setFoods(f);
    } catch (e) {
      console.error("Error loading meal plan:", e);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const consumed = logs.reduce((s, l) => s + l.totalCalories, 0);
  const proteinConsumed = logs.reduce((s, l) => s + l.totalProtein, 0);
  const calorieTarget = profile?.calorieTarget || 2000;
  const proteinTarget = profile?.proteinTarget || 150;
  const remaining = Math.max(0, calorieTarget - consumed);

  const planProtein = plan?.totalProtein || proteinTarget;
  const planCarbs = plan?.totalCarbs || 220;

  // Check which meals are already logged
  const loggedMealTypes = new Set(logs.map((l) => l.mealType));

  const handleLogMeal = async (mealIndex: number, actualFoods: MealFood[]) => {
    if (!user || !plan) return;
    const meal = plan.meals[mealIndex];
    const totalCalories = actualFoods.reduce((s, f) => s + f.calories, 0);
    const totalProtein = actualFoods.reduce((s, f) => s + f.protein, 0);

    try {
      // Save as meal log
      await addMealLog(user.uid, {
        date: getToday(),
        mealType: meal.type,
        foods: actualFoods,
        totalCalories,
        totalProtein,
      });

      // Mark meal as completed in the plan
      const updatedMeals = [...plan.meals];
      updatedMeals[mealIndex] = { ...updatedMeals[mealIndex], completed: true };
      await saveDailyPlan(user.uid, getToday(), { meals: updatedMeals });

      // Reload data
      loadData();
    } catch (e) {
      console.error("Error logging meal:", e);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh] px-5">
        <p className="text-on-surface-variant text-sm mb-4">No meal plan for today</p>
        <button
          onClick={() => router.push("/food-selection")}
          className="text-primary font-semibold text-sm"
        >
          Create a meal plan →
        </button>
      </div>
    );
  }

  return (
    <div className="px-5 pt-4 pb-6 max-w-md mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-4"
      >
        <h1 className="text-xl font-display font-extrabold tracking-tight text-primary">
          Ethereal Coach
        </h1>
        <div className="flex items-center gap-2">
          <button className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center">
            <Bell size={14} className="text-on-surface-variant" />
          </button>
          <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center">
            <Zap size={14} className="text-surface" />
          </div>
        </div>
      </motion.div>

      {/* Title */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="mb-6"
      >
        <p className="label-editorial mb-1">OPTIMAL PERFORMANCE</p>
        <h2 className="text-3xl font-display font-extrabold tracking-tight leading-tight">
          Daily Fuel Protocol
        </h2>
        <p className="text-sm text-on-surface-variant mt-1">
          Tap each meal to log what you actually ate. Accept, modify, or add your own foods.
        </p>
      </motion.div>

      {/* Calories Remaining Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-surface-container-low rounded-2xl p-5 flex items-center justify-between mb-4"
      >
        <div>
          <p className="label-editorial mb-1">CALORIES REMAINING</p>
          <p className="text-4xl font-display font-extrabold">
            {remaining.toLocaleString()}
          </p>
        </div>
        <div className="w-14 h-14 rounded-full bg-primary/15 flex items-center justify-center">
          <Zap size={24} className="text-primary" />
        </div>
      </motion.div>

      {/* Macro Bars */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="flex gap-3 mb-6"
      >
        <MacroBar
          label="PROTEIN"
          current={proteinConsumed}
          target={planProtein}
          color="#73ffe3"
        />
        <MacroBar
          label="CARBS"
          current={0}
          target={planCarbs}
          color="#818cf8"
        />
      </motion.div>

      {/* Meal Schedule */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <p className="label-editorial mb-3">MEAL SCHEDULE</p>
        <div className="space-y-3">
          {plan.meals.map((meal, i) => {
            const isLogged = loggedMealTypes.has(meal.type);
            const mealLog = logs.find((l) => l.mealType === meal.type);
            return (
              <MealCard
                key={i}
                meal={meal}
                defaultExpanded={!isLogged && i === plan.meals.findIndex((m) => !loggedMealTypes.has(m.type))}
                logged={isLogged}
                loggedFoods={mealLog?.foods}
                foodLibrary={foods}
                onLogMeal={isLogged ? undefined : (actualFoods) => handleLogMeal(i, actualFoods)}
              />
            );
          })}
        </div>
      </motion.div>

      {/* Coach Insight */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-6"
      >
        <CoachInsight
          title="How This Works"
          message={
            logs.length === 0
              ? "Expand each meal to see AI suggestions. <strong>Uncheck</strong> items you skip, <strong>add your own</strong> from the library, then tap <strong>Log This Meal</strong>."
              : `You've logged <strong>${logs.length}</strong> meal${logs.length > 1 ? "s" : ""} today with <strong>${consumed} kcal</strong> and <strong>${proteinConsumed}g protein</strong>. ${remaining > calorieTarget * 0.3 ? "Keep logging to stay on track!" : "You're doing great!"}`
          }
          type={logs.length === 0 ? "tip" : "success"}
          tags={logs.length === 0 ? ["INTERACTIVE PLAN"] : ["TRACKING"]}
        />
      </motion.div>
    </div>
  );
}
