"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Bell, Settings, Search, SlidersHorizontal, Filter, Zap } from "lucide-react";
import FoodItemCard from "@/components/FoodItemCard";
import GradientButton from "@/components/GradientButton";
import { useAuth } from "@/contexts/AuthContext";
import { useUser } from "@/contexts/UserContext";
import { getFoodItems, saveDailyPlan } from "@/lib/firebase/firestore";
import { generateContent, getRemainingAiCalls, AiLimitReachedError } from "@/lib/ai/gemini";
import { buildMealPlanPrompt } from "@/lib/ai/prompts";
import type { FoodItem, Meal } from "@/types";

function getToday(): string {
  return new Date().toISOString().split("T")[0];
}

export default function FoodSelectionPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { profile } = useUser();
  const [foods, setFoods] = useState<FoodItem[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [remaining, setRemaining] = useState<number | null>(null);
  const [limitError, setLimitError] = useState(false);

  const loadFoods = useCallback(async () => {
    if (!user) return;
    try {
      const items = await getFoodItems(user.uid);
      setFoods(items);
    } catch (e) {
      console.error("Error loading foods:", e);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadFoods();
  }, [loadFoods]);

  // Load remaining AI calls
  useEffect(() => {
    if (!user) return;
    getRemainingAiCalls(user.uid).then(setRemaining).catch(() => setRemaining(5));
  }, [user]);

  const toggleFood = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const filteredFoods = foods.filter((f) =>
    f.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleGeneratePlan = async () => {
    if (!user || !profile || selected.size === 0) return;
    setGenerating(true);
    setLimitError(false);
    try {
      const selectedFoods = foods.filter((f) => f.id && selected.has(f.id));
      const prompt = buildMealPlanPrompt(selectedFoods, profile);
      const response = await generateContent(prompt, user.uid);

      // Parse the JSON response
      const jsonStr = response.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      const parsed = JSON.parse(jsonStr);

      const today = getToday();
      await saveDailyPlan(user.uid, today, {
        date: today,
        selectedFoods: Array.from(selected),
        meals: parsed.meals as Meal[],
        totalCalories: parsed.totalCalories,
        totalProtein: parsed.totalProtein,
        totalFats: parsed.totalFats || 0,
        totalCarbs: parsed.totalCarbs || 0,
        status: "planned",
      });

      // Update remaining count
      setRemaining((prev) => (prev !== null ? Math.max(0, prev - 1) : null));
      router.push("/meal-plan");
    } catch (e) {
      if (e instanceof AiLimitReachedError) {
        setLimitError(true);
        setRemaining(0);
      } else {
        console.error("Error generating plan:", e);
        alert("Failed to generate meal plan. Please check your Gemini API key and try again.");
      }
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      {/* Header */}
      <div className="px-5 pt-4 pb-2">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <button onClick={() => router.back()} className="p-1">
              <ArrowLeft size={20} className="text-on-surface-variant" />
            </button>
            <h1 className="text-xl font-display font-extrabold tracking-tight text-primary">
              Ethereal Coach
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <button className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center">
              <Bell size={14} className="text-on-surface-variant" />
            </button>
            <button className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center">
              <Settings size={14} className="text-on-surface-variant" />
            </button>
          </div>
        </div>

        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-display font-extrabold tracking-tight mb-4"
        >
          Daily Fuel Selection
        </motion.h2>

        {/* Search */}
        <div className="relative mb-4">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant" />
          <input
            type="text"
            id="food-search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search for ingredients or meals..."
            className="w-full bg-surface-container-low rounded-xl py-3 pl-11 pr-4 text-sm text-on-surface placeholder:text-on-surface-variant/50 ghost-border focus:outline-none focus:ghost-border-active transition"
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-5 pb-36 overflow-y-auto">
        {/* Recently Used (placeholder for first time) */}
        {foods.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <div className="flex items-center justify-between mb-3">
              <p className="label-editorial">RECENTLY USED</p>
              <button className="text-xs text-on-surface-variant">View All</button>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-none">
              {foods.slice(0, 4).map((food) => (
                <button
                  key={food.id}
                  onClick={() => food.id && toggleFood(food.id)}
                  className="shrink-0 w-40 rounded-2xl bg-surface-container-low overflow-hidden relative no-select"
                >
                  <div className="h-28 bg-surface-container flex items-center justify-center text-4xl">
                    🥗
                  </div>
                  {food.id && selected.has(food.id) && (
                    <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                      <span className="text-surface text-xs">✓</span>
                    </div>
                  )}
                  <div className="p-3">
                    <p className="text-sm font-semibold text-on-surface truncate">{food.name}</p>
                    <p className="text-[10px] label-editorial">{food.caloriesPer} KCAL</p>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Food Library */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="label-editorial">YOUR FOOD LIBRARY</p>
            <div className="flex gap-2">
              <button className="p-1.5 rounded-lg bg-surface-container">
                <Filter size={14} className="text-on-surface-variant" />
              </button>
              <button className="p-1.5 rounded-lg bg-surface-container">
                <SlidersHorizontal size={14} className="text-on-surface-variant" />
              </button>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filteredFoods.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-on-surface-variant text-sm">
                {foods.length === 0
                  ? "No foods yet. Go to Library to add foods."
                  : "No matching foods found."}
              </p>
              {foods.length === 0 && (
                <button
                  onClick={() => router.push("/library")}
                  className="text-primary text-sm font-semibold mt-2"
                >
                  Go to Library →
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredFoods.map((food) => (
                <FoodItemCard
                  key={food.id}
                  food={food}
                  selected={!!food.id && selected.has(food.id)}
                  onToggle={() => food.id && toggleFood(food.id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Bottom CTA */}
      {selected.size > 0 && (
        <motion.div
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          className="fixed bottom-20 left-0 right-0 px-5 pb-2 z-40 space-y-2"
        >
          {limitError && (
            <div className="px-4 py-3 rounded-xl bg-error/10 text-center">
              <p className="text-error text-xs font-semibold">Daily AI limit reached (5/5). Try again tomorrow.</p>
            </div>
          )}
          <GradientButton
            onClick={handleGeneratePlan}
            loading={generating}
            disabled={remaining === 0}
            icon={<Zap size={18} />}
          >
            {remaining === 0
              ? "AI Limit Reached"
              : `Generate My Plan${remaining !== null ? ` (${remaining}/5 left)` : ""}`
            }
          </GradientButton>
        </motion.div>
      )}
    </div>
  );
}
