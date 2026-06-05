"use client";

import { useEffect, useState } from "react";
import {
  attendanceService,
  type SessionType,
} from "@/lib/attendanceService";

interface CreateSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  courseId: string;
  courseCode: string;
  locations: string[];
  onCreated: (sessionId: string) => void;
}

const TYPE_OPTIONS: { value: SessionType; label: string; icon: string }[] = [
  { value: "class", label: "Class", icon: "📖" },
  { value: "test", label: "Test", icon: "📝" },
  { value: "exam", label: "Exam", icon: "🎓" },
];

export default function CreateSessionModal({
  isOpen,
  onClose,
  courseId,
  courseCode,
  locations,
  onCreated,
}: CreateSessionModalProps) {
  const [type, setType] = useState<SessionType>("class");
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [notes, setNotes] = useState("");
  const [autoStart, setAutoStart] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isOpen) return;
    setType("class");
    setTitle("");
    setLocation(locations[0] || "");
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    setScheduledAt(now.toISOString().slice(0, 16));
    setNotes("");
    setAutoStart(true);
    setError("");
  }, [isOpen, locations]);

  useEffect(() => {
    if (isOpen && !title) {
      const labels: Record<SessionType, string> = {
        class: "Class session",
        test: "Test",
        exam: "Exam",
      };
      setTitle(`${courseCode} — ${labels[type]}`);
    }
  }, [type, isOpen, courseCode, title]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!location.trim()) {
      setError("Select a room");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const res = await attendanceService.createSession({
        courseId,
        type,
        title: title.trim(),
        location: location.trim(),
        scheduledAt: scheduledAt ? new Date(scheduledAt).toISOString() : undefined,
        notes: notes.trim() || undefined,
        autoStart,
      });
      const id = res.session._id;
      onCreated(id);
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Could not create session");
    } finally {
      setBusy(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-md shadow-2xl">
        <div className="flex justify-between items-center p-5 border-b border-slate-700">
          <h3 className="text-lg font-bold text-white">New attendance session</h3>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-white">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="text-slate-400 text-xs block mb-2">Session type</label>
            <div className="grid grid-cols-3 gap-2">
              {TYPE_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setType(opt.value)}
                  className={`py-2.5 rounded-xl text-sm font-medium border transition-colors ${
                    type === opt.value
                      ? "bg-indigo-600 border-indigo-500 text-white"
                      : "border-slate-600 text-slate-400 hover:border-slate-500"
                  }`}
                >
                  <span className="mr-1">{opt.icon}</span>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-slate-400 text-xs block mb-1">Title</label>
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              required
              className="w-full px-3 py-2.5 rounded-xl bg-slate-900/60 border border-slate-600 text-white text-sm"
            />
          </div>

          <div>
            <label className="text-slate-400 text-xs block mb-1">Room</label>
            <select
              value={location}
              onChange={e => setLocation(e.target.value)}
              required
              className="w-full px-3 py-2.5 rounded-xl bg-slate-900/60 border border-slate-600 text-white text-sm"
            >
              {locations.length === 0 && <option value="">No rooms configured</option>}
              {locations.map(loc => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-slate-400 text-xs block mb-1">Scheduled time</label>
            <input
              type="datetime-local"
              value={scheduledAt}
              onChange={e => setScheduledAt(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-900/60 border border-slate-600 text-white text-sm"
            />
          </div>

          <div>
            <label className="text-slate-400 text-xs block mb-1">Notes (optional)</label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={2}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-900/60 border border-slate-600 text-white text-sm resize-none"
            />
          </div>

          <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={autoStart}
              onChange={e => setAutoStart(e.target.checked)}
              className="rounded"
            />
            Start scanning immediately (active session)
          </label>

          {error && (
            <p className="text-sm text-red-400 bg-red-900/20 rounded-lg px-3 py-2">{error}</p>
          )}

          <button
            type="submit"
            disabled={busy || locations.length === 0}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-medium disabled:opacity-50"
          >
            {busy ? "Creating…" : "Create session"}
          </button>
        </form>
      </div>
    </div>
  );
}
