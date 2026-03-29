export interface UserProfile {
  id?: string;
  email?: string;
  name?: string;
  age: number;
  height: number;
  weight: number;
  targetWeight?: number;
  goal: "fat_loss" | "maintenance" | "muscle_gain";
  calorieTarget: number;
  proteinTarget: number;
  onboarded: boolean;
  createdAt?: unknown;
}

export interface WeightEntry {
  id?: string;
  weight: number;
  date: string;
  timestamp?: unknown;
}

export interface FoodItem {
  id?: string;
  name: string;
  caloriesPer: number;
  proteinPer: number;
  fatsPer: number;
  carbsPer: number;
  unit: string;
  imageUrl?: string;
  createdAt?: unknown;
}

export interface MealFood {
  foodId: string;
  name: string;
  quantity: number;
  unit: string;
  calories: number;
  protein: number;
  fats: number;
  carbs: number;
}

export interface Meal {
  type: MealType;
  time: string;
  foods: MealFood[];
  totalCalories: number;
  totalProtein: number;
  totalFats: number;
  totalCarbs: number;
  aiNote?: string;
  completed?: boolean;
}

export type MealType =
  | "breakfast"
  | "lunch"
  | "evening_snack"
  | "pre_workout"
  | "post_workout"
  | "dinner";

export interface DailyPlan {
  id?: string;
  date: string;
  selectedFoods: string[];
  meals: Meal[];
  totalCalories: number;
  totalProtein: number;
  totalFats: number;
  totalCarbs: number;
  status: "planned" | "in_progress" | "completed";
}

export interface MealLog {
  id?: string;
  date: string;
  mealType: MealType;
  foods: MealFood[];
  totalCalories: number;
  totalProtein: number;
  timestamp?: unknown;
}

export interface DailySummary {
  id?: string;
  date: string;
  totalCalories: number;
  totalProtein: number;
  totalFats: number;
  totalCarbs: number;
  targetCalories: number;
  targetProtein: number;
  status: "goal_met" | "partial" | "missed";
  aiSummary?: string;
  meals?: MealLog[];
}

export interface CoachInsight {
  message: string;
  type: "tip" | "warning" | "success";
  tags?: string[];
}
