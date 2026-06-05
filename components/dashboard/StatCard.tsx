"use client";

import type { ReactNode } from "react";
import Icon, { type IconName } from "./Icon";

interface StatCardProps {
  label: string;
  value: ReactNode;
  helper?: ReactNode;
  icon?: IconName;
  trend?: { direction: "up" | "down" | "flat"; label: string };
  accent?: "neutral" | "success" | "warning" | "danger" | "info";
}

const accentColors: Record<NonNullable<StatCardProps["accent"]>, string> = {
  neutral: "var(--accent)",
  success: "var(--success)",
  warning: "var(--warning)",
  danger: "var(--danger)",
  info: "var(--info)",
};

export default function StatCard({
  label,
  value,
  helper,
  icon,
  trend,
  accent = "neutral",
}: StatCardProps) {
  return (
    <div className="section-card surface-hover">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="metric-label">{label}</p>
          <p className="metric-value mt-2">{value}</p>
          {(helper || trend) && (
            <div className="mt-1.5 flex items-center gap-2 text-xs">
              {trend && (
                <span
                  className={
                    trend.direction === "up"
                      ? "metric-delta metric-delta-up"
                      : trend.direction === "down"
                      ? "metric-delta metric-delta-down"
                      : "metric-delta metric-delta-flat"
                  }
                >
                  <Icon
                    name={trend.direction === "down" ? "arrowRight" : "trendingUp"}
                    size={12}
                  />
                  {trend.label}
                </span>
              )}
              {helper && (
                <span className="text-[var(--text-muted)]">{helper}</span>
              )}
            </div>
          )}
        </div>
        {icon && (
          <div
            className="h-9 w-9 rounded-lg flex items-center justify-center shrink-0"
            style={{
              background: `color-mix(in srgb, ${accentColors[accent]} 14%, transparent)`,
              color: accentColors[accent],
            }}
          >
            <Icon name={icon} size={18} />
          </div>
        )}
      </div>
    </div>
  );
}
