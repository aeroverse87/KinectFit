import type { FoodItem, Meal, MealLog, UserProfile } from "@/types";

export function buildMealPlanPrompt(
  foods: FoodItem[],
  profile: UserProfile
): string {
  const foodList = foods
    .map(
      (f) =>
        `- ${f.name}: ${f.caloriesPer} kcal, ${f.proteinPer}g protein, ${f.fatsPer}g fat, ${f.carbsPer}g carbs per ${f.unit}`
    )
    .join("\n");

  return `You are an expert nutritionist AI. Generate a personalized daily meal plan.

USER PROFILE:
- Age: ${profile.age}
- Weight: ${profile.weight} kg
- Height: ${profile.height} cm
- Goal: ${profile.goal.replace("_", " ")}
- Daily calorie target: ${profile.calorieTarget} kcal
- Daily protein target: ${profile.proteinTarget}g

AVAILABLE FOODS:
${foodList}

Create a meal plan with EXACTLY these meals:
1. Breakfast (07:30 AM)
2. Pre-Workout (10:30 AM)
3. Lunch (01:00 PM)
4. Evening Snack (04:30 PM)
5. Post-Workout (06:00 PM)
6. Dinner (08:30 PM)

CONSTRAINTS:
- Total calories must be close to ${profile.calorieTarget} kcal (within 5%)
- Total protein must meet or exceed ${profile.proteinTarget}g
- Only use foods from the available list
- Distribute nutrients intelligently across meals
- For each food, specify quantity in its unit

Return ONLY valid JSON in this exact format:
{
  "meals": [
    {
      "type": "breakfast",
      "time": "07:30 AM",
      "foods": [
        { "name": "Food Name", "quantity": 2, "unit": "pieces", "calories": 200, "protein": 15, "fats": 5, "carbs": 20 }
      ],
      "totalCalories": 450,
      "totalProtein": 35,
      "totalFats": 12,
      "totalCarbs": 45,
      "aiNote": "A brief nutrition tip for this meal"
    }
  ],
  "totalCalories": 2000,
  "totalProtein": 150,
  "totalFats": 60,
  "totalCarbs": 220
}`;
}

export function buildAdjustmentPrompt(
  remainingMeals: Meal[],
  actualIntake: { calories: number; protein: number; fats: number; carbs: number },
  target: { calories: number; protein: number },
  availableFoods: FoodItem[]
): string {
  const foodList = availableFoods
    .map((f) => `- ${f.name}: ${f.caloriesPer} kcal, ${f.proteinPer}g protein per ${f.unit}`)
    .join("\n");

  const remaining = remainingMeals.map((m) => m.type).join(", ");

  return `You are an expert nutritionist AI. The user has deviated from their meal plan. Adjust the remaining meals.

ACTUAL INTAKE SO FAR:
- Calories: ${actualIntake.calories} / ${target.calories} kcal
- Protein: ${actualIntake.protein} / ${target.protein}g

REMAINING MEALS: ${remaining}

AVAILABLE FOODS:
${foodList}

Redistribute the remaining ${target.calories - actualIntake.calories} kcal and ${target.protein - actualIntake.protein}g protein across remaining meals.

Return ONLY valid JSON in the same meal plan format.`;
}

export function buildSummaryPrompt(
  logs: MealLog[],
  target: { calories: number; protein: number }
): string {
  const totalCal = logs.reduce((s, l) => s + l.totalCalories, 0);
  const totalPro = logs.reduce((s, l) => s + l.totalProtein, 0);

  return `You are a supportive nutrition coach AI. Generate an end-of-day summary.

TODAY'S RESULTS:
- Calories consumed: ${totalCal} / ${target.calories} kcal (${Math.round((totalCal / target.calories) * 100)}%)
- Protein consumed: ${totalPro} / ${target.protein}g (${Math.round((totalPro / target.protein) * 100)}%)
- Meals logged: ${logs.length}

Provide:
1. What went well (1-2 sentences)
2. What was missed (1-2 sentences)
3. Nutritional balance assessment
4. One actionable suggestion for tomorrow

Tone: Insightful, supportive, not generic. Keep response under 150 words.`;
}

export function buildNudgePrompt(
  consumed: { calories: number; protein: number },
  target: { calories: number; protein: number },
  timeOfDay: string
): string {
  return `You are a nutrition coach. Generate ONE short personalized nudge (under 30 words).

Current intake: ${consumed.calories}/${target.calories} kcal, ${consumed.protein}/${target.protein}g protein.
Time: ${timeOfDay}.

Be specific and actionable. No generic advice. Return only the nudge text.`;
}
