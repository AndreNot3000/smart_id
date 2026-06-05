"use client";

import { useEffect, useMemo, useState } from "react";
import { Icon } from "@/components/dashboard";
import { getApiUrl } from "@/lib/config";

type ComponentType = "manual" | "assignment";

interface Component {
  id: string;
  name: string;
  type: ComponentType;
  assignmentId?: string;
  maxScore: number;
  weight: number;
}

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

interface CourseRow {
  _id: string;
  courseCode: string;
  courseName: string;
  credits: number;
  hasScheme: boolean;
  published: boolean;
}

interface RosterStudent {
  studentId: string;
  name: string;
  studentNumber: string;
}

interface AssignmentOption {
  _id: string;
  title: string;
  maxScore: number;
}

function newId() {
  return `c_${Math.random().toString(36).slice(2, 10)}`;
}

function gradeFor(pct: number, scale: GradeScale): GradeBand {
  for (const b of scale.bands) {
    if (pct >= b.min && pct <= b.max) return b;
  }
  return scale.bands[scale.bands.length - 1] || { min: 0, max: 0, letter: "-", point: 0 };
}

function computeFinal(components: Component[], studentScores: Record<string, number | undefined>): number {
  const totalWeight = components.reduce((s, c) => s + (Number(c.weight) || 0), 0);
  if (totalWeight <= 0) return 0;
  let earned = 0;
  for (const c of components) {
    const max = Number(c.maxScore) || 0;
    if (max <= 0) continue;
    const raw = studentScores[c.id];
    const score = Math.max(0, Math.min(Number(raw) || 0, max));
    earned += (score / max) * (Number(c.weight) || 0);
  }
  return Math.round((earned / totalWeight) * 100 * 100) / 100;
}

export default function LecturerGradebook() {
  const [courses, setCourses] = useState<CourseRow[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);

  // Loaded gradebook
  const [loading, setLoading] = useState(false);
  const [course, setCourse] = useState<any>(null);
  const [savedComponents, setSavedComponents] = useState<Component[]>([]);
  const [roster, setRoster] = useState<RosterStudent[]>([]);
  const [fetchedScores, setFetchedScores] = useState<Record<string, Record<string, number>>>({});
  const [assignments, setAssignments] = useState<AssignmentOption[]>([]);
  const [scale, setScale] = useState<GradeScale>({ scaleMax: 5, bands: [] });
  const [published, setPublished] = useState(false);

  // Editable local state
  const [components, setComponents] = useState<Component[]>([]);
  const [scoreEdits, setScoreEdits] = useState<Record<string, Record<string, string>>>({});

  const [savingScheme, setSavingScheme] = useState(false);
  const [savingScores, setSavingScores] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const token = () => sessionStorage.getItem("accessToken");

  const fetchCourses = async () => {
    setLoadingCourses(true);
    try {
      const res = await fetch(getApiUrl("/api/course/gradebook/courses"), {
        headers: { Authorization: `Bearer ${token()}` },
      });
      if (res.ok) {
        const data = await res.json();
        setCourses(data.courses || []);
      } else {
        setError("Failed to load your courses.");
      }
    } catch {
      setError("Failed to load your courses.");
    }
    setLoadingCourses(false);
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const loadGradebook = async (courseId: string) => {
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const res = await fetch(getApiUrl(`/api/course/${courseId}/gradebook`), {
        headers: { Authorization: `Bearer ${token()}` },
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to load gradebook.");
        setLoading(false);
        return;
      }
      setCourse(data.course);
      setSavedComponents(data.scheme.components || []);
      setComponents(JSON.parse(JSON.stringify(data.scheme.components || [])));
      setPublished(!!data.scheme.published);
      setRoster(data.roster || []);
      setFetchedScores(data.scores || {});
      setAssignments(data.assignments || []);
      setScale(data.scale || { scaleMax: 5, bands: [] });

      // Seed editable manual scores from fetched values.
      const edits: Record<string, Record<string, string>> = {};
      for (const s of data.roster || []) {
        edits[s.studentId] = {};
        const row = (data.scores || {})[s.studentId] || {};
        for (const comp of data.scheme.components || []) {
          if (comp.type === "manual" && row[comp.id] !== undefined) {
            edits[s.studentId][comp.id] = String(row[comp.id]);
          }
        }
      }
      setScoreEdits(edits);
    } catch {
      setError("Failed to load gradebook.");
    }
    setLoading(false);
  };

  const openCourse = (courseId: string) => {
    setSelectedCourseId(courseId);
    loadGradebook(courseId);
  };

  const backToCourses = () => {
    setSelectedCourseId(null);
    setCourse(null);
    setError("");
    setSuccess("");
    fetchCourses();
  };

  // ---- Scheme editing ----
  const totalWeight = useMemo(() => components.reduce((s, c) => s + (Number(c.weight) || 0), 0), [components]);

  const updateComponent = (idx: number, patch: Partial<Component>) => {
    setComponents((prev) => prev.map((c, i) => (i === idx ? { ...c, ...patch } : c)));
    setSuccess("");
  };

  const addComponent = (type: ComponentType) => {
    setComponents((prev) => [...prev, { id: newId(), name: type === "manual" ? "Exam" : "", type, maxScore: 100, weight: 0 }]);
    setSuccess("");
  };

  const removeComponent = (idx: number) => {
    setComponents((prev) => prev.filter((_, i) => i !== idx));
    setSuccess("");
  };

  const onPickAssignment = (idx: number, assignmentId: string) => {
    const a = assignments.find((x) => x._id === assignmentId);
    updateComponent(idx, { assignmentId, maxScore: a?.maxScore || 100, name: a?.title || components[idx].name });
  };

  const saveScheme = async () => {
    setError("");
    setSuccess("");
    for (const c of components) {
      if (!c.name.trim()) return setError("Every component needs a name.");
      if (!c.maxScore || c.maxScore <= 0) return setError(`"${c.name || "Component"}" needs a max score greater than 0.`);
      if (c.type === "assignment" && !c.assignmentId) return setError(`"${c.name}" must have an assignment selected.`);
    }
    if (components.length === 0) return setError("Add at least one component.");

    setSavingScheme(true);
    try {
      const res = await fetch(getApiUrl(`/api/course/${selectedCourseId}/gradebook/scheme`), {
        method: "PUT",
        headers: { Authorization: `Bearer ${token()}`, "Content-Type": "application/json" },
        body: JSON.stringify({ components }),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess("Scheme saved.");
        await loadGradebook(selectedCourseId!);
      } else {
        setError(data.error || "Failed to save scheme.");
      }
    } catch {
      setError("Failed to save scheme.");
    }
    setSavingScheme(false);
  };

  // ---- Score editing ----
  // Scores can't exceed the component's max. We clamp as the lecturer types so
  // it's impossible to record an out-of-range score (e.g. > 70 when max is 70).
  const setScore = (studentId: string, componentId: string, value: string, max: number) => {
    let next = value;
    if (value !== "") {
      const num = Number(value);
      if (!isNaN(num)) {
        if (num > max) {
          next = String(max);
          setError(`Score can't be more than the max (${max}).`);
        } else {
          if (num < 0) next = "0";
          setError("");
        }
      }
    } else {
      setError("");
    }
    setScoreEdits((prev) => ({ ...prev, [studentId]: { ...(prev[studentId] || {}), [componentId]: next } }));
    setSuccess("");
  };

  const getStudentScores = (studentId: string): Record<string, number | undefined> => {
    const out: Record<string, number | undefined> = {};
    for (const comp of savedComponents) {
      if (comp.type === "assignment") {
        out[comp.id] = fetchedScores[studentId]?.[comp.id];
      } else {
        const v = scoreEdits[studentId]?.[comp.id];
        out[comp.id] = v === "" || v === undefined ? undefined : Number(v);
      }
    }
    return out;
  };

  const saveScores = async () => {
    setError("");
    setSuccess("");
    const entries: Array<{ studentId: string; componentId: string; score: number | null }> = [];
    const manualComps = savedComponents.filter((c) => c.type === "manual");
    for (const s of roster) {
      for (const comp of manualComps) {
        const v = scoreEdits[s.studentId]?.[comp.id];
        if (v === undefined || v === "") {
          entries.push({ studentId: s.studentId, componentId: comp.id, score: null });
        } else {
          const num = Number(v);
          if (isNaN(num) || num < 0) return setError(`Invalid score for ${s.name}.`);
          if (num > comp.maxScore) return setError(`${s.name}: ${comp.name} score can't exceed ${comp.maxScore}.`);
          entries.push({ studentId: s.studentId, componentId: comp.id, score: num });
        }
      }
    }
    setSavingScores(true);
    try {
      const res = await fetch(getApiUrl(`/api/course/${selectedCourseId}/gradebook/scores`), {
        method: "PUT",
        headers: { Authorization: `Bearer ${token()}`, "Content-Type": "application/json" },
        body: JSON.stringify({ scores: entries }),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess("Scores saved.");
      } else {
        setError(data.error || "Failed to save scores.");
      }
    } catch {
      setError("Failed to save scores.");
    }
    setSavingScores(false);
  };

  const togglePublish = async () => {
    setError("");
    setSuccess("");
    setPublishing(true);
    try {
      const res = await fetch(getApiUrl(`/api/course/${selectedCourseId}/gradebook/publish`), {
        method: "POST",
        headers: { Authorization: `Bearer ${token()}`, "Content-Type": "application/json" },
        body: JSON.stringify({ published: !published }),
      });
      const data = await res.json();
      if (res.ok) {
        setPublished(data.published);
        setSuccess(data.published ? "Results published — students can now see their grades and GPA." : "Results unpublished.");
      } else {
        setError(data.error || "Failed to update publish state.");
      }
    } catch {
      setError("Failed to update publish state.");
    }
    setPublishing(false);
  };

  // ---------- RENDER ----------

  if (selectedCourseId === null) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-[var(--text-primary)] text-2xl font-semibold tracking-tight">Grades &amp; Assessment</h2>
          <p className="text-[var(--text-muted)] text-sm mt-1">
            Build each course&apos;s grade from tests, assignments and exams. The system calculates every student&apos;s final
            grade and GPA automatically.
          </p>
        </div>

        {error && (
          <div className="flex items-start gap-2 text-sm p-3 rounded-lg"
               style={{ background: "color-mix(in srgb, var(--danger) 12%, transparent)", color: "var(--danger)" }}>
            <Icon name="alert" size={16} /><span>{error}</span>
          </div>
        )}

        {loadingCourses ? (
          <div className="section-card text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-[var(--accent)] border-t-transparent mx-auto mb-3" />
            <p className="text-[var(--text-muted)] text-sm">Loading your courses…</p>
          </div>
        ) : courses.length === 0 ? (
          <div className="section-card text-center py-12">
            <div className="h-12 w-12 rounded-full mx-auto mb-4 flex items-center justify-center"
                 style={{ background: "var(--accent-soft)", color: "var(--accent)" }}>
              <Icon name="award" size={22} />
            </div>
            <p className="text-[var(--text-primary)] font-medium">No courses assigned</p>
            <p className="text-[var(--text-muted)] text-sm mt-1">You can only grade courses the admin has assigned to you.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {courses.map((co) => (
              <button key={co._id} type="button" onClick={() => openCourse(co._id)}
                      className="section-card surface-hover text-left">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[var(--text-primary)] font-semibold truncate">{co.courseCode}</p>
                    <p className="text-[var(--text-muted)] text-sm truncate">{co.courseName}</p>
                  </div>
                  <div className="h-9 w-9 rounded-lg flex items-center justify-center shrink-0"
                       style={{ background: "var(--accent-soft)", color: "var(--accent)" }}>
                    <Icon name="award" size={18} />
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-2 flex-wrap">
                  <span className="text-xs text-[var(--text-muted)]">{co.credits} credit{co.credits === 1 ? "" : "s"}</span>
                  {co.published ? (
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium"
                          style={{ background: "color-mix(in srgb, var(--success) 16%, transparent)", color: "var(--success)" }}>
                      Published
                    </span>
                  ) : co.hasScheme ? (
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium"
                          style={{ background: "color-mix(in srgb, var(--warning) 16%, transparent)", color: "var(--warning)" }}>
                      Draft
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium"
                          style={{ background: "var(--surface-2, rgba(148,163,184,0.12))", color: "var(--text-muted)" }}>
                      Not set up
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Course gradebook view
  return (
    <div className="space-y-6">
      <button type="button" onClick={backToCourses} className="btn btn-ghost text-sm">
        <Icon name="chevronLeft" size={16} /> All courses
      </button>

      {loading ? (
        <div className="section-card text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-[var(--accent)] border-t-transparent mx-auto mb-3" />
          <p className="text-[var(--text-muted)] text-sm">Loading gradebook…</p>
        </div>
      ) : !course ? (
        <div className="section-card text-center py-12">
          <p className="text-[var(--text-muted)] text-sm">{error || "Could not load this course."}</p>
        </div>
      ) : (
        <>
          {/* Header */}
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0">
              <h2 className="text-[var(--text-primary)] text-xl font-semibold tracking-tight truncate">
                {course.courseCode} — {course.courseName}
              </h2>
              <p className="text-[var(--text-muted)] text-sm mt-1">
                {course.credits} credit{course.credits === 1 ? "" : "s"} · {course.level} · {roster.length} student{roster.length === 1 ? "" : "s"}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className={`px-2.5 py-1 rounded-full text-xs font-medium`}
                    style={published
                      ? { background: "color-mix(in srgb, var(--success) 16%, transparent)", color: "var(--success)" }
                      : { background: "color-mix(in srgb, var(--warning) 16%, transparent)", color: "var(--warning)" }}>
                {published ? "Published" : "Draft"}
              </span>
              <button type="button" onClick={togglePublish} disabled={publishing || savedComponents.length === 0}
                      className={published ? "btn btn-ghost text-sm" : "btn btn-primary text-sm"}>
                {publishing ? "…" : published ? (<><Icon name="close" size={15} />Unpublish</>) : (<><Icon name="check" size={15} />Publish results</>)}
              </button>
            </div>
          </div>

          {error && (
            <div className="flex items-start gap-2 text-sm p-3 rounded-lg"
                 style={{ background: "color-mix(in srgb, var(--danger) 12%, transparent)", color: "var(--danger)" }}>
              <Icon name="alert" size={16} /><span>{error}</span>
            </div>
          )}
          {success && (
            <div className="flex items-start gap-2 text-sm p-3 rounded-lg"
                 style={{ background: "color-mix(in srgb, var(--success) 12%, transparent)", color: "var(--success)" }}>
              <Icon name="check" size={16} /><span>{success}</span>
            </div>
          )}

          {/* Assessment scheme editor */}
          <div className="section-card space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="section-title">Assessment scheme</h3>
                <p className="section-subtitle">Decide what makes up the final grade and how much each part is worth</p>
              </div>
              <span className="text-xs font-medium px-2.5 py-1 rounded-full"
                    style={Math.round(totalWeight) === 100
                      ? { background: "color-mix(in srgb, var(--success) 16%, transparent)", color: "var(--success)" }
                      : { background: "color-mix(in srgb, var(--warning) 16%, transparent)", color: "var(--warning)" }}>
                Total weight: {totalWeight}%
              </span>
            </div>

            {components.length > 0 && (
              <div className="hidden sm:grid grid-cols-12 gap-2 px-1 text-xs text-[var(--text-muted)] font-medium">
                <div className="col-span-4">Component</div>
                <div className="col-span-3">Source</div>
                <div className="col-span-2">Max score</div>
                <div className="col-span-2">Weight (%)</div>
                <div className="col-span-1"></div>
              </div>
            )}

            {components.map((c, idx) => (
              <div key={c.id} className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
                <div className="sm:col-span-4">
                  <input className="input w-full" placeholder="e.g. Test 1, Exam" value={c.name}
                         onChange={(e) => updateComponent(idx, { name: e.target.value })} />
                </div>
                <div className="sm:col-span-3 flex gap-2">
                  <select className="input w-full" value={c.type}
                          onChange={(e) => updateComponent(idx, { type: e.target.value as ComponentType, assignmentId: undefined })}>
                    <option value="manual">Enter manually</option>
                    <option value="assignment">Reuse assignment</option>
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <input type="number" min="1" className="input w-full" value={c.maxScore}
                         disabled={c.type === "assignment"}
                         onChange={(e) => updateComponent(idx, { maxScore: Number(e.target.value) })} />
                </div>
                <div className="sm:col-span-2">
                  <input type="number" min="0" className="input w-full" value={c.weight}
                         onChange={(e) => updateComponent(idx, { weight: Number(e.target.value) })} />
                </div>
                <div className="sm:col-span-1 flex justify-end">
                  <button type="button" onClick={() => removeComponent(idx)} className="btn btn-ghost p-2" aria-label="Remove">
                    <Icon name="trash" size={16} />
                  </button>
                </div>

                {c.type === "assignment" && (
                  <div className="sm:col-span-12">
                    <select className="input w-full" value={c.assignmentId || ""}
                            onChange={(e) => onPickAssignment(idx, e.target.value)}>
                      <option value="">Select a recorded assignment/test…</option>
                      {assignments.map((a) => (
                        <option key={a._id} value={a._id}>{a.title} (max {a.maxScore})</option>
                      ))}
                    </select>
                    {assignments.length === 0 && (
                      <p className="text-[var(--text-muted)] text-xs mt-1">No recorded assignments for this course yet.</p>
                    )}
                  </div>
                )}
              </div>
            ))}

            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={() => addComponent("manual")} className="btn btn-ghost text-sm">
                <Icon name="plus" size={16} /> Manual component
              </button>
              <button type="button" onClick={() => addComponent("assignment")} className="btn btn-ghost text-sm">
                <Icon name="plus" size={16} /> Reuse assignment
              </button>
              <button type="button" onClick={saveScheme} disabled={savingScheme} className="btn btn-primary text-sm ml-auto">
                {savingScheme ? "Saving…" : (<><Icon name="check" size={16} />Save scheme</>)}
              </button>
            </div>
          </div>

          {/* Gradebook grid */}
          <div className="section-card space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="section-title">Gradebook</h3>
                <p className="section-subtitle">Enter scores for each student. Final grade calculates automatically.</p>
              </div>
              {savedComponents.some((c) => c.type === "manual") && (
                <button type="button" onClick={saveScores} disabled={savingScores} className="btn btn-primary text-sm">
                  {savingScores ? "Saving…" : (<><Icon name="check" size={16} />Save scores</>)}
                </button>
              )}
            </div>

            {savedComponents.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-[var(--text-primary)] text-sm font-medium">No scheme yet</p>
                <p className="text-[var(--text-muted)] text-xs mt-1">Add components above and click “Save scheme” to start grading.</p>
              </div>
            ) : roster.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-[var(--text-primary)] text-sm font-medium">No students</p>
                <p className="text-[var(--text-muted)] text-xs mt-1">No active students match this course&apos;s department and level yet.</p>
              </div>
            ) : (
              <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr className="text-left text-[var(--text-muted)] text-xs">
                      <th className="py-2 pr-3 font-medium sticky left-0 bg-[var(--surface,#0f172a)]">Student</th>
                      {savedComponents.map((c) => (
                        <th key={c.id} className="py-2 px-2 font-medium whitespace-nowrap">
                          {c.name}
                          <span className="block text-[10px] text-[var(--text-muted)]">
                            /{c.maxScore} · {c.weight}%{c.type === "assignment" ? " · auto" : ""}
                          </span>
                        </th>
                      ))}
                      <th className="py-2 px-2 font-medium text-right">Final</th>
                      <th className="py-2 pl-2 font-medium text-right">Grade</th>
                    </tr>
                  </thead>
                  <tbody>
                    {roster.map((s) => {
                      const sScores = getStudentScores(s.studentId);
                      const pct = computeFinal(savedComponents, sScores);
                      const band = scale.bands.length ? gradeFor(pct, scale) : { letter: "-", point: 0, min: 0, max: 0 };
                      const ratio = scale.scaleMax > 0 ? band.point / scale.scaleMax : 0;
                      const accent = ratio >= 0.8 ? "var(--success)" : ratio >= 0.5 ? "var(--info)" : "var(--warning)";
                      return (
                        <tr key={s.studentId} className="border-t border-[var(--border,rgba(148,163,184,0.15))]">
                          <td className="py-2 pr-3 sticky left-0 bg-[var(--surface,#0f172a)]">
                            <p className="text-[var(--text-primary)] font-medium truncate max-w-[160px]">{s.name}</p>
                            {s.studentNumber && <p className="text-[var(--text-muted)] text-xs">{s.studentNumber}</p>}
                          </td>
                          {savedComponents.map((c) => (
                            <td key={c.id} className="py-2 px-2">
                              {c.type === "assignment" ? (
                                <span className="text-[var(--text-secondary,#cbd5e1)]">
                                  {fetchedScores[s.studentId]?.[c.id] ?? <span className="text-[var(--text-muted)]">—</span>}
                                </span>
                              ) : (
                                <input
                                  type="number"
                                  min="0"
                                  max={c.maxScore}
                                  className="input w-16 sm:w-20 py-1.5 px-2"
                                  value={scoreEdits[s.studentId]?.[c.id] ?? ""}
                                  placeholder="0"
                                  onChange={(e) => setScore(s.studentId, c.id, e.target.value, c.maxScore)}
                                />
                              )}
                            </td>
                          ))}
                          <td className="py-2 px-2 text-right text-[var(--text-primary)] font-medium whitespace-nowrap">{pct}%</td>
                          <td className="py-2 pl-2 text-right">
                            <span className="px-2 py-0.5 rounded-full text-xs font-semibold"
                                  style={{ background: `color-mix(in srgb, ${accent} 16%, transparent)`, color: accent }}>
                              {band.letter}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            <p className="text-[var(--text-muted)] text-xs">
              A blank score counts as 0. Reused-assignment columns pull each student&apos;s recorded score automatically.
              {published
                ? " Results are published — students see their grades and this course counts toward their GPA."
                : " Publish when ready so students can see their grades and GPA."}
            </p>
          </div>
        </>
      )}
    </div>
  );
}
