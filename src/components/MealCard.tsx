"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp, Check, Plus, Minus, X, PlusCircle } from "lucide-react";
import type { Meal, MealFood, FoodItem } from "@/types";

interface MealCardProps {
  meal: Meal;
  logged?: boolean;
  loggedFoods?: MealFood[];
  foodLibrary?: FoodItem[];
  onLogMeal?: (foods: MealFood[]) => void;
  defaultExpanded?: boolean;
}

const mealIcons: Record<string, string> = {
  breakfast: "🌅",
  pre_workout: "⚡",
  lunch: "☀️",
  evening_snack: "🌤️",
  post_workout: "💪",
  dinner: "🌙",
};

const mealLabels: Record<string, string> = {
  breakfast: "Breakfast",
  pre_workout: "Pre-Workout",
  lunch: "Lunch",
  evening_snack: "Evening Snack",
  post_workout: "Post-Workout",
  dinner: "Dinner",
};

export default function MealCard({
  meal,
  logged = false,
  loggedFoods,
  foodLibrary = [],
  onLogMeal,
  defaultExpanded = false,
}: MealCardProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  // Track which AI-suggested foods are checked (all on by default)
  const [checkedAi, setCheckedAi] = useState<Set<number>>(
    new Set(meal.foods.map((_, i) => i))
  );

  // Track extra foods added by user: { foodId → quantity }
  const [extras, setExtras] = useState<Record<string, number>>({});

  // Show/hide the food library picker
  const [showPicker, setShowPicker] = useState(false);

  const toggleAiFood = (index: number) => {
    setCheckedAi((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  const updateExtra = (foodId: string, delta: number) => {
    setExtras((prev) => {
      const current = prev[foodId] || 0;
      const next = Math.max(0, current + delta);
      if (next === 0) {
        const { [foodId]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [foodId]: next };
    });
  };

  const handleLog = () => {
    if (!onLogMeal) return;

    // Collect checked AI foods
    const aiFoods: MealFood[] = meal.foods
      .filter((_, i) => checkedAi.has(i))
      .map((f) => ({ ...f }));

    // Collect extra foods
    const extraFoods: MealFood[] = Object.entries(extras)
      .filter(([, qty]) => qty > 0)
      .map(([foodId, qty]) => {
        const lib = foodLibrary.find((f) => f.id === foodId)!;
        return {
          foodId,
          name: lib.name,
          quantity: qty,
          unit: lib.unit,
          calories: lib.caloriesPer * qty,
          protein: lib.proteinPer * qty,
          fats: lib.fatsPer * qty,
          carbs: lib.carbsPer * qty,
        };
      });

    onLogMeal([...aiFoods, ...extraFoods]);
  };

  // Calculate live totals for the logging preview
  const aiCalories = meal.foods
    .filter((_, i) => checkedAi.has(i))
    .reduce((s, f) => s + f.calories, 0);
  const extraCalories = Object.entries(extras).reduce((s, [id, qty]) => {
    const lib = foodLibrary.find((f) => f.id === id);
    return s + (lib ? lib.caloriesPer * qty : 0);
  }, 0);
  const liveCalories = aiCalories + extraCalories;

  const aiProtein = meal.foods
    .filter((_, i) => checkedAi.has(i))
    .reduce((s, f) => s + f.protein, 0);
  const extraProtein = Object.entries(extras).reduce((s, [id, qty]) => {
    const lib = foodLibrary.find((f) => f.id === id);
    return s + (lib ? lib.proteinPer * qty : 0);
  }, 0);
  const liveProtein = aiProtein + extraProtein;

  const hasChanges = checkedAi.size !== meal.foods.length || Object.keys(extras).length > 0;
  const displayFoods = logged && loggedFoods ? loggedFoods : null;

  return (
    <motion.div
      layout
      className={`rounded-2xl overflow-hidden transition-colors ${
        logged
          ? "bg-surface-container-low"
          : "bg-surface-container"
      }`}
    >
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 p-4 no-select"
      >
        <div className="w-10 h-10 rounded-xl bg-surface-container-highest flex items-center justify-center text-lg">
          {mealIcons[meal.type] || "🍽️"}
        </div>
        <div className="flex-1 text-left">
          <p className="text-base font-semibold text-on-surface">
            {mealLabels[meal.type] || meal.type}
          </p>
          <p className="text-xs text-on-surface-variant">
            {meal.time} • {logged && loggedFoods
              ? `${loggedFoods.reduce((s, f) => s + f.calories, 0)} kcal logged`
              : `${meal.totalCalories} kcal suggested`
            }
          </p>
        </div>
        {logged && (
          <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
            <Check size={14} className="text-primary" />
          </div>
        )}
        {expanded ? (
          <ChevronUp size={18} className="text-on-surface-variant" />
        ) : (
          <ChevronDown size={18} className="text-on-surface-variant" />
        )}
      </button>

      {/* Expanded Content */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-2">

              {/* --- LOGGED STATE --- */}
              {logged && displayFoods && (
                <>
                  <p className="label-editorial mb-1">WHAT YOU ATE</p>
                  {displayFoods.map((food, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 p-3 rounded-xl bg-surface-container"
                    >
                      <div className="w-8 h-8 rounded-lg bg-surface-container-highest flex items-center justify-center text-sm">
                        🥗
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-on-surface truncate">{food.name}</p>
                        <p className="text-xs text-on-surface-variant">{food.quantity} {food.unit}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-xs text-primary font-semibold">{food.calories} kcal</p>
                      </div>
                    </div>
                  ))}
                </>
              )}

              {/* --- PENDING STATE (not yet logged) --- */}
              {!logged && (
                <>
                  {/* AI Suggested Foods with toggles */}
                  <p className="label-editorial mb-1">AI SUGGESTED</p>
                  {meal.foods.map((food, i) => {
                    const isChecked = checkedAi.has(i);
                    return (
                      <div
                        key={i}
                        className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${
                          isChecked ? "bg-surface-container-low" : "bg-surface-container-low/40"
                        }`}
                      >
                        <button
                          onClick={() => toggleAiFood(i)}
                          className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 transition-colors ${
                            isChecked
                              ? "bg-primary text-surface"
                              : "bg-surface-container-highest text-on-surface-variant"
                          }`}
                        >
                          {isChecked && <Check size={12} />}
                        </button>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium truncate ${isChecked ? "text-on-surface" : "text-on-surface-variant line-through"}`}>
                            {food.name}
                          </p>
                          <p className="text-xs text-on-surface-variant">
                            {food.quantity} {food.unit}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-xs text-primary font-semibold">{food.calories} kcal</p>
                          <p className="text-xs text-on-surface-variant">{food.protein}g P</p>
                        </div>
                      </div>
                    );
                  })}

                  {/* Extra foods added by user */}
                  {Object.keys(extras).length > 0 && (
                    <>
                      <p className="label-editorial mt-3 mb-1">ADDED BY YOU</p>
                      {Object.entries(extras).map(([foodId, qty]) => {
                        const lib = foodLibrary.find((f) => f.id === foodId);
                        if (!lib || qty <= 0) return null;
                        return (
                          <div
                            key={foodId}
                            className="flex items-center gap-3 p-3 rounded-xl bg-primary/5 ghost-border-active"
                          >
                            <div className="w-8 h-8 rounded-lg bg-surface-container-highest flex items-center justify-center text-sm">
                              🍽️
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-on-surface truncate">{lib.name}</p>
                              <p className="text-xs text-on-surface-variant">{lib.caloriesPer * qty} kcal</p>
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0">
                              <button
                                onClick={() => updateExtra(foodId, -1)}
                                className="w-6 h-6 rounded-full bg-surface-container-highest flex items-center justify-center"
                              >
                                <Minus size={10} className="text-on-surface-variant" />
                              </button>
                              <span className="w-5 text-center text-xs font-semibold text-on-surface">{qty}</span>
                              <button
                                onClick={() => updateExtra(foodId, 1)}
                                className="w-6 h-6 rounded-full bg-primary/15 flex items-center justify-center"
                              >
                                <Plus size={10} className="text-primary" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </>
                  )}

                  {/* Add Food Button */}
                  <button
                    onClick={() => setShowPicker(!showPicker)}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-surface-container-highest/50 text-on-surface-variant text-xs font-semibold no-select mt-1"
                  >
                    <PlusCircle size={14} />
                    {showPicker ? "Hide Library" : "+ Add Food From Library"}
                  </button>

                  {/* Inline Food Picker */}
                  <AnimatePresence>
                    {showPicker && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="max-h-48 overflow-y-auto space-y-1 mt-1 p-2 rounded-xl bg-surface-container-highest/30">
                          {foodLibrary.length === 0 ? (
                            <p className="text-xs text-on-surface-variant text-center py-3">
                              No foods in library yet
                            </p>
                          ) : (
                            foodLibrary.map((lib) => {
                              const qty = extras[lib.id!] || 0;
                              return (
                                <div
                                  key={lib.id}
                                  className="flex items-center gap-2 py-2 px-2 rounded-lg"
                                >
                                  <div className="flex-1 min-w-0">
                                    <p className="text-xs font-medium text-on-surface truncate">{lib.name}</p>
                                    <p className="text-[10px] text-on-surface-variant">{lib.caloriesPer} kcal/{lib.unit}</p>
                                  </div>
                                  {qty > 0 ? (
                                    <div className="flex items-center gap-1 shrink-0">
                                      <button
                                        onClick={() => updateExtra(lib.id!, -1)}
                                        className="w-6 h-6 rounded-full bg-surface-container-highest flex items-center justify-center"
                                      >
                                        <Minus size={10} className="text-on-surface-variant" />
                                      </button>
                                      <span className="w-4 text-center text-xs font-semibold">{qty}</span>
                                      <button
                                        onClick={() => updateExtra(lib.id!, 1)}
                                        className="w-6 h-6 rounded-full bg-primary/15 flex items-center justify-center"
                                      >
                                        <Plus size={10} className="text-primary" />
                                      </button>
                                    </div>
                                  ) : (
                                    <button
                                      onClick={() => updateExtra(lib.id!, 1)}
                                      className="w-6 h-6 rounded-full bg-surface-container-highest flex items-center justify-center"
                                    >
                                      <Plus size={10} className="text-on-surface-variant" />
                                    </button>
                                  )}
                                </div>
                              );
                            })
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* AI Note */}
                  {meal.aiNote && (
                    <div className="p-3 rounded-xl bg-surface-container-highest/50 italic text-xs text-on-surface-variant leading-relaxed">
                      &quot;{meal.aiNote}&quot;
                    </div>
                  )}

                  {/* Live Totals + Log Button */}
                  {onLogMeal && (
                    <div className="mt-2 space-y-2">
                      <div className="flex justify-between px-1">
                        <span className="text-[10px] text-on-surface-variant font-medium tracking-wider">TOTAL</span>
                        <span className="text-xs font-semibold">
                          <span className="text-primary">{Math.round(liveCalories)} kcal</span>
                          <span className="text-on-surface-variant mx-1">•</span>
                          <span className="text-secondary">{Math.round(liveProtein)}g P</span>
                        </span>
                      </div>
                      <button
                        onClick={handleLog}
                        disabled={checkedAi.size === 0 && Object.keys(extras).length === 0}
                        className="w-full py-3 rounded-xl gradient-primary text-surface text-sm font-bold disabled:opacity-40 no-select shadow-glow-primary"
                      >
                        Log This Meal
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
