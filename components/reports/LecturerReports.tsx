"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/components/dashboard";
import { AttendanceAnalytics } from "@/components/attendance";
import { getApiUrl } from "@/lib/config";

interface CourseRow {
  _id: string;
  courseCode: string;
  courseName: string;
}

export default function LecturerReports() {
  const [courses, setCourses] = useState<CourseRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedId, setSelectedId] = useState<string>("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const token = sessionStorage.getItem("accessToken");
        const res = await fetch(getApiUrl("/api/course/gradebook/courses"), {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          const list: CourseRow[] = (data.courses || []).map((c: any) => ({
            _id: c._id,
            courseCode: c.courseCode,
            courseName: c.courseName,
          }));
          setCourses(list);
          if (list.length > 0) setSelectedId(list[0]._id);
        } else {
          setError("Failed to load your courses.");
        }
      } catch {
        setError("Failed to load your courses.");
      }
      setLoading(false);
    };
    load();
  }, []);

  const selected = courses.find((c) => c._id === selectedId);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-[var(--text-primary)] text-2xl font-semibold tracking-tight">Reports &amp; Analytics</h2>
        <p className="text-[var(--text-muted)] text-sm mt-1">
          Attendance insights for each of your courses — trends, session breakdowns, and students who need attention.
        </p>
      </div>

      {loading ? (
        <div className="section-card text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-[var(--accent)] border-t-transparent mx-auto mb-3" />
          <p className="text-[var(--text-muted)] text-sm">Loading your courses…</p>
        </div>
      ) : error ? (
        <div className="flex items-start gap-2 text-sm p-3 rounded-lg"
             style={{ background: "color-mix(in srgb, var(--danger) 12%, transparent)", color: "var(--danger)" }}>
          <Icon name="alert" size={16} /><span>{error}</span>
        </div>
      ) : courses.length === 0 ? (
        <div className="section-card text-center py-12">
          <div className="h-12 w-12 rounded-full mx-auto mb-4 flex items-center justify-center"
               style={{ background: "var(--accent-soft)", color: "var(--accent)" }}>
            <Icon name="trendingUp" size={22} />
          </div>
          <p className="text-[var(--text-primary)] font-medium">No courses assigned</p>
          <p className="text-[var(--text-muted)] text-sm mt-1">
            Once the admin assigns you a course and you take attendance, analytics will appear here.
          </p>
        </div>
      ) : (
        <>
          {/* Course picker */}
          <div className="section-card">
            <label className="metric-label block mb-2">Course</label>
            <div className="flex flex-wrap gap-2">
              {courses.map((co) => (
                <button
                  key={co._id}
                  type="button"
                  onClick={() => setSelectedId(co._id)}
                  className={selectedId === co._id ? "btn btn-primary text-sm" : "btn btn-ghost text-sm"}
                >
                  {co.courseCode}
                </button>
              ))}
            </div>
            {selected && (
              <p className="text-[var(--text-muted)] text-xs mt-2">{selected.courseName}</p>
            )}
          </div>

          {selectedId && (
            <AttendanceAnalytics courseId={selectedId} courseCode={selected?.courseCode} />
          )}
        </>
      )}
    </div>
  );
}
