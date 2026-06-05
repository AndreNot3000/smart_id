"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { attendanceService } from "@/lib/attendanceService";

interface AttendanceAnalyticsProps {
  courseId: string;
  courseCode?: string;
}

const CHART_COLORS = {
  primary: "#34d399",
  secondary: "#60a5fa",
  accent: "#a78bfa",
  warn: "#fbbf24",
  muted: "#64748b",
};

const TYPE_COLORS: Record<string, string> = {
  class: "#34d399",
  test: "#60a5fa",
  exam: "#a78bfa",
};

function RateTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value: number; name: string; payload?: { sessions?: number } }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  const row = payload[0].payload;
  return (
    <div className="rounded-lg border border-slate-600 bg-slate-900/95 px-3 py-2 shadow-xl text-xs">
      <p className="text-slate-400 mb-1">{label}</p>
      <p className="text-emerald-400 font-semibold">{payload[0].value}% attendance</p>
      {row?.sessions != null && row.sessions > 0 && (
        <p className="text-slate-500 mt-0.5">{row.sessions} session(s)</p>
      )}
    </div>
  );
}

export default function AttendanceAnalytics({ courseId, courseCode }: AttendanceAnalyticsProps) {
  const [days, setDays] = useState(30);
  const [threshold, setThreshold] = useState(60);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [daily, setDaily] = useState<
    Array<{ date: string; sessions: number; rate: number; label: string }>
  >([]);
  const [types, setTypes] = useState<Array<{ type: string; rate: number; sessions: number; label: string }>>([]);
  const [courses, setCourses] = useState<
    Array<{ courseCode: string; rate: number; sessions: number; name: string }>
  >([]);
  const [totals, setTotals] = useState({ rate: 0, sessions: 0, present: 0, expected: 0 });
  const [atRisk, setAtRisk] = useState<
    Array<{
      studentId: string;
      name: string;
      studentNumber: string;
      department: string;
      year: string;
      rate: number;
      present: number;
      expected: number;
      avatar: string | null;
    }>
  >([]);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [analytics, risk] = await Promise.all([
        attendanceService.getAnalytics({ days, courseId }),
        attendanceService.getAtRisk({ days, threshold, courseId }),
      ]);

      setTotals(analytics.totals);

      setDaily(
        analytics.daily
          .filter(d => d.sessions > 0 || d.rate > 0)
          .map(d => ({
            ...d,
            label: new Date(d.date + "T12:00:00").toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
            }),
          }))
      );

      setTypes(
        analytics.types
          .filter(t => t.sessions > 0)
          .map(t => ({
            ...t,
            label: t.type.charAt(0).toUpperCase() + t.type.slice(1),
          }))
      );

      setCourses(
        analytics.courses.map(c => ({
          courseCode: c.courseCode,
          rate: c.rate,
          sessions: c.sessions,
          name: c.courseName.length > 18 ? c.courseCode : c.courseName,
        }))
      );

      setAtRisk(risk.atRisk);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load analytics");
    } finally {
      setLoading(false);
    }
  }, [courseId, days, threshold]);

  useEffect(() => {
    if (courseId) load();
  }, [courseId, load]);

  const pieData = useMemo(
    () =>
      types.map(t => ({
        name: t.label,
        value: t.sessions,
        fill: TYPE_COLORS[t.type] || CHART_COLORS.muted,
      })),
    [types]
  );

  const hasChartData = daily.length > 0 || types.length > 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-indigo-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3 bg-slate-800/50 border border-slate-700/50 rounded-2xl p-4">
        <div>
          <label className="text-slate-400 text-xs block mb-1">Period</label>
          <div className="flex rounded-lg border border-slate-600 overflow-hidden">
            {[7, 30, 90].map(d => (
              <button
                key={d}
                type="button"
                onClick={() => setDays(d)}
                className={`px-3 py-1.5 text-sm ${
                  days === d ? "bg-indigo-600 text-white" : "text-slate-400 hover:bg-slate-700/50"
                }`}
              >
                {d}d
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="text-slate-400 text-xs block mb-1">At-risk below (%)</label>
          <select
            value={threshold}
            onChange={e => setThreshold(Number(e.target.value))}
            className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-600 text-white text-sm"
          >
            {[50, 60, 70, 75].map(t => (
              <option key={t} value={t}>
                {t}%
              </option>
            ))}
          </select>
        </div>
        {courseCode && (
          <p className="text-slate-400 text-sm ml-auto">
            Showing data for <span className="text-white font-medium">{courseCode}</span>
          </p>
        )}
      </div>

      {error && (
        <p className="text-sm text-red-400 bg-red-900/20 rounded-xl px-4 py-2 border border-red-800/40">
          {error}
        </p>
      )}

      {/* Summary row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-gradient-to-br from-emerald-900/30 to-slate-800/50 border border-emerald-800/30 rounded-2xl p-4">
          <p className="text-3xl font-bold text-emerald-400">{totals.rate}%</p>
          <p className="text-slate-400 text-xs mt-1">Overall attendance</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-4">
          <p className="text-3xl font-bold text-blue-400">{totals.sessions}</p>
          <p className="text-slate-400 text-xs mt-1">Sessions held</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-4">
          <p className="text-3xl font-bold text-white">{totals.present}</p>
          <p className="text-slate-400 text-xs mt-1">Present marks</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-4">
          <p className="text-3xl font-bold text-amber-400">{atRisk.length}</p>
          <p className="text-slate-400 text-xs mt-1">At-risk students</p>
        </div>
      </div>

      {!hasChartData ? (
        <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-12 text-center">
          <span className="text-4xl">📊</span>
          <p className="text-white font-medium mt-3">No attendance data yet</p>
          <p className="text-slate-400 text-sm mt-1">
            Create sessions and take attendance to see charts here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
          {/* Daily trend */}
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-5 xl:col-span-2">
            <h3 className="text-white font-semibold mb-1">Attendance rate over time</h3>
            <p className="text-slate-500 text-xs mb-4">Daily % across closed and active sessions</p>
            {daily.length === 0 ? (
              <p className="text-slate-500 text-sm py-8 text-center">No daily data in this period</p>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={daily} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                  <defs>
                    <linearGradient id="rateGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={CHART_COLORS.primary} stopOpacity={0.35} />
                      <stop offset="95%" stopColor={CHART_COLORS.primary} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="label" tick={{ fill: "#94a3b8", fontSize: 11 }} />
                  <YAxis
                    domain={[0, 100]}
                    tick={{ fill: "#94a3b8", fontSize: 11 }}
                    tickFormatter={v => `${v}%`}
                  />
                  <Tooltip content={<RateTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="rate"
                    name="Attendance rate"
                    stroke={CHART_COLORS.primary}
                    fill="url(#rateGrad)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* By session type */}
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-5">
            <h3 className="text-white font-semibold mb-1">By session type</h3>
            <p className="text-slate-500 text-xs mb-4">Attendance rate: class vs test vs exam</p>
            {types.length === 0 ? (
              <p className="text-slate-500 text-sm py-8 text-center">No sessions by type</p>
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={types} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="label" tick={{ fill: "#94a3b8", fontSize: 11 }} />
                  <YAxis
                    domain={[0, 100]}
                    tick={{ fill: "#94a3b8", fontSize: 11 }}
                    tickFormatter={v => `${v}%`}
                  />
                  <Tooltip content={<RateTooltip />} />
                  <Bar dataKey="rate" name="Rate" radius={[6, 6, 0, 0]}>
                    {types.map(t => (
                      <Cell key={t.type} fill={TYPE_COLORS[t.type] || CHART_COLORS.secondary} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Session count pie */}
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-5">
            <h3 className="text-white font-semibold mb-1">Sessions breakdown</h3>
            <p className="text-slate-500 text-xs mb-4">Share of sessions by type</p>
            {pieData.length === 0 ? (
              <p className="text-slate-500 text-sm py-8 text-center">No sessions</p>
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                  >
                    {pieData.map(entry => (
                      <Cell key={entry.name} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: "#0f172a",
                      border: "1px solid #475569",
                      borderRadius: 8,
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: 12, color: "#94a3b8" }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* All courses comparison — useful when viewing one course may show single bar */}
          {courses.length > 1 && (
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-5 xl:col-span-2">
              <h3 className="text-white font-semibold mb-1">Compare courses</h3>
              <p className="text-slate-500 text-xs mb-4">Attendance rate per course (same period)</p>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart
                  data={courses}
                  layout="vertical"
                  margin={{ top: 4, right: 16, left: 8, bottom: 4 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={false} />
                  <XAxis type="number" domain={[0, 100]} tick={{ fill: "#94a3b8", fontSize: 11 }} />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={72}
                    tick={{ fill: "#94a3b8", fontSize: 11 }}
                  />
                  <Tooltip content={<RateTooltip />} />
                  <Bar dataKey="rate" name="Rate" fill={CHART_COLORS.secondary} radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}

      {/* At-risk students */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-slate-700/80">
          <h3 className="text-white font-semibold">At-risk students</h3>
          <p className="text-slate-500 text-xs mt-0.5">
            Below {threshold}% attendance over the last {days} days
          </p>
        </div>
        {atRisk.length === 0 ? (
          <p className="text-slate-400 text-sm text-center py-10">No students below the threshold</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-slate-400 text-left border-b border-slate-700/80">
                  <th className="px-5 py-3 font-medium">Student</th>
                  <th className="px-3 py-3 font-medium">Dept / Year</th>
                  <th className="px-3 py-3 font-medium">Present</th>
                  <th className="px-3 py-3 font-medium">Expected</th>
                  <th className="px-5 py-3 font-medium text-right">Rate</th>
                </tr>
              </thead>
              <tbody>
                {atRisk.map(s => (
                  <tr key={s.studentId} className="border-b border-slate-700/40 hover:bg-slate-700/20">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-slate-600 flex items-center justify-center text-xs text-white overflow-hidden shrink-0">
                          {s.avatar ? (
                            <img src={s.avatar} alt="" className="h-full w-full object-cover" />
                          ) : (
                            s.name.charAt(0)
                          )}
                        </div>
                        <div>
                          <p className="text-white font-medium">{s.name}</p>
                          <p className="text-slate-500 text-xs">{s.studentNumber}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-slate-400 text-xs">
                      {s.department}
                      <br />
                      {s.year}
                    </td>
                    <td className="px-3 py-3 text-emerald-400">{s.present}</td>
                    <td className="px-3 py-3 text-slate-300">{s.expected}</td>
                    <td className="px-5 py-3 text-right">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${
                          s.rate < 40
                            ? "bg-red-900/40 text-red-300"
                            : "bg-amber-900/40 text-amber-300"
                        }`}
                      >
                        {s.rate}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
