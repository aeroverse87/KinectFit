"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Check, Minus, Plus, Zap } from "lucide-react";
import GradientButton from "@/components/GradientButton";
import MacroBar from "@/components/MacroBar";
import { useAuth } from "@/contexts/AuthContext";
import { useUser } from "@/contexts/UserContext";
import { getFoodItems, addMealLog, getMealLogs } from "@/lib/firebase/firestore";
import type { FoodItem, MealFood, MealLog } from "@/types";

import { getToday } from "@/lib/utils/date";

export default function LogPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { profile } = useUser();
  const [foods, setFoods] = useState<FoodItem[]>([]);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [logs, setLogs] = useState<MealLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState(false);

  const loadData = useCallback(async () => {
    if (!user) return;
    try {
      const today = getToday();
      const [f, l] = await Promise.all([
        getFoodItems(user.uid),
        getMealLogs(user.uid, today),
      ]);
      setFoods(f);
      setLogs(l);
    } catch (e) {
      console.error("Error loading log data:", e);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const updateQty = (foodId: string, delta: number) => {
    setQuantities((prev) => {
      const current = prev[foodId] || 0;
      const next = Math.max(0, current + delta);
      if (next === 0) {
        const { [foodId]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [foodId]: next };
    });
  };

  const selectedFoods = Object.keys(quantities).filter((k) => quantities[k] > 0);
  const totalCalories = selectedFoods.reduce((sum, id) => {
    const food = foods.find((f) => f.id === id);
    return sum + (food ? food.caloriesPer * quantities[id] : 0);
  }, 0);
  const totalProtein = selectedFoods.reduce((sum, id) => {
    const food = foods.find((f) => f.id === id);
    return sum + (food ? food.proteinPer * quantities[id] : 0);
  }, 0);

  const consumed = logs.reduce((s, l) => s + l.totalCalories, 0);
  const proteinConsumed = logs.reduce((s, l) => s + l.totalProtein, 0);

  const handleSave = async () => {
    if (!user || selectedFoods.length === 0) return;
    setSaving(true);
    try {
      const mealFoods: MealFood[] = selectedFoods.map((id) => {
        const food = foods.find((f) => f.id === id)!;
        const qty = quantities[id];
        return {
          foodId: id,
          name: food.name,
          quantity: qty,
          unit: food.unit,
          calories: food.caloriesPer * qty,
          protein: food.proteinPer * qty,
          fats: food.fatsPer * qty,
          carbs: food.carbsPer * qty,
        };
      });

      await addMealLog(user.uid, {
        date: getToday(),
        mealType: "evening_snack", // Quick adds default to snack
        foods: mealFoods,
        totalCalories,
        totalProtein,
      });

      setQuantities({});
      setSavedMsg(true);
      setTimeout(() => setSavedMsg(false), 2500);
      loadData();
    } catch (e) {
      console.error("Error saving log:", e);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="px-5 pt-4 pb-6 max-w-md mx-auto">
      <motion.h1
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-2xl font-display font-extrabold tracking-tight mb-1"
      >
        Quick <span className="text-primary">Add</span>
      </motion.h1>
      <p className="text-xs text-on-surface-variant mb-5">
        Log a snack or extra food that wasn&apos;t in your meal plan.
      </p>

      {/* Success Toast */}
      {savedMsg && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="mb-4 p-3 rounded-xl bg-primary/10 flex items-center gap-2"
        >
          <Check size={14} className="text-primary" />
          <span className="text-xs font-semibold text-primary">Logged successfully!</span>
        </motion.div>
      )}

      {/* Progress Summary */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex gap-3 mb-6"
      >
        <MacroBar
          label="CALORIES"
          current={consumed + totalCalories}
          target={profile?.calorieTarget || 2000}
          unit=" kcal"
          color="#73ffe3"
        />
        <MacroBar
          label="PROTEIN"
          current={proteinConsumed + totalProtein}
          target={profile?.proteinTarget || 150}
          color="#c57eff"
        />
      </motion.div>

      {/* Food Items with Quantity */}
      <div className="mb-6">
        <p className="label-editorial mb-3">SELECT FOODS & QUANTITY</p>
        <div className="space-y-2">
          {foods.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-on-surface-variant text-sm">No foods in your library.</p>
              <button
                onClick={() => router.push("/library")}
                className="text-primary text-sm font-semibold mt-2"
              >
                Add foods →
              </button>
            </div>
          ) : (
            foods.map((food) => {
              const qty = quantities[food.id!] || 0;
              return (
                <div
                  key={food.id}
                  className={`flex items-center gap-3 p-3 rounded-2xl transition-colors ${
                    qty > 0
                      ? "bg-surface-container ghost-border-active"
                      : "bg-surface-container-low"
                  }`}
                >
                  <div className="w-10 h-10 rounded-xl bg-surface-container-highest flex items-center justify-center text-lg">
                    🍽️
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-on-surface truncate">{food.name}</p>
                    <p className="text-xs text-on-surface-variant">
                      {food.caloriesPer} kcal / {food.unit}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => updateQty(food.id!, -1)}
                      className="w-7 h-7 rounded-full bg-surface-container-highest flex items-center justify-center"
                      disabled={qty === 0}
                    >
                      <Minus size={12} className="text-on-surface-variant" />
                    </button>
                    <span className="w-6 text-center text-sm font-semibold text-on-surface">
                      {qty}
                    </span>
                    <button
                      onClick={() => updateQty(food.id!, 1)}
                      className="w-7 h-7 rounded-full bg-primary/15 flex items-center justify-center"
                    >
                      <Plus size={12} className="text-primary" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Log Summary */}
      {selectedFoods.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 p-4 rounded-2xl bg-surface-container-low"
        >
          <div className="flex justify-between mb-1">
            <span className="text-xs text-on-surface-variant">Items</span>
            <span className="text-xs font-semibold text-on-surface">{selectedFoods.length}</span>
          </div>
          <div className="flex justify-between mb-1">
            <span className="text-xs text-on-surface-variant">Calories</span>
            <span className="text-xs font-semibold text-primary">{Math.round(totalCalories)} kcal</span>
          </div>
          <div className="flex justify-between">
            <span className="text-xs text-on-surface-variant">Protein</span>
            <span className="text-xs font-semibold text-secondary">{Math.round(totalProtein)}g</span>
          </div>
        </motion.div>
      )}

      <GradientButton
        onClick={handleSave}
        disabled={selectedFoods.length === 0}
        loading={saving}
        icon={<Zap size={18} />}
      >
        Quick Add
      </GradientButton>
    </div>
  );
}
