"use client";

import { useRef, useEffect } from "react";
import type { DailySummary } from "@/types";

interface NutritionChartProps {
  summaries: Map<string, DailySummary>;
  year: number;
  month: number;
  calorieTarget: number;
  proteinTarget: number;
}

export default function NutritionChart({
  summaries,
  year,
  month,
  calorieTarget,
  proteinTarget,
}: NutritionChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Collect data points: only days that have entries
  const points: { day: number; calories: number; protein: number }[] = [];
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  for (let d = 1; d <= daysInMonth; d++) {
    const date = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    const s = summaries.get(date);
    if (s) {
      points.push({ day: d, calories: s.totalCalories, protein: s.totalProtein });
    }
  }

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || points.length < 1) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, w, h);

    const padL = 36;
    const padR = 12;
    const padT = 16;
    const padB = 28;
    const chartW = w - padL - padR;
    const chartH = h - padT - padB;

    // Determine max values for y-axis
    const maxCal = Math.max(calorieTarget * 1.1, ...points.map((p) => p.calories));

    // Scale protein to calorie axis for dual-axis effect
    const maxPro = Math.max(proteinTarget * 1.1, ...points.map((p) => p.protein));

    // X positions based on day number
    const xForDay = (day: number) => padL + ((day - 1) / (daysInMonth - 1)) * chartW;

    // Y positions
    const yForCal = (cal: number) => padT + chartH - (cal / maxCal) * chartH;
    const yForPro = (pro: number) => padT + chartH - (pro / maxPro) * chartH;

    // Grid lines
    ctx.strokeStyle = "rgba(138, 145, 158, 0.1)";
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = padT + (chartH / 4) * i;
      ctx.beginPath();
      ctx.moveTo(padL, y);
      ctx.lineTo(w - padR, y);
      ctx.stroke();
    }

    // Y-axis labels (calories)
    ctx.fillStyle = "#73ffe3";
    ctx.font = "bold 8px sans-serif";
    ctx.textAlign = "right";
    for (let i = 0; i <= 4; i++) {
      const val = Math.round((maxCal / 4) * (4 - i));
      const y = padT + (chartH / 4) * i;
      ctx.fillText(`${val}`, padL - 4, y + 3);
    }

    // Calorie target dashed line
    const targetY = yForCal(calorieTarget);
    ctx.setLineDash([4, 4]);
    ctx.strokeStyle = "rgba(115, 255, 227, 0.3)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padL, targetY);
    ctx.lineTo(w - padR, targetY);
    ctx.stroke();
    ctx.setLineDash([]);

    // Protein target dashed line
    const proTargetY = yForPro(proteinTarget);
    ctx.setLineDash([4, 4]);
    ctx.strokeStyle = "rgba(197, 126, 255, 0.3)";
    ctx.beginPath();
    ctx.moveTo(padL, proTargetY);
    ctx.lineTo(w - padR, proTargetY);
    ctx.stroke();
    ctx.setLineDash([]);

    // --- Draw calorie area + line ---
    if (points.length > 1) {
      // Area fill
      const calGrad = ctx.createLinearGradient(0, padT, 0, padT + chartH);
      calGrad.addColorStop(0, "rgba(115, 255, 227, 0.2)");
      calGrad.addColorStop(1, "rgba(115, 255, 227, 0)");
      ctx.beginPath();
      ctx.moveTo(xForDay(points[0].day), padT + chartH);
      points.forEach((p) => ctx.lineTo(xForDay(p.day), yForCal(p.calories)));
      ctx.lineTo(xForDay(points[points.length - 1].day), padT + chartH);
      ctx.closePath();
      ctx.fillStyle = calGrad;
      ctx.fill();

      // Line
      ctx.beginPath();
      points.forEach((p, i) => {
        const x = xForDay(p.day);
        const y = yForCal(p.calories);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.strokeStyle = "#73ffe3";
      ctx.lineWidth = 2;
      ctx.lineJoin = "round";
      ctx.stroke();

      // Glow
      ctx.shadowColor = "#73ffe3";
      ctx.shadowBlur = 6;
      ctx.stroke();
      ctx.shadowBlur = 0;
    }

    // Calorie dots
    points.forEach((p) => {
      ctx.beginPath();
      ctx.arc(xForDay(p.day), yForCal(p.calories), 3, 0, Math.PI * 2);
      ctx.fillStyle = "#73ffe3";
      ctx.fill();
    });

    // --- Draw protein area + line ---
    if (points.length > 1) {
      // Area fill
      const proGrad = ctx.createLinearGradient(0, padT, 0, padT + chartH);
      proGrad.addColorStop(0, "rgba(197, 126, 255, 0.15)");
      proGrad.addColorStop(1, "rgba(197, 126, 255, 0)");
      ctx.beginPath();
      ctx.moveTo(xForDay(points[0].day), padT + chartH);
      points.forEach((p) => ctx.lineTo(xForDay(p.day), yForPro(p.protein)));
      ctx.lineTo(xForDay(points[points.length - 1].day), padT + chartH);
      ctx.closePath();
      ctx.fillStyle = proGrad;
      ctx.fill();

      // Line
      ctx.beginPath();
      points.forEach((p, i) => {
        const x = xForDay(p.day);
        const y = yForPro(p.protein);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.strokeStyle = "#c57eff";
      ctx.lineWidth = 2;
      ctx.lineJoin = "round";
      ctx.stroke();

      ctx.shadowColor = "#c57eff";
      ctx.shadowBlur = 6;
      ctx.stroke();
      ctx.shadowBlur = 0;
    }

    // Protein dots
    points.forEach((p) => {
      ctx.beginPath();
      ctx.arc(xForDay(p.day), yForPro(p.protein), 3, 0, Math.PI * 2);
      ctx.fillStyle = "#c57eff";
      ctx.fill();
    });

    // X-axis date labels
    ctx.fillStyle = "#8a919e";
    ctx.font = "8px sans-serif";
    ctx.textAlign = "center";
    const labelsToShow = points.length <= 7 ? points : [points[0], points[Math.floor(points.length / 2)], points[points.length - 1]];
    labelsToShow.forEach((p) => {
      ctx.fillText(`${p.day}`, xForDay(p.day), h - 6);
    });
  }, [points, calorieTarget, proteinTarget, daysInMonth]);

  if (points.length === 0) {
    return (
      <div className="h-44 flex items-center justify-center rounded-2xl bg-surface-container-low">
        <p className="text-xs text-on-surface-variant">No data to chart this month</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-surface-container-low p-4">
      <div className="flex items-center justify-between mb-3">
        <p className="label-editorial">MONTHLY PROGRESS</p>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full" style={{ background: "#73ffe3" }} />
            <span className="text-[9px] text-on-surface-variant">Calories</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full" style={{ background: "#c57eff" }} />
            <span className="text-[9px] text-on-surface-variant">Protein</span>
          </div>
        </div>
      </div>
      <canvas
        ref={canvasRef}
        className="w-full h-44"
        style={{ background: "rgba(22, 26, 35, 0.4)", borderRadius: 12 }}
      />
      {/* Averages */}
      {points.length > 0 && (
        <div className="flex gap-3 mt-3">
          <div className="flex-1 p-2.5 rounded-xl bg-surface-container-highest/30 text-center">
            <p className="text-[9px] font-bold tracking-widest text-on-surface-variant">AVG CAL</p>
            <p className="text-sm font-display font-extrabold text-primary">
              {Math.round(points.reduce((s, p) => s + p.calories, 0) / points.length)}
            </p>
          </div>
          <div className="flex-1 p-2.5 rounded-xl bg-surface-container-highest/30 text-center">
            <p className="text-[9px] font-bold tracking-widest text-on-surface-variant">AVG PROTEIN</p>
            <p className="text-sm font-display font-extrabold" style={{ color: "#c57eff" }}>
              {Math.round(points.reduce((s, p) => s + p.protein, 0) / points.length)}g
            </p>
          </div>
          <div className="flex-1 p-2.5 rounded-xl bg-surface-container-highest/30 text-center">
            <p className="text-[9px] font-bold tracking-widest text-on-surface-variant">DAYS LOGGED</p>
            <p className="text-sm font-display font-extrabold text-on-surface">
              {points.length}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
