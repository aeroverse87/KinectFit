"use client";

import { useRef, useEffect } from "react";

interface ProgressRingProps {
  value: number;
  max: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  trackColor?: string;
  label?: string;
  sublabel?: string;
  showValue?: boolean;
  className?: string;
}

export default function ProgressRing({
  value,
  max,
  size = 200,
  strokeWidth = 14,
  color = "#73ffe3",
  trackColor = "#22262f",
  label,
  sublabel,
  showValue = true,
  className = "",
}: ProgressRingProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const percentage = Math.min((value / max) * 100, 100);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.scale(dpr, dpr);

    const cx = size / 2;
    const cy = size / 2;
    const radius = (size - strokeWidth) / 2 - 4;

    // Clear
    ctx.clearRect(0, 0, size, size);

    // Track
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.strokeStyle = trackColor;
    ctx.lineWidth = strokeWidth;
    ctx.lineCap = "round";
    ctx.stroke();

    // Progress
    const startAngle = -Math.PI / 2;
    const endAngle = startAngle + (percentage / 100) * Math.PI * 2;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, startAngle, endAngle);
    ctx.strokeStyle = color;
    ctx.lineWidth = strokeWidth;
    ctx.lineCap = "round";
    ctx.stroke();

    // Glow effect
    ctx.shadowColor = color;
    ctx.shadowBlur = 16;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, startAngle, endAngle);
    ctx.strokeStyle = color;
    ctx.lineWidth = strokeWidth / 3;
    ctx.lineCap = "round";
    ctx.stroke();
    ctx.shadowBlur = 0;
  }, [value, max, size, strokeWidth, color, trackColor, percentage]);

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      <canvas
        ref={canvasRef}
        style={{ width: size, height: size }}
      />
      {showValue && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className="font-display font-extrabold tracking-tight leading-none"
            style={{ fontSize: size * 0.22 }}
          >
            {Math.round(max - value)}
          </span>
          {sublabel && (
            <span
              className="label-editorial mt-1"
              style={{ fontSize: size * 0.05 }}
            >
              {sublabel}
            </span>
          )}
          {label && (
            <span className="text-on-surface-variant text-xs mt-0.5">{label}</span>
          )}
        </div>
      )}
    </div>
  );
}
