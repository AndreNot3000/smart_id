"use client";

import { useCallback, useEffect, useState } from "react";
import {
  attendanceService,
  type AttendanceSessionSummary,
} from "@/lib/attendanceService";
import AttendanceAnalytics from "./AttendanceAnalytics";
import CreateSessionModal from "./CreateSessionModal";
import RosterModal from "./RosterModal";
import SessionDetailPanel from "./SessionDetailPanel";

interface CourseOption {
  _id: string;
  courseCode: string;
  courseName: string;
  department?: string;
  level?: string;
}

interface AttendanceManagementProps {
  /** Navigate to QR scanner with an active session */
  onOpenScanner?: (sessionId: string) => void;
}

export default function AttendanceManagement({ onOpenScanner }: AttendanceManagementProps) {
  const [courses, setCourses] = useState<CourseOption[]>([]);
  const [courseId, setCourseId] = useState("");
  const [locations, setLocations] = useState<string[]>([]);
  const [sessions, setSessions] = useState<AttendanceSessionSummary[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [analytics, setAnalytics] = useState<{
    rate: number;
    sessions: number;
    present: number;
    expected: number;
  } | null>(null);

  const [loadingCourses, setLoadingCourses] = useState(true);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [error, setError] = useState("");

  const [showCreate, setShowCreate] = useState(false);
  const [showRoster, setShowRoster] = useState(false);
  const [statusFilter, setStatusFilter] = useState<"" | "active" | "closed" | "scheduled">("");
  const [view, setView] = useState<"sessions" | "analytics">("sessions");
  const [downloadingAll, setDownloadingAll] = useState(false);

  const selectedCourse = courses.find(c => c._id === courseId);

  const handleDownloadAll = useCallback(async () => {
    if (!selectedCourse) return;
    setDownloadingAll(true);
    setError("");
    try {
      await attendanceService.downloadCourseExport(
        selectedCourse._id,
        `attendance-${selectedCourse.courseCode.replace(/[^A-Za-z0-9]/g, "")}-all-sessions.csv`,
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to download report");
    } finally {
      setDownloadingAll(false);
    }
  }, [selectedCourse]);

  const loadCourses = useCallback(async () => {
    setLoadingCourses(true);
    try {
      const list = await attendanceService.getCourses({ assignedOnly: true });
      const mapped = list.map(c => ({
        _id: String(c._id),
        courseCode: String(c.courseCode || ""),
        courseName: String(c.courseName || ""),
        department: c.department as string | undefined,
        level: c.level as string | undefined,
      }));
      setCourses(mapped);
      setCourseId(prev => prev || mapped[0]?._id || "");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load courses");
    } finally {
      setLoadingCourses(false);
    }
  }, []);

  const loadLocations = useCallback(async () => {
    try {
      const locs = await attendanceService.getLocations();
      setLocations(locs);
    } catch {
      setLocations([]);
    }
  }, []);

  const loadSessions = useCallback(async () => {
    if (!courseId) return;
    setLoadingSessions(true);
    setError("");
    try {
      const list = await attendanceService.getSessions({
        courseId,
        status: statusFilter || undefined,
        limit: 50,
      });
      setSessions(list);
      if (selectedSessionId && !list.some(s => s._id === selectedSessionId)) {
        setSelectedSessionId(null);
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load sessions");
    } finally {
      setLoadingSessions(false);
    }
  }, [courseId, statusFilter, selectedSessionId]);

  const loadAnalytics = useCallback(async () => {
    if (!courseId) return;
    try {
      const data = await attendanceService.getAnalytics({ days: 30, courseId });
      setAnalytics({
        rate: data.totals.rate,
        sessions: data.totals.sessions,
        present: data.totals.present,
        expected: data.totals.expected,
      });
    } catch {
      setAnalytics(null);
    }
  }, [courseId]);

  useEffect(() => {
    loadCourses();
    loadLocations();
  }, [loadCourses, loadLocations]);

  useEffect(() => {
    if (courseId) {
      loadSessions();
      loadAnalytics();
    }
  }, [courseId, loadSessions, loadAnalytics]);

  const handleSessionCreated = (id: string) => {
    setSelectedSessionId(id);
    loadSessions();
    loadAnalytics();
    if (typeof window !== "undefined") {
      sessionStorage.setItem("activeAttendanceSessionId", id);
    }
  };

  const sessionTypeIcon = (type: string) => {
    if (type === "test") return "📝";
    if (type === "exam") return "🎓";
    return "📖";
  };

  if (loadingCourses) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-emerald-500 border-t-transparent" />
      </div>
    );
  }

  if (courses.length === 0) {
    return (
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-10 text-center">
        <span className="text-4xl">📚</span>
        <p className="text-white font-medium mt-3">No courses available</p>
        <p className="text-slate-400 text-sm mt-1">
          Ask an admin to assign you to a course before taking attendance.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Toolbar */}
      <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-4 sm:p-5">
        <div className="flex flex-col lg:flex-row lg:items-end gap-4">
          <div className="flex-1">
            <label className="text-slate-400 text-xs block mb-1">Course</label>
            <select
              value={courseId}
              onChange={e => {
                setCourseId(e.target.value);
                setSelectedSessionId(null);
              }}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900/60 border border-slate-600 text-white text-sm"
            >
              {courses.map(c => (
                <option key={c._id} value={c._id}>
                  {c.courseCode} — {c.courseName}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleDownloadAll}
              disabled={downloadingAll || !selectedCourse}
              title="Download every session of this course as one CSV"
              className="px-4 py-2.5 rounded-xl border border-slate-600 text-slate-200 text-sm hover:bg-slate-700/40 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-1.5"
            >
              {downloadingAll ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
                  Preparing…
                </>
              ) : (
                <>↓ Download all sessions</>
              )}
            </button>
            <button
              type="button"
              onClick={() => setShowRoster(true)}
              className="px-4 py-2.5 rounded-xl border border-slate-600 text-slate-200 text-sm hover:bg-slate-700/40"
            >
              Manage roster
            </button>
            <button
              type="button"
              onClick={() => setShowCreate(true)}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-sm font-medium"
            >
              + New session
            </button>
          </div>
        </div>

        {analytics && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
            <div className="bg-slate-700/30 rounded-xl p-3 text-center">
              <p className="text-2xl font-bold text-emerald-400">{analytics.rate}%</p>
              <p className="text-slate-400 text-xs">30-day rate</p>
            </div>
            <div className="bg-slate-700/30 rounded-xl p-3 text-center">
              <p className="text-2xl font-bold text-blue-400">{analytics.sessions}</p>
              <p className="text-slate-400 text-xs">Sessions</p>
            </div>
            <div className="bg-slate-700/30 rounded-xl p-3 text-center">
              <p className="text-2xl font-bold text-white">{analytics.present}</p>
              <p className="text-slate-400 text-xs">Present marks</p>
            </div>
            <div className="bg-slate-700/30 rounded-xl p-3 text-center">
              <p className="text-2xl font-bold text-purple-400">{analytics.expected}</p>
              <p className="text-slate-400 text-xs">Expected slots</p>
            </div>
          </div>
        )}
      </div>

      {/* Sessions vs Analytics */}
      <div className="flex rounded-xl border border-slate-700/80 bg-slate-800/40 p-1 w-full sm:w-auto">
        <button
          type="button"
          onClick={() => setView("sessions")}
          className={`flex-1 sm:flex-none px-5 py-2 rounded-lg text-sm font-medium transition-colors ${
            view === "sessions"
              ? "bg-slate-600 text-white shadow"
              : "text-slate-400 hover:text-white"
          }`}
        >
          Sessions
        </button>
        <button
          type="button"
          onClick={() => setView("analytics")}
          className={`flex-1 sm:flex-none px-5 py-2 rounded-lg text-sm font-medium transition-colors ${
            view === "analytics"
              ? "bg-indigo-600 text-white shadow"
              : "text-slate-400 hover:text-white"
          }`}
        >
          Analytics
        </button>
      </div>

      {error && view === "sessions" && (
        <p className="text-sm text-red-400 bg-red-900/20 border border-red-800/40 rounded-xl px-4 py-2">
          {error}
        </p>
      )}

      {view === "analytics" && courseId && (
        <AttendanceAnalytics courseId={courseId} courseCode={selectedCourse?.courseCode} />
      )}

      {view === "sessions" && (
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        {/* Sessions list */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-slate-700/80 flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-white font-semibold">Sessions</h3>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value as typeof statusFilter)}
              className="text-xs bg-slate-900 border border-slate-600 rounded-lg px-2 py-1.5 text-slate-300"
            >
              <option value="">All statuses</option>
              <option value="active">Active</option>
              <option value="scheduled">Scheduled</option>
              <option value="closed">Closed</option>
            </select>
          </div>

          <div className="max-h-[480px] overflow-y-auto p-3 space-y-2">
            {loadingSessions ? (
              <p className="text-slate-400 text-sm text-center py-8">Loading…</p>
            ) : sessions.length === 0 ? (
              <p className="text-slate-400 text-sm text-center py-8">
                No sessions yet. Create one to start taking attendance.
              </p>
            ) : (
              sessions.map(s => {
                const pct =
                  s.expectedCount > 0
                    ? Math.round((s.presentCount / s.expectedCount) * 100)
                    : 0;
                const isSelected = selectedSessionId === s._id;
                return (
                  <button
                    key={s._id}
                    type="button"
                    onClick={() => setSelectedSessionId(s._id)}
                    className={`w-full text-left rounded-xl p-4 border transition-colors ${
                      isSelected
                        ? "border-emerald-500/60 bg-emerald-900/15"
                        : "border-slate-700/50 bg-slate-700/20 hover:bg-slate-700/35"
                    }`}
                  >
                    <div className="flex justify-between items-start gap-2">
                      <div className="min-w-0">
                        <span className="text-lg mr-1">{sessionTypeIcon(s.type)}</span>
                        <span className="text-white font-medium text-sm">{s.title}</span>
                        <p className="text-slate-500 text-xs mt-0.5 truncate">
                          {s.location} · {new Date(s.scheduledAt).toLocaleString()}
                        </p>
                      </div>
                      <span
                        className={`text-[10px] uppercase px-2 py-0.5 rounded-full shrink-0 ${
                          s.status === "active"
                            ? "bg-emerald-900/50 text-emerald-300"
                            : s.status === "closed"
                              ? "bg-slate-600/50 text-slate-300"
                              : "bg-amber-900/50 text-amber-300"
                        }`}
                      >
                        {s.status}
                      </span>
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-500"
                          style={{ width: `${Math.min(pct, 100)}%` }}
                        />
                      </div>
                      <span className="text-xs text-slate-400 shrink-0">
                        {s.presentCount}/{s.expectedCount}
                      </span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        <SessionDetailPanel
          sessionId={selectedSessionId}
          onRefreshSessions={() => {
            loadSessions();
            loadAnalytics();
          }}
          onOpenScanner={id => {
            if (typeof window !== "undefined") {
              sessionStorage.setItem("activeAttendanceSessionId", id);
            }
            onOpenScanner?.(id);
          }}
        />
      </div>
      )}

      {selectedCourse && (
        <>
          <RosterModal
            isOpen={showRoster}
            onClose={() => setShowRoster(false)}
            courseId={selectedCourse._id}
            courseCode={selectedCourse.courseCode}
            courseName={selectedCourse.courseName}
            onRosterChange={() => {
              loadSessions();
              if (selectedSessionId) {
                /* detail panel will refresh on next open */
              }
            }}
          />
          <CreateSessionModal
            isOpen={showCreate}
            onClose={() => setShowCreate(false)}
            courseId={selectedCourse._id}
            courseCode={selectedCourse.courseCode}
            locations={locations}
            onCreated={handleSessionCreated}
          />
        </>
      )}
    </div>
  );
}
