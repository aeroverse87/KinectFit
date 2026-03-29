"use client";

import { motion } from "framer-motion";
import { Plus, Check } from "lucide-react";
import type { FoodItem } from "@/types";

interface FoodItemCardProps {
  food: FoodItem;
  selected?: boolean;
  onToggle?: () => void;
  onEdit?: () => void;
  compact?: boolean;
}

export default function FoodItemCard({
  food,
  selected = false,
  onToggle,
  onEdit,
  compact = false,
}: FoodItemCardProps) {
  return (
    <motion.div
      layout
      whileTap={{ scale: 0.98 }}
      onClick={onEdit}
      className={`flex items-center gap-3 p-3 rounded-2xl transition-colors cursor-pointer no-select ${
        selected
          ? "bg-surface-container ghost-border-active"
          : "bg-surface-container-low"
      }`}
    >
      <div className="w-12 h-12 rounded-xl bg-surface-container-highest flex items-center justify-center text-xl shrink-0">
        🍽️
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-on-surface truncate">{food.name}</p>
        <p className="text-xs text-on-surface-variant">
          {food.unit} • {food.caloriesPer} kcal
        </p>
      </div>
      {!compact && (
        <div className="text-right shrink-0 mr-1">
          <p className="text-xs text-on-surface-variant">{food.proteinPer}g P</p>
        </div>
      )}
      {onToggle && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggle();
          }}
          className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-colors ${
            selected
              ? "bg-primary text-surface"
              : "bg-surface-container-highest text-on-surface-variant"
          }`}
        >
          {selected ? <Check size={16} /> : <Plus size={16} />}
        </button>
      )}
    </motion.div>
  );
}
