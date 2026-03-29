You are a senior full-stack engineer, AI systems architect, and product designer.

Your task is to build a COMPLETE, PRODUCTION-READY mobile-first web application focused ONLY on DIET & CALORIE MANAGEMENT (Phase 1).

This is NOT a prototype. Everything must be real, functional, and deployable.

--------------------------------------------------
🎯 CORE OBJECTIVE
--------------------------------------------------

Build an intelligent diet management system that:

1. Plans daily meals based on available food items
2. Tracks real-time consumption
3. Dynamically adjusts remaining meals
4. Provides end-of-day analysis and feedback
5. Maintains historical intake and highlights missed days

--------------------------------------------------
⚙️ TECH STACK (MANDATORY)
--------------------------------------------------

Frontend:
- Next.js (latest, App Router)
- TypeScript
- Tailwind CSS + ShadCN UI
- Framer Motion (for smooth UX animations)

Backend:
- Firebase (Auth, Firestore, Storage, Functions)

AI:
- Google Gemini API (core reasoning engine)

--------------------------------------------------
📱 CORE FEATURES
--------------------------------------------------

### 1. USER PROFILE

- User onboarding:
  - Age
  - Height
  - Weight
  - Goal (fat loss / maintenance / muscle gain)
  - Daily calorie target
  - Protein target

- Store profile in Firestore

---

### 2. MASTER FOOD LIST

- User creates and manages a personal food library:
  Each food item includes:
  - Name
  - Calories per unit
  - Protein per unit
  - Fats
  - Carbs
  - Unit type (grams, piece, cup, etc.)

- CRUD operations (Create, Read, Update, Delete)
- Search + filter capability

---

### 3. DAILY FOOD SELECTION (CRITICAL FLOW)

When user opens app FIRST TIME each day:

- Prompt user to select food items they PLAN to eat today from master list
- Allow multi-select

This becomes:
👉 "Available Food Pool for the Day"

---

### 4. AI DIET PLANNER

Using:
- Selected food pool
- User calorie target
- Protein target

Generate a FULL DAY MEAL PLAN:

Meals:
- Breakfast
- Lunch
- Evening snack
- Pre-workout
- Post-workout
- Dinner

Each meal must include:
- Food items
- Suggested quantities

Constraints:
- Meet calorie goal
- Meet protein goal
- Distribute nutrients intelligently across meals

---

### 5. MEAL LOGGING SYSTEM

At each meal time:

User can:
- Select consumed food items (from master list)
- Enter quantity (input / stepper / dropdown)

System must:
- Track actual intake
- Show:
  - Calories consumed so far
  - Protein consumed so far
  - Remaining calories/protein for the day

---

### 6. DYNAMIC MEAL ADJUSTMENT (CORE INTELLIGENCE)

After each meal log:

IF user deviates from plan:
- Recalculate remaining meals for the day

Example:
- Breakfast low in protein → adjust lunch/dinner to compensate

AI must:
- Suggest updated food + quantities for remaining meals
- Keep user aligned with daily targets

---

### 7. REAL-TIME FEEDBACK

Continuously show:

- Progress bars:
  - Calories consumed vs target
  - Protein consumed vs target

- Smart nudges:
  - "You are low on protein"
  - "You are exceeding calories"
  - "Balance remaining meals like this..."

---

### 8. END-OF-DAY SUMMARY

At end of day (or next login):

Generate AI summary:

Include:
- What went well
- What was missed
- Nutritional balance
- Suggestions for improvement

Tone:
- Insightful, not generic

---

### 9. HISTORY & TRACKING

- Store daily logs

History view:
- Calendar-based UI

Each day shows:
- Total calories
- Total protein
- Status:
  - ✅ Goal met
  - ⚠️ Partial
  - ❌ Missed

Highlight:
- Days with no logs (missed tracking)

---

### 10. ANALYTICS

Basic analytics:

- Weekly averages
- Protein consistency
- Calorie deviation trends

---

--------------------------------------------------
🧠 AI (GEMINI) RESPONSIBILITIES
--------------------------------------------------

Use Gemini API for:

1. Meal plan generation
2. Dynamic meal adjustment
3. End-of-day summary
4. Smart nudges & insights

Prompts must be structured and deterministic.

---

--------------------------------------------------
🔥 DATA MODEL (YOU MUST DESIGN PROPERLY)
--------------------------------------------------

Collections:

- Users
- FoodItems
- DailyPlans
- MealLogs
- DailySummaries

Ensure:
- Scalable schema
- Efficient queries
- Clean relationships

---

--------------------------------------------------
🎨 UI/UX REQUIREMENTS
--------------------------------------------------

- Mobile-first design
- Clean, modern UI
- Smooth transitions (Framer Motion)
- Dark mode preferred

Key screens:

1. Onboarding
2. Daily food selection screen
3. AI meal plan screen
4. Meal logging screen
5. Daily progress dashboard
6. History (calendar view)
7. Food master list management

---

--------------------------------------------------
🚀 OUTPUT REQUIREMENTS
--------------------------------------------------

You must:

1. Design system architecture
2. Define Firestore schema
3. Build full frontend
4. Implement backend logic
5. Integrate Gemini API
6. Ensure real authentication
7. Make it production-ready

---

--------------------------------------------------
⚠️ RULES
--------------------------------------------------

- NO mock data
- NO placeholders
- NO incomplete features
- ALL flows must work end-to-end

---

--------------------------------------------------
🧭 EXECUTION PLAN
--------------------------------------------------

Follow this order:

1. Architecture + schema design
2. Firebase setup
3. Food master system
4. Daily selection flow
5. AI meal planning
6. Meal logging
7. Dynamic adjustment
8. Summary + history
9. UI polish + animations

Proceed step-by-step without skipping.

Ask questions ONLY if critical.