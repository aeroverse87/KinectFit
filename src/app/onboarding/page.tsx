"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, TrendingDown, Scale, Dumbbell } from "lucide-react";
import GradientButton from "@/components/GradientButton";
import { useAuth } from "@/contexts/AuthContext";
import { useUser } from "@/contexts/UserContext";

const STEPS = [
  { id: 1, label: "WELCOME" },
  { id: 2, label: "BIOMETRICS" },
  { id: 3, label: "TARGETS" },
  { id: 4, label: "COMPLETE" },
];

const goals = [
  { key: "fat_loss" as const, icon: TrendingDown, label: "Fat Loss", desc: "Caloric deficit focus" },
  { key: "maintenance" as const, icon: Scale, label: "Maintenance", desc: "Stability and longevity" },
  { key: "muscle_gain" as const, icon: Dumbbell, label: "Muscle Gain", desc: "Caloric surplus focus" },
];

export default function OnboardingPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { updateProfile } = useUser();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    age: 28,
    height: 178,
    weight: 74.5,
    goal: "fat_loss" as "fat_loss" | "maintenance" | "muscle_gain",
    calorieTarget: 2000,
    proteinTarget: 150,
  });

  const handleComplete = async () => {
    if (!user) return;
    setLoading(true);
    try {
      await updateProfile({
        ...form,
        email: user.email || "",
        name: user.displayName || "",
        onboarded: true,
      });
      router.replace("/dashboard");
    } catch (e) {
      console.error("Onboarding error:", e);
    } finally {
      setLoading(false);
    }
  };

  const slideVariants = {
    enter: { x: 80, opacity: 0 },
    center: { x: 0, opacity: 1 },
    exit: { x: -80, opacity: 0 },
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col px-5 pt-6 pb-8">
      {/* Top bar */}
      <div className="flex items-center justify-between mb-8">
        {step > 1 ? (
          <button onClick={() => setStep(step - 1)} className="p-1">
            <ArrowLeft size={20} className="text-on-surface-variant" />
          </button>
        ) : (
          <div className="w-8" />
        )}

        {/* Progress bar */}
        <div className="flex-1 mx-4 flex gap-1 h-1">
          {STEPS.map((s) => (
            <div
              key={s.id}
              className={`flex-1 rounded-full transition-colors ${
                s.id <= step ? "bg-primary" : "bg-surface-container-highest"
              }`}
            />
          ))}
        </div>

        <span className="text-xs text-on-surface-variant font-medium tracking-wider">
          STEP {String(step).padStart(2, "0")}/04
        </span>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3 }}
              className="flex-1 flex flex-col"
            >
              <h1 className="text-4xl font-display font-extrabold tracking-tight leading-tight mb-3">
                Welcome to{" "}
                <span className="text-primary">Ethereal Coach.</span>
              </h1>
              <p className="text-on-surface-variant text-base leading-relaxed mb-auto">
                Your AI-powered nutrition companion. We&apos;ll personalize everything
                to your body, goals, and preferences.
              </p>

              <div className="mt-auto space-y-4">
                <div className="p-4 rounded-2xl bg-surface-container-low flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl gradient-primary-subtle flex items-center justify-center">
                    <span className="text-2xl">🧬</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-on-surface">AI-Powered Plans</p>
                    <p className="text-xs text-on-surface-variant">Personalized meal plans daily</p>
                  </div>
                </div>
                <div className="p-4 rounded-2xl bg-surface-container-low flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl gradient-primary-subtle flex items-center justify-center">
                    <span className="text-2xl">📊</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-on-surface">Smart Tracking</p>
                    <p className="text-xs text-on-surface-variant">Real-time dynamic adjustments</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3 }}
              className="flex-1 flex flex-col"
            >
              <h1 className="text-4xl font-display font-extrabold tracking-tight leading-tight mb-2">
                Tailor your <span className="text-primary">profile.</span>
              </h1>
              <p className="text-on-surface-variant text-sm mb-8">
                We use biometrics to calculate your baseline metabolic rate with AI precision.
              </p>

              {/* Age & Height */}
              <div className="grid grid-cols-2 gap-6 mb-8">
                <div>
                  <p className="label-editorial mb-2">AGE</p>
                  <div className="flex items-baseline gap-2">
                    <input
                      type="number"
                      value={form.age}
                      onChange={(e) => setForm({ ...form, age: +e.target.value })}
                      className="w-20 bg-transparent text-4xl font-display font-extrabold text-on-surface outline-none"
                    />
                    <span className="text-on-surface-variant text-sm">yrs</span>
                  </div>
                </div>
                <div>
                  <p className="label-editorial mb-2">HEIGHT</p>
                  <div className="flex items-baseline gap-2">
                    <input
                      type="number"
                      value={form.height}
                      onChange={(e) => setForm({ ...form, height: +e.target.value })}
                      className="w-20 bg-transparent text-4xl font-display font-extrabold text-on-surface outline-none"
                    />
                    <span className="text-on-surface-variant text-sm">cm</span>
                  </div>
                </div>
              </div>

              {/* Weight slider */}
              <div className="mb-8">
                <div className="flex items-baseline justify-between mb-3">
                  <p className="label-editorial">CURRENT WEIGHT</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-display font-extrabold text-primary">
                      {form.weight}
                    </span>
                    <span className="text-on-surface-variant text-sm">kg</span>
                  </div>
                </div>
                <input
                  type="range"
                  min="30"
                  max="200"
                  step="0.5"
                  value={form.weight}
                  onChange={(e) => setForm({ ...form, weight: +e.target.value })}
                  className="w-full h-1.5 bg-surface-container-highest rounded-full appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:shadow-glow-primary [&::-webkit-slider-thumb]:cursor-pointer"
                />
              </div>

              {/* Goal selection */}
              <div>
                <p className="label-editorial mb-3">PRIMARY GOAL</p>
                <div className="space-y-3">
                  {goals.map((g) => {
                    const Icon = g.icon;
                    const isSelected = form.goal === g.key;
                    return (
                      <button
                        key={g.key}
                        onClick={() => setForm({ ...form, goal: g.key })}
                        className={`w-full flex items-center gap-3 p-4 rounded-2xl transition-all no-select ${
                          isSelected
                            ? "bg-surface-container ghost-border-active"
                            : "bg-surface-container-low"
                        }`}
                      >
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                            isSelected ? "bg-primary/15" : "bg-surface-container-highest"
                          }`}
                        >
                          <Icon
                            size={18}
                            className={isSelected ? "text-primary" : "text-secondary"}
                          />
                        </div>
                        <div className="flex-1 text-left">
                          <p className="text-sm font-semibold text-on-surface">{g.label}</p>
                          <p className="text-xs text-on-surface-variant">{g.desc}</p>
                        </div>
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                            isSelected ? "border-primary" : "border-surface-container-highest"
                          }`}
                        >
                          {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3 }}
              className="flex-1 flex flex-col"
            >
              <h1 className="text-4xl font-display font-extrabold tracking-tight leading-tight mb-2">
                Set your <span className="text-primary">targets.</span>
              </h1>
              <p className="text-on-surface-variant text-sm mb-8">
                We&apos;ll use these to generate your personalized daily meal plans.
              </p>

              <div className="space-y-8">
                <div>
                  <p className="label-editorial mb-3">DAILY CALORIE TARGET</p>
                  <div className="flex items-baseline gap-2 mb-3">
                    <input
                      type="number"
                      value={form.calorieTarget}
                      onChange={(e) => setForm({ ...form, calorieTarget: +e.target.value })}
                      className="w-32 bg-transparent text-5xl font-display font-extrabold text-on-surface outline-none"
                    />
                    <span className="text-on-surface-variant">kcal</span>
                  </div>
                  <input
                    type="range"
                    min="1000"
                    max="5000"
                    step="50"
                    value={form.calorieTarget}
                    onChange={(e) => setForm({ ...form, calorieTarget: +e.target.value })}
                    className="w-full h-1.5 bg-surface-container-highest rounded-full appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:shadow-glow-primary [&::-webkit-slider-thumb]:cursor-pointer"
                  />
                  <div className="flex justify-between mt-1">
                    <span className="text-[10px] text-on-surface-variant">1,000</span>
                    <span className="text-[10px] text-on-surface-variant">5,000</span>
                  </div>
                </div>

                <div>
                  <p className="label-editorial mb-3">DAILY PROTEIN TARGET</p>
                  <div className="flex items-baseline gap-2 mb-3">
                    <input
                      type="number"
                      value={form.proteinTarget}
                      onChange={(e) => setForm({ ...form, proteinTarget: +e.target.value })}
                      className="w-24 bg-transparent text-5xl font-display font-extrabold text-on-surface outline-none"
                    />
                    <span className="text-on-surface-variant">g</span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="300"
                    step="5"
                    value={form.proteinTarget}
                    onChange={(e) => setForm({ ...form, proteinTarget: +e.target.value })}
                    className="w-full h-1.5 bg-surface-container-highest rounded-full appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-secondary [&::-webkit-slider-thumb]:shadow-glow-secondary [&::-webkit-slider-thumb]:cursor-pointer"
                  />
                  <div className="flex justify-between mt-1">
                    <span className="text-[10px] text-on-surface-variant">50</span>
                    <span className="text-[10px] text-on-surface-variant">300</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div
              key="step4"
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3 }}
              className="flex-1 flex flex-col items-center justify-center text-center"
            >
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
                className="text-7xl mb-6"
              >
                ✨
              </motion.div>
              <h1 className="text-4xl font-display font-extrabold tracking-tight mb-3">
                You&apos;re all <span className="text-primary">set!</span>
              </h1>
              <p className="text-on-surface-variant text-sm max-w-xs leading-relaxed">
                Your personalized AI coaching experience is ready.
                Let&apos;s build your first meal plan.
              </p>

              <div className="mt-8 w-full max-w-xs space-y-3 p-5 rounded-2xl bg-surface-container-low">
                <div className="flex justify-between">
                  <span className="text-xs text-on-surface-variant">Calorie target</span>
                  <span className="text-xs font-semibold text-primary">{form.calorieTarget} kcal</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-on-surface-variant">Protein target</span>
                  <span className="text-xs font-semibold text-secondary">{form.proteinTarget}g</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-on-surface-variant">Goal</span>
                  <span className="text-xs font-semibold text-on-surface capitalize">
                    {form.goal.replace("_", " ")}
                  </span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom CTA */}
      <div className="mt-6">
        <GradientButton
          onClick={() => {
            if (step < 4) setStep(step + 1);
            else handleComplete();
          }}
          loading={loading}
        >
          {step < 4 ? "Continue" : "Start My Journey"}
        </GradientButton>
        <p className="text-center text-[10px] text-on-surface-variant mt-3 tracking-wider font-medium">
          STEP {step} OF 4 • {STEPS[step - 1].label}
        </p>
      </div>
    </div>
  );
}
