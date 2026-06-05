"use client";

import { useCallback, useEffect, useState } from "react";
import { attendanceService, type RosterStudent } from "@/lib/attendanceService";

interface RosterModalProps {
  courseId: string;
  courseCode: string;
  courseName: string;
  isOpen: boolean;
  onClose: () => void;
  onRosterChange?: () => void;
}

export default function RosterModal({
  courseId,
  courseCode,
  courseName,
  isOpen,
  onClose,
  onRosterChange,
}: RosterModalProps) {
  const [roster, setRoster] = useState<RosterStudent[]>([]);
  const [candidates, setCandidates] = useState<RosterStudent[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingCandidates, setLoadingCandidates] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [tab, setTab] = useState<"enrolled" | "add">("enrolled");
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const loadRoster = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await attendanceService.getRoster(courseId);
      setRoster(data.roster);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load roster");
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  const loadCandidates = useCallback(async () => {
    setLoadingCandidates(true);
    try {
      const data = await attendanceService.getRosterCandidates(courseId, search);
      setCandidates(data.candidates);
    } catch {
      setCandidates([]);
    } finally {
      setLoadingCandidates(false);
    }
  }, [courseId, search]);

  useEffect(() => {
    if (!isOpen) return;
    setTab("enrolled");
    setSelected(new Set());
    setSearch("");
    loadRoster();
  }, [isOpen, loadRoster]);

  useEffect(() => {
    if (!isOpen || tab !== "add") return;
    const t = setTimeout(loadCandidates, 300);
    return () => clearTimeout(t);
  }, [isOpen, tab, search, loadCandidates]);

  const toggleSelect = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleBulkEnroll = async () => {
    setBusy(true);
    setError("");
    setSuccess("");
    try {
      const res = await attendanceService.bulkEnrollByCriteria(courseId);
      setSuccess(`Added ${res.added} student(s) from ${courseCode} department/level`);
      await loadRoster();
      onRosterChange?.();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Bulk enroll failed");
    } finally {
      setBusy(false);
    }
  };

  const handleAddSelected = async () => {
    if (selected.size === 0) return;
    setBusy(true);
    setError("");
    setSuccess("");
    try {
      const res = await attendanceService.enrollStudents(courseId, Array.from(selected));
      setSuccess(`Added ${res.added} student(s)`);
      setSelected(new Set());
      await loadRoster();
      await loadCandidates();
      onRosterChange?.();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Enroll failed");
    } finally {
      setBusy(false);
    }
  };

  const handleRemove = async (studentId: string) => {
    if (!confirm("Remove this student from the course roster?")) return;
    setBusy(true);
    try {
      await attendanceService.withdrawStudent(courseId, studentId);
      await loadRoster();
      onRosterChange?.();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Remove failed");
    } finally {
      setBusy(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 p-0 sm:p-4">
      <div className="bg-slate-800 border border-slate-700 rounded-t-2xl sm:rounded-2xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl">
        <div className="flex items-start justify-between p-5 border-b border-slate-700 shrink-0">
          <div>
            <h3 className="text-xl font-bold text-white">Course roster</h3>
            <p className="text-slate-400 text-sm mt-0.5">
              {courseCode} · {courseName}
            </p>
          </div>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-white p-1">
            ✕
          </button>
        </div>

        <div className="flex gap-1 p-3 border-b border-slate-700/80 shrink-0">
          <button
            type="button"
            onClick={() => setTab("enrolled")}
            className={`flex-1 py-2 rounded-lg text-sm font-medium ${
              tab === "enrolled"
                ? "bg-emerald-600/80 text-white"
                : "text-slate-400 hover:bg-slate-700/50"
            }`}
          >
            Enrolled ({roster.length})
          </button>
          <button
            type="button"
            onClick={() => setTab("add")}
            className={`flex-1 py-2 rounded-lg text-sm font-medium ${
              tab === "add"
                ? "bg-blue-600/80 text-white"
                : "text-slate-400 hover:bg-slate-700/50"
            }`}
          >
            Add students
          </button>
        </div>

        {error && (
          <p className="mx-4 mt-3 text-sm text-red-400 bg-red-900/20 rounded-lg px-3 py-2">{error}</p>
        )}
        {success && (
          <p className="mx-4 mt-3 text-sm text-emerald-400 bg-emerald-900/20 rounded-lg px-3 py-2">
            {success}
          </p>
        )}

        <div className="flex-1 overflow-y-auto p-4 min-h-0">
          {tab === "enrolled" && (
            <>
              <button
                type="button"
                disabled={busy}
                onClick={handleBulkEnroll}
                className="w-full mb-4 py-2.5 rounded-xl border border-dashed border-slate-600 text-slate-300 text-sm hover:bg-slate-700/40 disabled:opacity-50"
              >
                Auto-enroll all students in this course&apos;s department & level
              </button>
              {loading ? (
                <p className="text-center text-slate-400 py-8">Loading roster…</p>
              ) : roster.length === 0 ? (
                <p className="text-center text-slate-400 py-8">
                  No students enrolled yet. Use &quot;Add students&quot; or auto-enroll.
                </p>
              ) : (
                <ul className="space-y-2">
                  {roster.map(s => (
                    <li
                      key={s.studentId}
                      className="flex items-center gap-3 bg-slate-700/30 rounded-xl p-3"
                    >
                      <div className="h-10 w-10 rounded-full bg-slate-600 flex items-center justify-center text-sm text-white overflow-hidden shrink-0">
                        {s.avatar ? (
                          <img src={s.avatar} alt="" className="h-full w-full object-cover" />
                        ) : (
                          s.name.charAt(0)
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-medium truncate">{s.name}</p>
                        <p className="text-slate-400 text-xs truncate">
                          {s.studentNumber} · {s.year}
                        </p>
                      </div>
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => handleRemove(s.studentId)}
                        className="text-red-400 hover:text-red-300 text-xs px-2 py-1"
                      >
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}

          {tab === "add" && (
            <>
              <input
                type="search"
                placeholder="Search by name, ID, email…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full mb-3 px-4 py-2.5 rounded-xl bg-slate-900/60 border border-slate-600 text-white placeholder-slate-500 text-sm"
              />
              {selected.size > 0 && (
                <button
                  type="button"
                  disabled={busy}
                  onClick={handleAddSelected}
                  className="w-full mb-3 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-medium disabled:opacity-50"
                >
                  Add {selected.size} selected
                </button>
              )}
              {loadingCandidates ? (
                <p className="text-center text-slate-400 py-8">Searching…</p>
              ) : candidates.length === 0 ? (
                <p className="text-center text-slate-400 py-8">No candidates found</p>
              ) : (
                <ul className="space-y-2">
                  {candidates.map(s => (
                    <li key={s.studentId}>
                      <label className="flex items-center gap-3 bg-slate-700/30 rounded-xl p-3 cursor-pointer hover:bg-slate-700/50">
                        <input
                          type="checkbox"
                          checked={selected.has(s.studentId)}
                          onChange={() => toggleSelect(s.studentId)}
                          className="rounded border-slate-500"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-medium truncate">{s.name}</p>
                          <p className="text-slate-400 text-xs">{s.studentNumber}</p>
                        </div>
                      </label>
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
