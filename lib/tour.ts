"use client";

import { driver, type DriveStep } from "driver.js";

/**
 * A single step in a guided product tour.
 *
 * - `selector` targets the element to spotlight (any CSS selector, typically a
 *   `[data-tour="..."]` attribute). Omit it for a centered, element-less step
 *   (e.g. a welcome or closing message).
 * - `side`/`align` control where the popover sits relative to the element.
 */
export interface TourStep {
  selector?: string;
  title: string;
  description: string;
  side?: "top" | "right" | "bottom" | "left" | "over";
  align?: "start" | "center" | "end";
}

export interface RunTourOptions {
  /** Called once the user finishes or skips the tour. */
  onClose?: () => void;
}

/**
 * Run a guided tour with Driver.js. Steps whose target element is missing from
 * the DOM are skipped automatically, so a tour never breaks if a section isn't
 * rendered yet.
 */
export function runTour(steps: TourStep[], options: RunTourOptions = {}): void {
  if (typeof document === "undefined") return;

  const driveSteps: DriveStep[] = steps
    .filter((s) => !s.selector || document.querySelector(s.selector))
    .map((s) => ({
      element: s.selector,
      popover: {
        title: s.title,
        description: s.description,
        side: s.side ?? "bottom",
        align: s.align ?? "start",
      },
    }));

  if (driveSteps.length === 0) {
    options.onClose?.();
    return;
  }

  const d = driver({
    showProgress: true,
    allowClose: true,
    overlayColor: "rgba(2, 6, 23, 0.75)",
    stagePadding: 6,
    stageRadius: 10,
    popoverClass: "unismart-tour",
    nextBtnText: "Next →",
    prevBtnText: "← Back",
    doneBtnText: "Finish",
    progressText: "{{current}} of {{total}}",
    steps: driveSteps,
    onDestroyed: () => options.onClose?.(),
  });

  d.drive();
}

/** localStorage key tracking whether a given tour has been completed. */
export function tourSeenKey(key: string): string {
  return `unismart:tour-seen:${key}`;
}

export function hasSeenTour(key: string): boolean {
  if (typeof window === "undefined") return true;
  try {
    return window.localStorage.getItem(tourSeenKey(key)) === "true";
  } catch {
    return true;
  }
}

export function markTourSeen(key: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(tourSeenKey(key), "true");
  } catch {
    /* ignore storage errors (private mode, etc.) */
  }
}
