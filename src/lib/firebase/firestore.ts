import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  Timestamp,
  DocumentData,
} from "firebase/firestore";
import { db } from "./config";
import type { UserProfile, FoodItem, DailyPlan, MealLog, DailySummary, WeightEntry } from "@/types";

// ---- User Profile ----
export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  const snap = await getDoc(doc(db, "users", userId));
  return snap.exists() ? ({ id: snap.id, ...snap.data() } as UserProfile) : null;
};

export const createUserProfile = async (userId: string, data: Partial<UserProfile>) =>
  setDoc(doc(db, "users", userId), { ...data, createdAt: Timestamp.now() });

export const updateUserProfile = async (userId: string, data: Partial<UserProfile>) =>
  updateDoc(doc(db, "users", userId), data);

// ---- Food Items ----
export const getFoodItems = async (userId: string): Promise<FoodItem[]> => {
  const snap = await getDocs(
    query(collection(db, "users", userId, "foodItems"), orderBy("name"))
  );
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as FoodItem));
};

export const addFoodItem = async (userId: string, data: Omit<FoodItem, "id">) =>
  addDoc(collection(db, "users", userId, "foodItems"), {
    ...data,
    createdAt: Timestamp.now(),
  });

export const updateFoodItem = async (userId: string, foodId: string, data: Partial<FoodItem>) =>
  updateDoc(doc(db, "users", userId, "foodItems", foodId), data);

export const deleteFoodItem = async (userId: string, foodId: string) =>
  deleteDoc(doc(db, "users", userId, "foodItems", foodId));

// ---- Daily Plans ----
export const getDailyPlan = async (userId: string, date: string): Promise<DailyPlan | null> => {
  const snap = await getDoc(doc(db, "users", userId, "dailyPlans", date));
  return snap.exists() ? ({ id: snap.id, ...snap.data() } as DailyPlan) : null;
};

export const saveDailyPlan = async (userId: string, date: string, data: Partial<DailyPlan>) =>
  setDoc(doc(db, "users", userId, "dailyPlans", date), data, { merge: true });

// ---- Meal Logs ----
export const getMealLogs = async (userId: string, date: string): Promise<MealLog[]> => {
  const snap = await getDocs(
    query(
      collection(db, "users", userId, "mealLogs"),
      where("date", "==", date),
      orderBy("timestamp")
    )
  );
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as MealLog));
};

export const addMealLog = async (userId: string, data: Omit<MealLog, "id">) =>
  addDoc(collection(db, "users", userId, "mealLogs"), {
    ...data,
    timestamp: Timestamp.now(),
  });

// ---- Daily Summaries ----
export const getDailySummary = async (userId: string, date: string): Promise<DailySummary | null> => {
  const snap = await getDoc(doc(db, "users", userId, "dailySummaries", date));
  return snap.exists() ? ({ id: snap.id, ...snap.data() } as DailySummary) : null;
};

export const saveDailySummary = async (userId: string, date: string, data: Partial<DailySummary>) =>
  setDoc(doc(db, "users", userId, "dailySummaries", date), data, { merge: true });

// ---- History ----
export const getHistoryRange = async (
  userId: string,
  startDate: string,
  endDate: string
): Promise<DailySummary[]> => {
  const snap = await getDocs(
    query(
      collection(db, "users", userId, "dailySummaries"),
      where("date", ">=", startDate),
      where("date", "<=", endDate),
      orderBy("date")
    )
  );
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as DailySummary));
};

// ---- Weight Entries ----
export const addWeightEntry = async (userId: string, weight: number, date: string) =>
  addDoc(collection(db, "users", userId, "weightEntries"), {
    weight,
    date,
    timestamp: Timestamp.now(),
  });

export const getWeightEntries = async (userId: string, limit = 30): Promise<WeightEntry[]> => {
  if (!db) return [];
  const snap = await getDocs(
    query(collection(db, "users", userId, "weightEntries"), orderBy("date", "desc"))
  );
  return snap.docs.slice(0, limit).map((d) => ({ id: d.id, ...d.data() } as WeightEntry)).reverse();
};
// ---- AI Usage Tracking ----
const AI_DAILY_LIMIT = 5;

export const getAiUsage = async (userId: string, date: string): Promise<{ count: number; limit: number }> => {
  if (!db) return { count: 0, limit: AI_DAILY_LIMIT };
  const snap = await getDoc(doc(db, "users", userId, "aiUsage", date));
  const count = snap.exists() ? (snap.data().count as number) : 0;
  return { count, limit: AI_DAILY_LIMIT };
};

export const incrementAiUsage = async (userId: string, date: string): Promise<number> => {
  if (!db) return 0;
  const ref = doc(db, "users", userId, "aiUsage", date);
  const snap = await getDoc(ref);
  const current = snap.exists() ? (snap.data().count as number) : 0;
  const newCount = current + 1;
  await setDoc(ref, { count: newCount, lastUsed: Timestamp.now() }, { merge: true });
  return newCount;
};
