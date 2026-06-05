"use client";

import { useCallback, useEffect, useState } from "react";
import {
  attendanceService,
  type AttendanceSessionSummary,
  type Presence,
  type SessionRosterEntry,
} from "@/lib/attendanceService";

interface SessionDetailPanelProps {
  sessionId: string | null;
  onRefreshSessions: () => void;
  onOpenScanner?: (sessionId: string) => void;
}

const PRESENCE_BADGE: Record<Presence, string> = {
  present: "bg-emerald-900/40 text-emerald-300",
  late: "bg-amber-900/40 text-amber-300",
  absent: "bg-red-900/40 text-red-300",
  excused: "bg-slate-600/40 text-slate-300",
};

export default function SessionDetailPanel({
  sessionId,
  onRefreshSessions,
  onOpenScanner,
}: SessionDetailPanelProps) {
  const [session, setSession] = useState<AttendanceSessionSummary | null>(null);
  const [roster, setRoster] = useState<SessionRosterEntry[]>([]);
  const [stats, setStats] = useState({ expected: 0, present: 0, absent: 0, late: 0, excused: 0 });
  const [filter, setFilter] = useState<"all" | Presence>("all");
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    if (!sessionId) return;
    setLoading(true);
    setError("");
    try {
      const data = await attendanceService.getSession(sessionId);
      setSession(data.session);
      setRoster(data.roster);
      setStats(data.stats);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load session");
      setSession(null);
      setRoster([]);
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  useEffect(() => {
    if (sessionId) load();
    else {
      setSession(null);
      setRoster([]);
    }
  }, [sessionId, load]);

  const handleClose = async () => {
    if (!sessionId || !confirm("Close this session? No more scans will count.")) return;
    setBusy(true);
    try {
      await attendanceService.closeSession(sessionId);
      await load();
      onRefreshSessions();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to close");
    } finally {
      setBusy(false);
    }
  };

  const handleStart = async () => {
    if (!sessionId) return;
    setBusy(true);
    try {
      await attendanceService.startSession(sessionId);
      await load();
      onRefreshSessions();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to start");
    } finally {
      setBusy(false);
    }
  };

  const handleMarkAbsentRest = async () => {
    if (!sessionId || !confirm("Mark everyone not yet recorded as absent?")) return;
    setBusy(true);
    try {
      await attendanceService.markAbsentRest(sessionId);
      await load();
      onRefreshSessions();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed");
    } finally {
      setBusy(false);
    }
  };

  const handleMark = async (studentId: string, presence: Presence) => {
    if (!sessionId) return;
    setBusy(true);
    try {
      await attendanceService.markStudent(sessionId, studentId, presence);
      await load();
      onRefreshSessions();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Mark failed");
    } finally {
      setBusy(false);
    }
  };

  const handleExport = async () => {
    if (!session || !sessionId) return;
    try {
      const name = `attendance-${session.courseCode}-${new Date(session.scheduledAt).toISOString().slice(0, 10)}.csv`;
      await attendanceService.downloadExport(sessionId, name);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Export failed");
    }
  };

  if (!sessionId) {
    return (
      <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-8 text-center h-full min-h-[280px] flex flex-col items-center justify-center">
        <span className="text-4xl mb-3">📋</span>
        <p className="text-slate-300 font-medium">Select a session</p>
        <p className="text-slate-500 text-sm mt-1 max-w-xs">
          Choose a session from the list to see who is present or absent
        </p>
      </div>
    );
  }

  if (loading && !session) {
    return (
      <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-8 text-center min-h-[280px] flex items-center justify-center">
        <p className="text-slate-400">Loading session…</p>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="bg-slate-800/40 border border-red-900/30 rounded-2xl p-6 text-red-400 text-sm">
        {error || "Session not found"}
      </div>
    );
  }

  const rate =
    stats.expected > 0 ? Math.round(((stats.present + stats.late) / stats.expected) * 100) : 0;
  const filtered =
    filter === "all" ? roster : roster.filter(r => r.presence === filter);

  const statusColor =
    session.status === "active"
      ? "bg-emerald-500/20 text-emerald-300"
      : session.status === "closed"
        ? "bg-slate-500/20 text-slate-300"
        : "bg-amber-500/20 text-amber-300";

  return (
    <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl overflow-hidden flex flex-col min-h-[320px]">
      <div className="p-5 border-b border-slate-700/80">
        <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`text-xs px-2 py-0.5 rounded-full uppercase font-medium ${statusColor}`}>
                {session.status}
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-900/40 text-indigo-300 uppercase">
                {session.type}
              </span>
            </div>
            <h3 className="text-lg font-bold text-white mt-2">{session.title}</h3>
            <p className="text-slate-400 text-sm">
              {session.courseCode} · {session.location} ·{" "}
              {new Date(session.scheduledAt).toLocaleString()}
            </p>
          </div>
        </div>

        {/* Progress ring (simple bar) */}
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-slate-400">Attendance</span>
            <span className="text-white font-semibold">
              {stats.present + stats.late}/{stats.expected} ({rate}%)
            </span>
          </div>
          <div className="h-2.5 bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500"
              style={{ width: `${Math.min(rate, 100)}%` }}
            />
          </div>
          <div className="flex gap-4 mt-2 text-xs text-slate-400">
            <span className="text-emerald-400">Present {stats.present}</span>
            <span className="text-amber-400">Late {stats.late}</span>
            <span className="text-red-400">Absent {stats.absent}</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {session.status === "active" && onOpenScanner && (
            <button
              type="button"
              onClick={() => onOpenScanner(sessionId)}
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-medium"
            >
              Open QR scanner
            </button>
          )}
          {session.status === "scheduled" && (
            <button
              type="button"
              disabled={busy}
              onClick={handleStart}
              className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm disabled:opacity-50"
            >
              Start session
            </button>
          )}
          {session.status === "active" && (
            <button
              type="button"
              disabled={busy}
              onClick={handleClose}
              className="px-4 py-2 rounded-lg bg-slate-600 text-white text-sm disabled:opacity-50"
            >
              Close session
            </button>
          )}
          <button
            type="button"
            disabled={busy}
            onClick={handleMarkAbsentRest}
            className="px-3 py-2 rounded-lg border border-slate-600 text-slate-300 text-sm disabled:opacity-50"
          >
            Mark rest absent
          </button>
          <button
            type="button"
            onClick={handleExport}
            className="px-3 py-2 rounded-lg border border-slate-600 text-slate-300 text-sm"
          >
            Export CSV
          </button>
        </div>
        {error && <p className="text-red-400 text-xs mt-2">{error}</p>}
      </div>

      <div className="flex gap-1 px-4 pt-3 border-b border-slate-700/50 overflow-x-auto shrink-0">
        {(["all", "present", "absent", "late", "excused"] as const).map(f => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap capitalize ${
              filter === f ? "bg-slate-600 text-white" : "text-slate-400 hover:text-white"
            }`}
          >
            {f === "all" ? `All (${roster.length})` : f}
          </button>
        ))}
      </div>

      <ul className="flex-1 overflow-y-auto p-3 space-y-2 max-h-[360px]">
        {filtered.map(s => (
          <li
            key={s.studentId}
            className="flex items-center gap-3 bg-slate-700/25 rounded-xl p-3"
          >
            <div className="h-9 w-9 rounded-full bg-slate-600 flex items-center justify-center text-xs text-white shrink-0 overflow-hidden">
              {s.avatar ? (
                <img src={s.avatar} alt="" className="h-full w-full object-cover" />
              ) : (
                s.name.charAt(0)
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium truncate">{s.name}</p>
              <p className="text-slate-500 text-xs">{s.studentNumber}</p>
            </div>
            <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${PRESENCE_BADGE[s.presence]}`}>
              {s.presence}
            </span>
            {session.status !== "closed" && session.status !== "cancelled" && (
              <select
                disabled={busy}
                value={s.presence}
                onChange={e => handleMark(s.studentId, e.target.value as Presence)}
                className="text-xs bg-slate-800 border border-slate-600 rounded-lg px-1 py-1 text-slate-300"
              >
                <option value="present">Present</option>
                <option value="late">Late</option>
                <option value="absent">Absent</option>
                <option value="excused">Excused</option>
              </select>
            )}
          </li>
        ))}
        {filtered.length === 0 && (
          <li className="text-center text-slate-500 text-sm py-6">No students in this filter</li>
        )}
      </ul>
    </div>
  );
}
