"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { DEPARTMENTS_BY_FACULTY, ALL_DEPARTMENTS } from "@/lib/departments";

interface DepartmentComboboxProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  /** Tailwind ring color accent, e.g. "blue" (default) or "purple". */
  accent?: "blue" | "purple";
  /** Smaller padding/text to match compact forms (e.g. the course modal). */
  compact?: boolean;
}

/**
 * Searchable department picker. The admin can:
 *  - type to filter the built-in, faculty-grouped department list, or
 *  - type any custom department that isn't in the list — whatever is typed
 *    becomes the value (free text is committed on every keystroke).
 *
 * The dropdown is purely an assist; the typed text is always the source of
 * truth, so "add manually" works with no extra step.
 */
export default function DepartmentCombobox({
  value,
  onChange,
  placeholder = "Search or type a department…",
  accent = "blue",
  compact = false,
}: DepartmentComboboxProps) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState(value);
  const containerRef = useRef<HTMLDivElement>(null);

  // Keep the input in sync when the parent resets/changes the value externally.
  useEffect(() => {
    setText(value);
  }, [value]);

  // Close the dropdown when clicking outside the component.
  useEffect(() => {
    function onDocMouseDown(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onDocMouseDown);
    return () => document.removeEventListener("mousedown", onDocMouseDown);
  }, []);

  const query = text.trim().toLowerCase();

  const filteredGroups = useMemo(() => {
    if (!query) return DEPARTMENTS_BY_FACULTY;
    return DEPARTMENTS_BY_FACULTY.map((group) => ({
      faculty: group.faculty,
      departments: group.departments.filter((d) => d.toLowerCase().includes(query)),
    })).filter((group) => group.departments.length > 0);
  }, [query]);

  const exactMatch = useMemo(
    () => ALL_DEPARTMENTS.some((d) => d.toLowerCase() === query),
    [query],
  );

  const hasResults = filteredGroups.length > 0;
  const ring = accent === "purple" ? "focus:ring-purple-500/50" : "focus:ring-blue-500";
  const inputCls = compact
    ? "w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2"
    : "w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2";

  const commit = (dept: string) => {
    setText(dept);
    onChange(dept);
    setOpen(false);
  };

  return (
    <div ref={containerRef} className="relative">
      <input
        type="text"
        value={text}
        role="combobox"
        aria-expanded={open}
        aria-autocomplete="list"
        autoComplete="off"
        placeholder={placeholder}
        onChange={(e) => {
          setText(e.target.value);
          onChange(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={(e) => {
          if (e.key === "Escape") setOpen(false);
          if (e.key === "Enter") {
            e.preventDefault();
            setOpen(false);
          }
        }}
        className={`${inputCls} ${ring}`}
      />

      {open && (
        <div className="absolute z-50 mt-1 w-full max-h-60 overflow-y-auto rounded-lg border border-slate-600 bg-slate-800 shadow-xl">
          {/* Offer the typed value as a custom department when it's not an exact match. */}
          {query && !exactMatch && (
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => commit(text.trim())}
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-emerald-300 hover:bg-slate-700"
            >
              <span className="text-emerald-400">+</span>
              <span>
                Add &ldquo;<span className="font-medium">{text.trim()}</span>&rdquo; as a new department
              </span>
            </button>
          )}

          {hasResults ? (
            filteredGroups.map((group) => (
              <div key={group.faculty}>
                <p className="sticky top-0 bg-slate-900/95 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                  {group.faculty}
                </p>
                {group.departments.map((dept) => {
                  const selected = dept === value;
                  return (
                    <button
                      key={dept}
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => commit(dept)}
                      className={`block w-full px-3 py-2 text-left text-sm hover:bg-slate-700 ${
                        selected ? "bg-slate-700 text-white" : "text-slate-200"
                      }`}
                    >
                      {dept}
                    </button>
                  );
                })}
              </div>
            ))
          ) : !query ? null : (
            <p className="px-3 py-2 text-sm text-slate-500">
              No matching department — type to add your own.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
