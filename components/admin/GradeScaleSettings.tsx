"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/components/dashboard";
import { getApiUrl } from "@/lib/config";

interface GradeBand {
  min: number;
  max: number;
  letter: string;
  point: number;
}

interface GradeScale {
  scaleMax: number;
  bands: GradeBand[];
}

export default function GradeScaleSettings() {
  const [scale, setScale] = useState<GradeScale | null>(null);
  const [isCustom, setIsCustom] = useState(false);
  const [defaultScale, setDefaultScale] = useState<GradeScale | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchScale = async () => {
    setLoading(true);
    setError("");
    try {
      const token = sessionStorage.getItem("accessToken");
      const res = await fetch(getApiUrl("/api/admin/grade-scale"), {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setScale(data.gradeScale);
        setIsCustom(!!data.isCustom);
        setDefaultScale(data.default);
      } else {
        setError("Failed to load grading scale.");
      }
    } catch {
      setError("Failed to load grading scale.");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchScale();
  }, []);

  const updateBand = (idx: number, field: keyof GradeBand, value: string) => {
    if (!scale) return;
    const bands = scale.bands.map((b, i) => {
      if (i !== idx) return b;
      if (field === "letter") return { ...b, letter: value };
      return { ...b, [field]: value === "" ? 0 : Number(value) };
    });
    setScale({ ...scale, bands });
    setSuccess("");
  };

  const addBand = () => {
    if (!scale) return;
    setScale({ ...scale, bands: [...scale.bands, { min: 0, max: 0, letter: "", point: 0 }] });
    setSuccess("");
  };

  const removeBand = (idx: number) => {
    if (!scale) return;
    setScale({ ...scale, bands: scale.bands.filter((_, i) => i !== idx) });
    setSuccess("");
  };

  const validate = (s: GradeScale): string | null => {
    if (!s.scaleMax || s.scaleMax <= 0) return "Maximum grade point must be greater than 0.";
    if (s.bands.length === 0) return "Add at least one grade band.";
    for (const b of s.bands) {
      if (!b.letter.trim()) return "Every band needs a letter (e.g. A, B, C).";
      if (b.min < 0 || b.max > 100 || b.min > b.max) return `Band "${b.letter || "?"}": scores must be 0–100 and min ≤ max.`;
      if (b.point < 0 || b.point > s.scaleMax) return `Band "${b.letter}": grade point must be between 0 and ${s.scaleMax}.`;
    }
    return null;
  };

  const save = async () => {
    if (!scale) return;
    const v = validate(scale);
    if (v) {
      setError(v);
      setSuccess("");
      return;
    }
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const token = sessionStorage.getItem("accessToken");
      const res = await fetch(getApiUrl("/api/admin/grade-scale"), {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ gradeScale: scale }),
      });
      const data = await res.json();
      if (res.ok) {
        setScale(data.gradeScale);
        setIsCustom(true);
        setSuccess("Grading scale saved. Student GPAs now use these rules.");
      } else {
        setError(data.error || "Failed to save grading scale.");
      }
    } catch {
      setError("Failed to save grading scale.");
    }
    setSaving(false);
  };

  const resetToDefault = () => {
    if (defaultScale) {
      setScale(JSON.parse(JSON.stringify(defaultScale)));
      setSuccess("");
      setError("");
    }
  };

  if (loading) {
    return (
      <div className="section-card text-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-[var(--accent)] border-t-transparent mx-auto mb-3" />
        <p className="text-[var(--text-muted)] text-sm">Loading grading scale…</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3">
        <div className="h-10 w-10 rounded-lg flex items-center justify-center shrink-0"
             style={{ background: "var(--accent-soft)", color: "var(--accent)" }}>
          <Icon name="award" size={20} />
        </div>
        <div className="min-w-0">
          <h2 className="text-[var(--text-primary)] text-xl font-semibold tracking-tight">Grading Scale</h2>
          <p className="text-[var(--text-muted)] text-sm mt-1">
            Set how scores convert to letter grades and grade points. Student GPAs are calculated automatically from these rules.
            {isCustom ? " Your institution uses a custom scale." : " Your institution currently uses the default scale."}
          </p>
        </div>
      </div>

      <div className="section-card space-y-5">
        <div className="flex flex-wrap items-end gap-4">
          <div>
            <label className="metric-label block mb-1.5">Maximum grade point</label>
            <input
              type="number"
              step="0.1"
              min="1"
              className="input w-32"
              value={scale?.scaleMax ?? ""}
              onChange={(e) => { if (scale) { setScale({ ...scale, scaleMax: e.target.value === "" ? 0 : Number(e.target.value) }); setSuccess(""); } }}
            />
            <p className="text-[var(--text-muted)] text-xs mt-1">e.g. 5.0 (Nigerian) or 4.0 (US)</p>
          </div>
        </div>

        {/* Bands */}
        <div className="space-y-3">
          {/* Desktop header */}
          <div className="hidden sm:grid grid-cols-12 gap-2 px-1 text-xs text-[var(--text-muted)] font-medium">
            <div className="col-span-3">Min score (%)</div>
            <div className="col-span-3">Max score (%)</div>
            <div className="col-span-3">Letter</div>
            <div className="col-span-2">Grade point</div>
            <div className="col-span-1"></div>
          </div>

          {scale?.bands.map((b, idx) => (
            <div
              key={idx}
              className="sm:grid sm:grid-cols-12 sm:gap-2 sm:items-center rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-1)] p-3 sm:p-0 sm:border-0 sm:bg-transparent"
            >
              {/* Mobile: band header */}
              <div className="flex items-center justify-between gap-3 sm:hidden mb-3">
                <div className="min-w-0">
                  <p className="text-[var(--text-primary)] font-semibold text-sm truncate">
                    Band {idx + 1}{b.letter?.trim() ? ` — ${b.letter.trim()}` : ""}
                  </p>
                  <p className="text-[var(--text-muted)] text-xs">
                    {b.min}% to {b.max}% → {b.point} point{b.point === 1 ? "" : "s"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => removeBand(idx)}
                  className="btn btn-ghost p-2"
                  aria-label="Remove band"
                >
                  <Icon name="trash" size={16} />
                </button>
              </div>

              {/* Fields */}
              <div className="grid grid-cols-2 gap-3 sm:contents">
                <div className="sm:col-span-3">
                  <label className="metric-label block mb-1 sm:hidden">Min score (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    className="input w-full"
                    value={b.min}
                    onChange={(e) => updateBand(idx, "min", e.target.value)}
                  />
                </div>
                <div className="sm:col-span-3">
                  <label className="metric-label block mb-1 sm:hidden">Max score (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    className="input w-full"
                    value={b.max}
                    onChange={(e) => updateBand(idx, "max", e.target.value)}
                  />
                </div>
                <div className="sm:col-span-3">
                  <label className="metric-label block mb-1 sm:hidden">Letter</label>
                  <input
                    type="text"
                    maxLength={4}
                    className="input w-full"
                    value={b.letter}
                    onChange={(e) => updateBand(idx, "letter", e.target.value)}
                    placeholder="A"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="metric-label block mb-1 sm:hidden">Grade point</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    className="input w-full"
                    value={b.point}
                    onChange={(e) => updateBand(idx, "point", e.target.value)}
                  />
                </div>
                {/* Desktop: remove button */}
                <div className="hidden sm:col-span-1 sm:flex justify-end">
                  <button
                    type="button"
                    onClick={() => removeBand(idx)}
                    className="btn btn-ghost p-2"
                    aria-label="Remove band"
                  >
                    <Icon name="trash" size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <button type="button" onClick={addBand} className="btn btn-ghost text-sm">
          <Icon name="plus" size={16} />
          Add grade band
        </button>

        {error && (
          <div className="flex items-start gap-2 text-sm p-3 rounded-lg"
               style={{ background: "color-mix(in srgb, var(--danger) 12%, transparent)", color: "var(--danger)" }}>
            <Icon name="alert" size={16} />
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div className="flex items-start gap-2 text-sm p-3 rounded-lg"
               style={{ background: "color-mix(in srgb, var(--success) 12%, transparent)", color: "var(--success)" }}>
            <Icon name="check" size={16} />
            <span>{success}</span>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-3 pt-1">
          <button type="button" onClick={save} disabled={saving} className="btn btn-primary">
            {saving ? "Saving…" : (<><Icon name="check" size={16} />Save grading scale</>)}
          </button>
          <button type="button" onClick={resetToDefault} className="btn btn-ghost text-sm">
            <Icon name="refresh" size={16} />
            Reset to default
          </button>
        </div>
      </div>

      <p className="text-[var(--text-muted)] text-xs">
        Note: changing the scale affects how every student&apos;s GPA is displayed. Existing grades (scores) are not changed —
        only how they map to grade points.
      </p>
    </div>
  );
}
