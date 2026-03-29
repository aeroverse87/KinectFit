"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Search, X, Trash2, Edit3 } from "lucide-react";
import GradientButton from "@/components/GradientButton";
import { useAuth } from "@/contexts/AuthContext";
import { getFoodItems, addFoodItem, updateFoodItem, deleteFoodItem } from "@/lib/firebase/firestore";
import type { FoodItem } from "@/types";

const defaultForm: Omit<FoodItem, "id"> = {
  name: "",
  caloriesPer: 0,
  proteinPer: 0,
  fatsPer: 0,
  carbsPer: 0,
  unit: "grams",
};

const units = ["grams", "pieces", "cups", "tbsp", "slices", "bowls", "scoops", "ml"];

export default function LibraryPage() {
  const { user } = useAuth();
  const [foods, setFoods] = useState<FoodItem[]>([]);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(defaultForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

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

  const handleSave = async () => {
    if (!user || !form.name) return;
    setSaving(true);
    try {
      if (editId) {
        await updateFoodItem(user.uid, editId, form);
      } else {
        await addFoodItem(user.uid, form);
      }
      setShowModal(false);
      setEditId(null);
      setForm(defaultForm);
      loadFoods();
    } catch (e) {
      console.error("Error saving food:", e);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!user) return;
    try {
      await deleteFoodItem(user.uid, id);
      loadFoods();
    } catch (e) {
      console.error("Error deleting food:", e);
    }
  };

  const openEdit = (food: FoodItem) => {
    setEditId(food.id || null);
    setForm({
      name: food.name,
      caloriesPer: food.caloriesPer,
      proteinPer: food.proteinPer,
      fatsPer: food.fatsPer,
      carbsPer: food.carbsPer,
      unit: food.unit,
    });
    setShowModal(true);
  };

  const filteredFoods = foods.filter((f) =>
    f.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="px-5 pt-4 pb-6 max-w-md mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-5"
      >
        <h1 className="text-2xl font-display font-extrabold tracking-tight">
          Food <span className="text-primary">Library</span>
        </h1>
        <button
          onClick={() => {
            setEditId(null);
            setForm(defaultForm);
            setShowModal(true);
          }}
          className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center shadow-glow-primary"
        >
          <Plus size={18} className="text-surface" />
        </button>
      </motion.div>

      {/* Search */}
      <div className="relative mb-5">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant" />
        <input
          type="text"
          id="library-search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search foods..."
          className="w-full bg-surface-container-low rounded-xl py-3 pl-11 pr-4 text-sm text-on-surface placeholder:text-on-surface-variant/50 ghost-border focus:outline-none focus:ghost-border-active transition"
        />
      </div>

      {/* Foods list */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filteredFoods.length === 0 ? (
        <div className="py-12 text-center">
          <p className="text-5xl mb-4">🍽️</p>
          <p className="text-on-surface-variant text-sm">
            {foods.length === 0 ? "No foods yet. Add your first food!" : "No matching foods."}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredFoods.map((food) => (
            <motion.div
              key={food.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3 p-3 rounded-2xl bg-surface-container-low"
            >
              <div className="w-12 h-12 rounded-xl bg-surface-container-highest flex items-center justify-center text-xl">
                🍽️
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-on-surface truncate">{food.name}</p>
                <p className="text-xs text-on-surface-variant">
                  {food.caloriesPer} kcal • {food.proteinPer}g P • {food.fatsPer}g F • {food.carbsPer}g C / {food.unit}
                </p>
              </div>
              <div className="flex gap-1 shrink-0">
                <button
                  onClick={() => openEdit(food)}
                  className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center"
                >
                  <Edit3 size={12} className="text-on-surface-variant" />
                </button>
                <button
                  onClick={() => food.id && handleDelete(food.id)}
                  className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center"
                >
                  <Trash2 size={12} className="text-error" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/60"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md bg-surface-container-high rounded-t-3xl p-6 max-h-[85vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-display font-bold">
                  {editId ? "Edit Food" : "Add Food"}
                </h2>
                <button onClick={() => setShowModal(false)}>
                  <X size={20} className="text-on-surface-variant" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="label-editorial mb-2 block">NAME</label>
                  <input
                    type="text"
                    id="food-name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="e.g. Chicken Breast"
                    className="w-full bg-surface-container rounded-xl py-3 px-4 text-sm text-on-surface placeholder:text-on-surface-variant/50 ghost-border focus:outline-none focus:ghost-border-active"
                  />
                </div>

                <div>
                  <label className="label-editorial mb-2 block">UNIT</label>
                  <div className="flex flex-wrap gap-2">
                    {units.map((u) => (
                      <button
                        key={u}
                        type="button"
                        onClick={() => setForm({ ...form, unit: u })}
                        className={`px-3 py-2 rounded-lg text-xs font-medium capitalize no-select transition ${
                          form.unit === u
                            ? "bg-primary/15 text-primary ghost-border-active"
                            : "bg-surface-container text-on-surface-variant"
                        }`}
                      >
                        {u}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {[
                    { key: "caloriesPer", label: "CALORIES", suffix: "kcal" },
                    { key: "proteinPer", label: "PROTEIN", suffix: "g" },
                    { key: "fatsPer", label: "FATS", suffix: "g" },
                    { key: "carbsPer", label: "CARBS", suffix: "g" },
                  ].map(({ key, label, suffix }) => (
                    <div key={key}>
                      <label className="label-editorial mb-2 block">{label}</label>
                      <div className="relative">
                        <input
                          type="number"
                          id={`food-${key}`}
                          value={form[key as keyof typeof form] as number}
                          onChange={(e) =>
                            setForm({ ...form, [key]: +e.target.value })
                          }
                          className="w-full bg-surface-container rounded-xl py-3 px-4 pr-12 text-sm text-on-surface ghost-border focus:outline-none focus:ghost-border-active"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-on-surface-variant">
                          {suffix}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6">
                <GradientButton onClick={handleSave} loading={saving}>
                  {editId ? "Update Food" : "Add Food"}
                </GradientButton>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
