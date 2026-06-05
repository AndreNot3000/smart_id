"use client";

import { useEffect, useState } from "react";
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
import { Icon } from "@/components/dashboard";
import { getApiUrl } from "@/lib/config";

interface OverviewData {
  counts: { student: number; lecturer: number; admin: number; total: number };
  status: { active: number; pending: number; suspended: number };
  growth: Array<{ month: string; students: number; lecturers: number }>;
  byDepartment: Array<{ department: string; count: number }>;
  byLevel: Array<{ level: string; count: number }>;
  months: number;
}

const COLORS = {
  student: "#34d399",
  lecturer: "#60a5fa",
  accent: "#a78bfa",
  active: "#34d399",
  pending: "#fbbf24",
  suspended: "#f87171",
};

const LEVEL_COLORS = ["#34d399", "#60a5fa", "#a78bfa", "#fbbf24", "#f472b6", "#22d3ee", "#fb923c"];

export default function AdminReports() {
  const [data, setData] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [months, setMonths] = useState(6);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const token = sessionStorage.getItem("accessToken");
        const res = await fetch(getApiUrl(`/api/admin/reports/overview?months=${months}`), {
          headers: { Authorization: `Bearer ${token}` },
        });
        const json = await res.json();
        if (res.ok) setData(json);
        else setError(json.error || "Failed to load overview.");
      } catch {
        setError("Failed to load overview.");
      }
      setLoading(false);
    };
    load();
  }, [months]);

  const statusPie = data
    ? [
        { name: "Active", value: data.status.active, fill: COLORS.active },
        { name: "Pending", value: data.status.pending, fill: COLORS.pending },
        { name: "Suspended", value: data.status.suspended, fill: COLORS.suspended },
      ].filter((s) => s.value > 0)
    : [];

  const hasGrowth = !!data?.growth.some((g) => g.students > 0 || g.lecturers > 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-[var(--text-primary)] text-2xl font-semibold tracking-tight">Reports &amp; Analytics</h2>
          <p className="text-[var(--text-muted)] text-sm mt-1">
            Institution overview — headcount, account status, growth, and breakdown by department and level.
          </p>
        </div>
        <div className="flex rounded-lg border border-[var(--border,#334155)] overflow-hidden">
          {[6, 12, 24].map((m) => (
            <button key={m} type="button" onClick={() => setMonths(m)}
                    className={`px-3 py-1.5 text-sm ${months === m ? "bg-[var(--accent)] text-white" : "text-[var(--text-muted)] hover:bg-[var(--surface-2,rgba(148,163,184,0.1))]"}`}>
              {m}mo
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-2 text-sm p-3 rounded-lg"
             style={{ background: "color-mix(in srgb, var(--danger) 12%, transparent)", color: "var(--danger)" }}>
          <Icon name="alert" size={16} /><span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="section-card text-center py-16">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-[var(--accent)] border-t-transparent mx-auto" />
        </div>
      ) : !data ? null : (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="section-card">
              <p className="text-3xl font-bold" style={{ color: COLORS.student }}>{data.counts.student}</p>
              <p className="text-[var(--text-muted)] text-xs mt-1">Students</p>
            </div>
            <div className="section-card">
              <p className="text-3xl font-bold" style={{ color: COLORS.lecturer }}>{data.counts.lecturer}</p>
              <p className="text-[var(--text-muted)] text-xs mt-1">Lecturers</p>
            </div>
            <div className="section-card">
              <p className="text-3xl font-bold text-[var(--text-primary)]">{data.counts.total}</p>
              <p className="text-[var(--text-muted)] text-xs mt-1">Total accounts</p>
            </div>
            <div className="section-card">
              <p className="text-3xl font-bold" style={{ color: COLORS.pending }}>{data.status.pending}</p>
              <p className="text-[var(--text-muted)] text-xs mt-1">Pending activation</p>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
            {/* Growth */}
            <div className="section-card xl:col-span-2">
              <h3 className="section-title">Account growth</h3>
              <p className="section-subtitle mb-4">New students &amp; lecturers per month</p>
              {!hasGrowth ? (
                <p className="text-[var(--text-muted)] text-sm py-8 text-center">No new accounts in this period.</p>
              ) : (
                <ResponsiveContainer width="100%" height={260}>
                  <AreaChart data={data.growth} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                    <defs>
                      <linearGradient id="gStud" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={COLORS.student} stopOpacity={0.35} />
                        <stop offset="95%" stopColor={COLORS.student} stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="gLec" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={COLORS.lecturer} stopOpacity={0.35} />
                        <stop offset="95%" stopColor={COLORS.lecturer} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="month" tick={{ fill: "#94a3b8", fontSize: 11 }} />
                    <YAxis allowDecimals={false} tick={{ fill: "#94a3b8", fontSize: 11 }} />
                    <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #475569", borderRadius: 8 }} />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    <Area type="monotone" dataKey="students" name="Students" stroke={COLORS.student} fill="url(#gStud)" strokeWidth={2} />
                    <Area type="monotone" dataKey="lecturers" name="Lecturers" stroke={COLORS.lecturer} fill="url(#gLec)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Status donut */}
            <div className="section-card">
              <h3 className="section-title">Account status</h3>
              <p className="section-subtitle mb-4">Active vs pending vs suspended</p>
              {statusPie.length === 0 ? (
                <p className="text-[var(--text-muted)] text-sm py-8 text-center">No accounts yet.</p>
              ) : (
                <ResponsiveContainer width="100%" height={240}>
                  <PieChart>
                    <Pie data={statusPie} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3}>
                      {statusPie.map((s) => <Cell key={s.name} fill={s.fill} />)}
                    </Pie>
                    <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #475569", borderRadius: 8 }} />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* By level */}
            <div className="section-card">
              <h3 className="section-title">Students by level</h3>
              <p className="section-subtitle mb-4">Distribution across levels</p>
              {data.byLevel.length === 0 ? (
                <p className="text-[var(--text-muted)] text-sm py-8 text-center">No students yet.</p>
              ) : (
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={data.byLevel} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="level" tick={{ fill: "#94a3b8", fontSize: 11 }} />
                    <YAxis allowDecimals={false} tick={{ fill: "#94a3b8", fontSize: 11 }} />
                    <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #475569", borderRadius: 8 }} />
                    <Bar dataKey="count" name="Students" radius={[6, 6, 0, 0]}>
                      {data.byLevel.map((_, i) => <Cell key={i} fill={LEVEL_COLORS[i % LEVEL_COLORS.length]} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* By department */}
            <div className="section-card xl:col-span-2">
              <h3 className="section-title">Students by department</h3>
              <p className="section-subtitle mb-4">Headcount per department</p>
              {data.byDepartment.length === 0 ? (
                <p className="text-[var(--text-muted)] text-sm py-8 text-center">No students yet.</p>
              ) : (
                <ResponsiveContainer width="100%" height={Math.max(220, data.byDepartment.length * 38)}>
                  <BarChart data={data.byDepartment} layout="vertical" margin={{ top: 4, right: 16, left: 8, bottom: 4 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={false} />
                    <XAxis type="number" allowDecimals={false} tick={{ fill: "#94a3b8", fontSize: 11 }} />
                    <YAxis type="category" dataKey="department" width={120} tick={{ fill: "#94a3b8", fontSize: 11 }} />
                    <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #475569", borderRadius: 8 }} />
                    <Bar dataKey="count" name="Students" fill={COLORS.accent} radius={[0, 6, 6, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
