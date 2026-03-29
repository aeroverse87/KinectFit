"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, LogOut, User, Target, Scale, Flame, Plus, TrendingDown, TrendingUp, Minus } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useUser } from "@/contexts/UserContext";
import { signOut } from "@/lib/firebase/auth";
import { addWeightEntry, getWeightEntries, updateUserProfile } from "@/lib/firebase/firestore";
import { getToday } from "@/lib/utils/date";
import type { WeightEntry } from "@/types";

// Mini weight chart drawn on canvas
function WeightChart({ entries, targetWeight }: { entries: WeightEntry[]; targetWeight?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || entries.length < 2) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, w, h);

    const weights = entries.map((e) => e.weight);
    const allValues = targetWeight ? [...weights, targetWeight] : weights;
    const minW = Math.min(...allValues) - 1;
    const maxW = Math.max(...allValues) + 1;
    const range = maxW - minW || 1;

    const padX = 10;
    const padY = 20;
    const chartW = w - padX * 2;
    const chartH = h - padY * 2;
    const stepX = chartW / (entries.length - 1);

    // Target weight line
    if (targetWeight) {
      const ty = padY + chartH - ((targetWeight - minW) / range) * chartH;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(padX, ty);
      ctx.lineTo(w - padX, ty);
      ctx.strokeStyle = "#c57eff60";
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = "#c57eff";
      ctx.font = "bold 9px sans-serif";
      ctx.fillText(`Target: ${targetWeight}kg`, w - padX - 75, ty - 5);
    }

    // Gradient fill under line
    const grad = ctx.createLinearGradient(0, padY, 0, h - padY);
    grad.addColorStop(0, "rgba(115, 255, 227, 0.25)");
    grad.addColorStop(1, "rgba(115, 255, 227, 0)");

    ctx.beginPath();
    ctx.moveTo(padX, padY + chartH);
    entries.forEach((e, i) => {
      const x = padX + i * stepX;
      const y = padY + chartH - ((e.weight - minW) / range) * chartH;
      ctx.lineTo(x, y);
    });
    ctx.lineTo(padX + (entries.length - 1) * stepX, padY + chartH);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();

    // Line
    ctx.beginPath();
    entries.forEach((e, i) => {
      const x = padX + i * stepX;
      const y = padY + chartH - ((e.weight - minW) / range) * chartH;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.strokeStyle = "#73ffe3";
    ctx.lineWidth = 2;
    ctx.lineJoin = "round";
    ctx.stroke();

    // Glow
    ctx.shadowColor = "#73ffe3";
    ctx.shadowBlur = 8;
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Dots
    entries.forEach((e, i) => {
      const x = padX + i * stepX;
      const y = padY + chartH - ((e.weight - minW) / range) * chartH;
      ctx.beginPath();
      ctx.arc(x, y, 3, 0, Math.PI * 2);
      ctx.fillStyle = "#73ffe3";
      ctx.fill();
    });

    // Labels for first/last
    ctx.fillStyle = "#8a919e";
    ctx.font = "9px sans-serif";
    const firstDate = entries[0].date.slice(5); // MM-DD
    const lastDate = entries[entries.length - 1].date.slice(5);
    ctx.fillText(firstDate, padX, h - 4);
    ctx.textAlign = "right";
    ctx.fillText(lastDate, w - padX, h - 4);
  }, [entries, targetWeight]);

  if (entries.length < 2) {
    return (
      <div className="h-32 flex items-center justify-center rounded-xl bg-surface-container-highest/30">
        <p className="text-xs text-on-surface-variant">Log at least 2 entries to see your trend</p>
      </div>
    );
  }

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-40 rounded-xl"
      style={{ background: "rgba(22, 26, 35, 0.5)" }}
    />
  );
}

export default function ProfilePage() {
  const router = useRouter();
  const { user } = useAuth();
  const { profile, refreshProfile } = useUser();
  const [entries, setEntries] = useState<WeightEntry[]>([]);
  const [showLogForm, setShowLogForm] = useState(false);
  const [newWeight, setNewWeight] = useState("");
  const [saving, setSaving] = useState(false);
  const [showTargetForm, setShowTargetForm] = useState(false);
  const [targetInput, setTargetInput] = useState("");

  const loadEntries = useCallback(async () => {
    if (!user) return;
    try {
      const data = await getWeightEntries(user.uid, 30);
      setEntries(data);
    } catch (e) {
      console.error("Error loading weight entries:", e);
    }
  }, [user]);

  useEffect(() => {
    loadEntries();
  }, [loadEntries]);

  const handleLogWeight = async () => {
    if (!user || !newWeight) return;
    const weight = parseFloat(newWeight);
    if (isNaN(weight) || weight < 20 || weight > 300) return;
    setSaving(true);
    try {
      await addWeightEntry(user.uid, weight, getToday());
      await updateUserProfile(user.uid, { weight });
      setNewWeight("");
      setShowLogForm(false);
      loadEntries();
      if (refreshProfile) refreshProfile();
    } catch (e) {
      console.error("Error logging weight:", e);
    } finally {
      setSaving(false);
    }
  };

  const handleSetTarget = async () => {
    if (!user || !targetInput) return;
    const tw = parseFloat(targetInput);
    if (isNaN(tw) || tw < 20 || tw > 300) return;
    try {
      await updateUserProfile(user.uid, { targetWeight: tw });
      setTargetInput("");
      setShowTargetForm(false);
      if (refreshProfile) refreshProfile();
    } catch (e) {
      console.error("Error setting target weight:", e);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    router.replace("/auth");
  };

  const goalLabels: Record<string, string> = {
    fat_loss: "Fat Loss",
    maintenance: "Maintenance",
    muscle_gain: "Muscle Gain",
  };

  const latestWeight = entries.length > 0 ? entries[entries.length - 1].weight : profile?.weight;
  const firstWeight = entries.length > 0 ? entries[0].weight : profile?.weight;
  const weightChange = latestWeight && firstWeight ? latestWeight - firstWeight : 0;
  const targetWeight = profile?.targetWeight;

  return (
    <div className="px-5 pt-4 pb-6 max-w-md mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.back()} className="p-1">
          <ArrowLeft size={20} className="text-on-surface-variant" />
        </button>
        <h1 className="text-xl font-display font-extrabold tracking-tight">Profile</h1>
      </div>

      {/* Avatar & Name */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center mb-8"
      >
        <div className="w-20 h-20 rounded-full bg-surface-container-highest flex items-center justify-center mb-3">
          <User size={32} className="text-on-surface-variant" />
        </div>
        <h2 className="text-lg font-display font-bold">{profile?.name || user?.email || "User"}</h2>
        <p className="text-xs text-on-surface-variant">{user?.email}</p>
      </motion.div>

      {/* Weight Tracking Section */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between mb-3">
          <p className="label-editorial">WEIGHT TRACKER</p>
          <button
            onClick={() => setShowLogForm(!showLogForm)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold"
          >
            <Plus size={10} /> LOG WEIGHT
          </button>
        </div>

        {/* Log Weight Form */}
        <AnimatePresence>
          {showLogForm && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden mb-3"
            >
              <div className="flex gap-2 items-center p-3 rounded-xl bg-surface-container-low">
                <Scale size={14} className="text-primary shrink-0" />
                <input
                  type="number"
                  step="0.1"
                  value={newWeight}
                  onChange={(e) => setNewWeight(e.target.value)}
                  placeholder={`e.g. ${profile?.weight || 70}`}
                  className="flex-1 bg-transparent text-sm text-on-surface placeholder:text-on-surface-variant/50 outline-none"
                  autoFocus
                />
                <span className="text-xs text-on-surface-variant">kg</span>
                <button
                  onClick={handleLogWeight}
                  disabled={saving || !newWeight}
                  className="px-3 py-1.5 rounded-lg gradient-primary text-surface text-xs font-bold disabled:opacity-40"
                >
                  {saving ? "..." : "Save"}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Current + Target Weight Cards */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="p-4 rounded-2xl bg-surface-container-low">
            <p className="text-[10px] font-bold tracking-widest text-on-surface-variant mb-1">CURRENT</p>
            <p className="text-2xl font-display font-extrabold">
              {latestWeight || "—"}
              <span className="text-xs font-normal text-on-surface-variant ml-1">kg</span>
            </p>
            {weightChange !== 0 && (
              <div className={`flex items-center gap-1 mt-1 ${weightChange < 0 ? "text-primary" : "text-error"}`}>
                {weightChange < 0 ? <TrendingDown size={12} /> : <TrendingUp size={12} />}
                <span className="text-[10px] font-semibold">{Math.abs(weightChange).toFixed(1)}kg</span>
              </div>
            )}
          </div>
          <button
            onClick={() => setShowTargetForm(!showTargetForm)}
            className="p-4 rounded-2xl bg-surface-container-low text-left"
          >
            <p className="text-[10px] font-bold tracking-widest text-on-surface-variant mb-1">TARGET</p>
            <p className="text-2xl font-display font-extrabold">
              {targetWeight || "—"}
              <span className="text-xs font-normal text-on-surface-variant ml-1">
                {targetWeight ? "kg" : ""}
              </span>
            </p>
            <p className="text-[10px] text-primary font-semibold mt-1">
              {targetWeight ? "Tap to update" : "+ Set target"}
            </p>
          </button>
        </div>

        {/* Set Target Form */}
        <AnimatePresence>
          {showTargetForm && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden mb-4"
            >
              <div className="flex gap-2 items-center p-3 rounded-xl bg-surface-container-low">
                <Target size={14} className="text-secondary shrink-0" />
                <input
                  type="number"
                  step="0.1"
                  value={targetInput}
                  onChange={(e) => setTargetInput(e.target.value)}
                  placeholder={`e.g. ${(profile?.weight || 70) - 5}`}
                  className="flex-1 bg-transparent text-sm text-on-surface placeholder:text-on-surface-variant/50 outline-none"
                  autoFocus
                />
                <span className="text-xs text-on-surface-variant">kg</span>
                <button
                  onClick={handleSetTarget}
                  disabled={!targetInput}
                  className="px-3 py-1.5 rounded-lg bg-secondary/20 text-secondary text-xs font-bold disabled:opacity-40"
                >
                  Set
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Weight Chart */}
        <WeightChart entries={entries} targetWeight={targetWeight} />

        {/* Recent Entries */}
        {entries.length > 0 && (
          <div className="mt-3 space-y-1">
            <p className="label-editorial mb-2">RECENT LOGS</p>
            {entries.slice(-5).reverse().map((e, i) => (
              <div key={e.id || i} className="flex justify-between py-1.5 px-3 rounded-lg bg-surface-container/30">
                <span className="text-xs text-on-surface-variant">
                  {new Date(e.date + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </span>
                <span className="text-xs font-semibold text-on-surface">{e.weight} kg</span>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="space-y-3 mb-8"
      >
        {[
          { icon: Target, label: "Goal", value: goalLabels[profile?.goal || ""] || "—" },
          { icon: Flame, label: "Calorie Target", value: `${profile?.calorieTarget || "—"} kcal` },
          { icon: Flame, label: "Protein Target", value: `${profile?.proteinTarget || "—"}g` },
        ].map(({ icon: Icon, label, value }) => (
          <div key={label} className="flex items-center gap-3 p-4 rounded-2xl bg-surface-container-low">
            <div className="w-10 h-10 rounded-xl bg-surface-container-highest flex items-center justify-center">
              <Icon size={16} className="text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-on-surface-variant">{label}</p>
              <p className="text-sm font-semibold text-on-surface">{value}</p>
            </div>
          </div>
        ))}
      </motion.div>

      {/* Actions */}
      <div className="space-y-3">
        <button
          onClick={() => router.push("/onboarding")}
          className="w-full p-4 rounded-2xl bg-surface-container-low text-left text-sm font-medium text-on-surface"
        >
          Edit Profile →
        </button>
        <button
          onClick={handleSignOut}
          className="w-full flex items-center justify-center gap-2 p-4 rounded-2xl bg-error/10 text-error text-sm font-semibold"
        >
          <LogOut size={16} />
          Sign Out
        </button>
      </div>
    </div>
  );
}
