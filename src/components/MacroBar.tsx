"use client";

interface MacroBarProps {
  label: string;
  current: number;
  target: number;
  unit?: string;
  color?: string;
}

export default function MacroBar({
  label,
  current,
  target,
  unit = "g",
  color = "#73ffe3",
}: MacroBarProps) {
  const percentage = Math.min((current / target) * 100, 100);

  return (
    <div className="flex-1 p-4 rounded-2xl bg-surface-container-low">
      <p className="label-editorial mb-1">{label}</p>
      <div className="flex items-baseline gap-1">
        <span className="text-2xl font-display font-extrabold text-on-surface">
          {Math.round(current)}{unit}
        </span>
        <span className="text-xs text-on-surface-variant">/ {target}{unit}</span>
      </div>
      <div className="mt-3 h-2 rounded-full bg-surface-container-highest overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{
            width: `${percentage}%`,
            backgroundColor: color,
            boxShadow: `0 0 12px ${color}40`,
          }}
        />
      </div>
    </div>
  );
}
