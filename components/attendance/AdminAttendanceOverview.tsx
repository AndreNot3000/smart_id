"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { attendanceService, type AttendanceSessionSummary } from "@/lib/attendanceService";
import SessionDetailPanel from "./SessionDetailPanel";

interface AdminAttendanceOverviewProps {
  onOpenScanner?: (sessionId: string) => void;
}

const sessionTypeIcon = (type: string) => (type === "test" ? "📝" : type === "exam" ? "🎓" : "📖");

export default function AdminAttendanceOverview({ onOpenScanner }: AdminAttendanceOverviewProps) {
  const [sessions, setSessions] = useState<AttendanceSessionSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [downloadingCourseId, setDownloadingCourseId] = useState<string | null>(null);

  const [department, setDepartment] = useState("");
  const [status, setStatus] = useState<"" | "active" | "closed" | "scheduled">("");
  const [type, setType] = useState<"" | "class" | "test" | "exam">("");
  const [search, setSearch] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const list = await attendanceService.getSessions({ limit: 500 });
      setSessions(list);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load sessions");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const departments = useMemo(
    () => Array.from(new Set(sessions.map(s => s.department || "Unassigned"))).sort(),
    [sessions]
  );

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return sessions.filter(s => {
      if (department && (s.department || "Unassigned") !== department) return false;
      if (status && s.status !== status) return false;
      if (type && s.type !== type) return false;
      if (term) {
        const hay = `${s.courseCode} ${s.courseName} ${s.title} ${s.lecturerName || ""}`.toLowerCase();
        if (!hay.includes(term)) return false;
      }
      return true;
    });
  }, [sessions, department, status, type, search]);

  // Group filtered sessions by department -> course so each course can be
  // exported as one combined file.
  const grouped = useMemo(() => {
    type CourseGroup = {
      courseId: string;
      courseCode: string;
      courseName: string;
      sessions: AttendanceSessionSummary[];
    };
    const deptMap = new Map<string, Map<string, CourseGroup>>();
    for (const s of filtered) {
      const dept = s.department || "Unassigned";
      if (!deptMap.has(dept)) deptMap.set(dept, new Map());
      const courseMap = deptMap.get(dept)!;
      const key = s.courseId;
      if (!courseMap.has(key)) {
        courseMap.set(key, {
          courseId: s.courseId,
          courseCode: s.courseCode,
          courseName: s.courseName,
          sessions: [],
        });
      }
      courseMap.get(key)!.sessions.push(s);
    }
    return Array.from(deptMap.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([dept, courseMap]) => ({
        dept,
        sessionCount: Array.from(courseMap.values()).reduce((n, cg) => n + cg.sessions.length, 0),
        courses: Array.from(courseMap.values()).sort((a, b) => a.courseCode.localeCompare(b.courseCode)),
      }));
  }, [filtered]);

  const summary = useMemo(() => {
    const present = filtered.reduce((a, s) => a + (s.presentCount || 0), 0);
    const expected = filtered.reduce((a, s) => a + (s.expectedCount || 0), 0);
    return {
      sessions: filtered.length,
      departments: new Set(filtered.map(s => s.department || "Unassigned")).size,
      rate: expected > 0 ? Math.round((present / expected) * 100) : 0,
      active: filtered.filter(s => s.status === "active").length,
    };
  }, [filtered]);

  const handleDownload = async (s: AttendanceSessionSummary, e: React.MouseEvent) => {
    e.stopPropagation();
    setDownloadingId(s._id);
    try {
      const name = `attendance-${s.courseCode}-${new Date(s.scheduledAt).toISOString().slice(0, 10)}.csv`;
      await attendanceService.downloadExport(s._id, name);
    } catch {
      setError("Download failed. Please try again.");
    } finally {
      setDownloadingId(null);
    }
  };

  const handleDownloadCourse = async (
    course: { courseId: string; courseCode: string },
    e: React.MouseEvent
  ) => {
    e.stopPropagation();
    setDownloadingCourseId(course.courseId);
    setError("");
    try {
      await attendanceService.downloadCourseExport(
        course.courseId,
        `attendance-${course.courseCode.replace(/[^A-Za-z0-9]/g, "")}-all-sessions.csv`
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Download failed. Please try again.");
    } finally {
      setDownloadingCourseId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-emerald-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-white">Attendance Management</h2>
        <p className="text-slate-400 text-sm mt-1">
          All attendance sessions across every department in your institution.
        </p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-4 text-center">
          <p className="text-2xl font-bold text-white">{summary.sessions}</p>
          <p className="text-slate-400 text-xs mt-1">Sessions</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-4 text-center">
          <p className="text-2xl font-bold text-blue-400">{summary.departments}</p>
          <p className="text-slate-400 text-xs mt-1">Departments</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-4 text-center">
          <p className="text-2xl font-bold text-emerald-400">{summary.rate}%</p>
          <p className="text-slate-400 text-xs mt-1">Attendance rate</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-4 text-center">
          <p className="text-2xl font-bold text-amber-400">{summary.active}</p>
          <p className="text-slate-400 text-xs mt-1">Active now</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-4 flex flex-wrap gap-3">
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search course, title, lecturer…"
          className="flex-1 min-w-[180px] px-3 py-2 rounded-xl bg-slate-900/60 border border-slate-600 text-white text-sm placeholder:text-slate-500"
        />
        <select value={department} onChange={e => setDepartment(e.target.value)}
                className="px-3 py-2 rounded-xl bg-slate-900/60 border border-slate-600 text-white text-sm">
          <option value="">All departments</option>
          {departments.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
        <select value={status} onChange={e => setStatus(e.target.value as typeof status)}
                className="px-3 py-2 rounded-xl bg-slate-900/60 border border-slate-600 text-white text-sm">
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="scheduled">Scheduled</option>
          <option value="closed">Closed</option>
        </select>
        <select value={type} onChange={e => setType(e.target.value as typeof type)}
                className="px-3 py-2 rounded-xl bg-slate-900/60 border border-slate-600 text-white text-sm">
          <option value="">All types</option>
          <option value="class">Class</option>
          <option value="test">Test</option>
          <option value="exam">Exam</option>
        </select>
      </div>

      {error && (
        <p className="text-sm text-red-400 bg-red-900/20 border border-red-800/40 rounded-xl px-4 py-2">{error}</p>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        {/* Grouped sessions */}
        <div className="space-y-4">
          {grouped.length === 0 ? (
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-10 text-center">
              <span className="text-4xl">🗓️</span>
              <p className="text-white font-medium mt-3">No sessions found</p>
              <p className="text-slate-400 text-sm mt-1">Try adjusting the filters.</p>
            </div>
          ) : (
            grouped.map(({ dept, sessionCount, courses }) => (
              <div key={dept} className="bg-slate-800/50 border border-slate-700/50 rounded-2xl overflow-hidden">
                <div className="px-4 py-3 border-b border-slate-700/80 flex items-center justify-between">
                  <h3 className="text-white font-semibold text-sm">{dept}</h3>
                  <span className="text-xs text-slate-400">
                    {courses.length} course{courses.length === 1 ? "" : "s"} · {sessionCount} session{sessionCount === 1 ? "" : "s"}
                  </span>
                </div>
                <div className="p-3 space-y-4">
                  {courses.map(course => (
                    <div key={course.courseId}>
                      {/* Course header with combined download */}
                      <div className="flex items-center justify-between gap-2 mb-2 px-1">
                        <div className="min-w-0">
                          <p className="text-slate-200 text-sm font-semibold truncate">{course.courseCode}</p>
                          <p className="text-slate-500 text-xs truncate">{course.courseName}</p>
                        </div>
                        <button
                          type="button"
                          onClick={e => handleDownloadCourse(course, e)}
                          disabled={downloadingCourseId === course.courseId}
                          title="Download all sessions of this course as one CSV"
                          className="text-xs px-2.5 py-1.5 rounded-lg bg-emerald-600/20 border border-emerald-600/40 text-emerald-300 hover:bg-emerald-600/30 shrink-0 inline-flex items-center gap-1 disabled:opacity-50"
                        >
                          {downloadingCourseId === course.courseId ? "Preparing…" : `↓ All (${course.sessions.length})`}
                        </button>
                      </div>
                      <div className="space-y-2">
                        {course.sessions.map(s => {
                          const pct = s.expectedCount > 0 ? Math.round((s.presentCount / s.expectedCount) * 100) : 0;
                          const isSelected = selectedSessionId === s._id;
                          return (
                            <div
                              key={s._id}
                              onClick={() => setSelectedSessionId(s._id)}
                              className={`w-full text-left rounded-xl p-3 border transition-colors cursor-pointer ${
                                isSelected ? "border-emerald-500/60 bg-emerald-900/15" : "border-slate-700/50 bg-slate-700/20 hover:bg-slate-700/35"
                              }`}
                            >
                              <div className="flex justify-between items-start gap-2">
                                <div className="min-w-0">
                                  <p className="text-white font-medium text-sm truncate">
                                    <span className="mr-1">{sessionTypeIcon(s.type)}</span>
                                    {s.title}
                                  </p>
                                  <p className="text-slate-500 text-xs mt-0.5 truncate">
                                    {s.lecturerName || "—"} · {s.location} · {new Date(s.scheduledAt).toLocaleString()}
                                  </p>
                                </div>
                                <span className={`text-[10px] uppercase px-2 py-0.5 rounded-full shrink-0 ${
                                  s.status === "active" ? "bg-emerald-900/50 text-emerald-300"
                                    : s.status === "closed" ? "bg-slate-600/50 text-slate-300"
                                    : "bg-amber-900/50 text-amber-300"
                                }`}>
                                  {s.status}
                                </span>
                              </div>
                              <div className="mt-2 flex items-center gap-2">
                                <div className="flex-1 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                                  <div className="h-full bg-emerald-500" style={{ width: `${Math.min(pct, 100)}%` }} />
                                </div>
                                <span className="text-xs text-slate-400 shrink-0">{s.presentCount}/{s.expectedCount}</span>
                                <button
                                  type="button"
                                  onClick={e => handleDownload(s, e)}
                                  disabled={downloadingId === s._id}
                                  className="text-xs px-2 py-1 rounded-lg border border-slate-600 text-slate-200 hover:bg-slate-700/50 shrink-0"
                                >
                                  {downloadingId === s._id ? "…" : "↓ CSV"}
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Detail panel */}
        <SessionDetailPanel
          sessionId={selectedSessionId}
          onRefreshSessions={load}
          onOpenScanner={id => {
            if (typeof window !== "undefined") sessionStorage.setItem("activeAttendanceSessionId", id);
            onOpenScanner?.(id);
          }}
        />
      </div>
    </div>
  );
}
