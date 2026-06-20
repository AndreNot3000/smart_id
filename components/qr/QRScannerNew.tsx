"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Html5Qrcode,
  Html5QrcodeScannerState,
  Html5QrcodeSupportedFormats,
} from "html5-qrcode";
import { API_BASE_URL } from "@/lib/config";
import { qrService } from "@/lib/qrService";
import { attendanceService } from "@/lib/attendanceService";

type ScannedStudent = {
  studentId: string;
  firstName: string;
  lastName: string;
  name: string;
  department: string;
  year: string;
  avatar: string | null;
  email: string;
  status: string;
};

type RecentScan = {
  id: string;
  name: string;
  studentId: string;
  avatar: string | null;
  at: number;
  status: "success" | "duplicate" | "error";
  student: ScannedStudent;
  scannedAt: string;
  purpose?: string;
  location?: string;
};

type IdentityPerson = {
  name: string;
  idLabel: string;
  idValue: string;
  department: string;
  subtitle: string;
  avatar: string | null;
  email: string;
  status: string;
};


const COOLDOWN_MS = 1500; // window during which the same QR is ignored after success
const RESUME_DELAY_MS = 600; // delay before auto-resuming the camera in rapid mode
const RECENT_LIMIT = 6;

const playBeep = (() => {
  let ctx: AudioContext | null = null;
  return (variant: "success" | "error" = "success") => {
    if (typeof window === "undefined") return;
    try {
      if (!ctx) {
        const AC = (window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext })
            .webkitAudioContext);
        if (!AC) return;
        ctx = new AC();
      }
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(0.18, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.25);
      if (variant === "success") {
        osc.frequency.setValueAtTime(720, now);
        osc.frequency.exponentialRampToValueAtTime(1180, now + 0.18);
      } else {
        osc.frequency.setValueAtTime(360, now);
        osc.frequency.exponentialRampToValueAtTime(220, now + 0.18);
      }
      osc.start(now);
      osc.stop(now + 0.28);
    } catch {
      // ignore
    }
  };
})();

const vibrate = (pattern: number | number[]) => {
  if (typeof navigator !== "undefined" && "vibrate" in navigator) {
    try {
      navigator.vibrate(pattern);
    } catch {
      // ignore
    }
  }
};

const initials = (first?: string, last?: string) =>
  `${(first?.[0] || "").toUpperCase()}${(last?.[0] || "").toUpperCase()}` || "?";

export default function QRScannerNew({ className = "" }: { className?: string }) {
  const [isScanning, setIsScanning] = useState(false);
  const [overlay, setOverlay] = useState<
    | { type: "success"; student: ScannedStudent; recordedAt: string }
    | { type: "identity"; person: IdentityPerson; userType: "student" | "lecturer"; recordedAt: string }
    | { type: "error"; message: string }
    | null
  >(null);

  const [detailsFor, setDetailsFor] = useState<
    | {
        student: ScannedStudent;
        scannedAt: string;
        purpose?: string;
        location?: string;
      }
    | null
  >(null);

  const [rapidMode, setRapidMode] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [purpose, setPurpose] = useState("Lecture");
  const [location, setLocation] = useState("");

  const [torchOn, setTorchOn] = useState(false);
  const [torchSupported, setTorchSupported] = useState(false);
  const [facingMode, setFacingMode] = useState<"environment" | "user">("environment");
  const [zoom, setZoom] = useState(1);
  const [zoomCaps, setZoomCaps] = useState<{ min: number; max: number; step: number } | null>(null);

  const [recent, setRecent] = useState<RecentScan[]>([]);
  const [sessionStartedAt, setSessionStartedAt] = useState<number | null>(null);
  const [cameraError, setCameraError] = useState<string>("");
  const [linkedSession, setLinkedSession] = useState<{
    id: string;
    title: string;
    courseCode: string;
    presentCount: number;
    expectedCount: number;
  } | null>(null);
  const [livePresentCount, setLivePresentCount] = useState<number | null>(null);

  const scannerRef = useRef<Html5Qrcode | null>(null);
  const cooldownRef = useRef<Map<string, number>>(new Map());
  const isProcessingRef = useRef(false);
  const autoStartedRef = useRef(false);
  const resumeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const overlayTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const qrRegionId = "qr-reader-new";

  const sessionTotal = useMemo(() => recent.filter((r) => r.status === "success").length, [recent]);

  const stopCameraInternal = useCallback(async () => {
    const s = scannerRef.current;
    if (!s) return;
    try {
      const state = await s.getState();
      if (state === Html5QrcodeScannerState.SCANNING || state === Html5QrcodeScannerState.PAUSED) {
        await s.stop();
      }
      s.clear();
    } catch {
      // best-effort
    } finally {
      scannerRef.current = null;
    }
  }, []);

  const stopScanner = useCallback(async () => {
    if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
    await stopCameraInternal();
    setIsScanning(false);
    setTorchOn(false);
    setTorchSupported(false);
    setZoom(1);
    setZoomCaps(null);
  }, [stopCameraInternal]);

  const handleScan = useCallback(
    async (decodedText: string) => {
      if (isProcessingRef.current) return;

      const now = Date.now();
      const lastSeen = cooldownRef.current.get(decodedText) || 0;
      if (now - lastSeen < COOLDOWN_MS) return;
      cooldownRef.current.set(decodedText, now);
      isProcessingRef.current = true;

      try {
        if (scannerRef.current) {
          try {
            await scannerRef.current.pause(true);
          } catch {
            // ignore pause errors
          }
        }

        const token = sessionStorage.getItem("accessToken");
        const response = await fetch(`${API_BASE_URL}/api/qr/scan-attendance`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            qrData: decodedText,
            purpose: linkedSession ? undefined : purpose || undefined,
            location: linkedSession ? undefined : location || undefined,
            sessionId: linkedSession?.id,
          }),
        });

        if (!response.ok) {
          const errBody = await response.json().catch(() => ({}));
          if (errBody.notInRoster) {
            throw new Error(
              `${errBody.studentName || "Student"} is not on this course roster`,
            );
          }
          // Attendance is students-only. The QR may belong to a lecturer, so
          // fall back to identity verification — this lets admins scan a
          // lecturer's QR code and confirm their identity, just like students.
          try {
            const verify = await qrService.verifyQRCode(decodedText);
            if (verify?.verified) {
              const u = verify.userInfo;
              const isLecturer = verify.userType === "lecturer";
              const person: IdentityPerson = {
                name: `${u.firstName} ${u.lastName}`.trim(),
                idLabel: isLecturer ? "Faculty ID" : "Student ID",
                idValue: (isLecturer ? u.lecturerId : u.studentId) || "",
                department: u.department || "",
                subtitle: isLecturer
                  ? [u.title || u.role, u.specialization].filter(Boolean).join(" · ")
                  : u.year || "",
                avatar: u.avatar || null,
                email: u.email || "",
                status: u.status || "active",
              };
              playBeep("success");
              vibrate([50, 30, 50]);
              setOverlay({
                type: "identity",
                person,
                userType: verify.userType,
                recordedAt: verify.scannedAt,
              });
              if (rapidMode) {
                if (overlayTimerRef.current) clearTimeout(overlayTimerRef.current);
                overlayTimerRef.current = setTimeout(() => {
                  setOverlay(null);
                  if (scannerRef.current) scannerRef.current.resume();
                  isProcessingRef.current = false;
                }, 2400);
              } else {
                isProcessingRef.current = false;
              }
              return;
            }
          } catch {
            // verification failed too — surface the original attendance error
          }
          throw new Error(errBody.error || errBody.message || `HTTP ${response.status}`);
        }
        const res = await response.json();

        if (res.session?.presentCount != null) {
          setLivePresentCount(res.session.presentCount);
        }

        const student = res.student as ScannedStudent;
        const safeStudent: ScannedStudent = {
          studentId: student.studentId || "",
          firstName: student.firstName || student.name?.split(" ")[0] || "",
          lastName: student.lastName || student.name?.split(" ").slice(1).join(" ") || "",
          name: student.name,
          department: student.department || "",
          year: student.year || "",
          avatar: student.avatar || null,
          email: student.email || "",
          status: student.status || "active",
        };

        playBeep("success");
        vibrate([60, 40, 60]);

        setOverlay({ type: "success", student: safeStudent, recordedAt: res.scannedAt });
        setRecent((prev) =>
          [
            {
              id: `${safeStudent.studentId}-${now}`,
              name: safeStudent.name,
              studentId: safeStudent.studentId,
              avatar: safeStudent.avatar,
              at: now,
              status: "success" as const,
              student: safeStudent,
              scannedAt: res.scannedAt,
              purpose: res.purpose,
              location: res.location,
            },
            ...prev,
          ].slice(0, RECENT_LIMIT),
        );
        if (!sessionStartedAt) setSessionStartedAt(now);

        if (rapidMode) {
          if (overlayTimerRef.current) clearTimeout(overlayTimerRef.current);
          overlayTimerRef.current = setTimeout(() => {
            setOverlay(null);
            if (scannerRef.current) {
              scannerRef.current.resume();
            }
            isProcessingRef.current = false;
          }, RESUME_DELAY_MS);
        } else {
          isProcessingRef.current = false;
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Failed to verify QR code";
        playBeep("error");
        vibrate(220);
        setOverlay({ type: "error", message });

        if (overlayTimerRef.current) clearTimeout(overlayTimerRef.current);
        overlayTimerRef.current = setTimeout(() => {
          setOverlay(null);
          if (scannerRef.current) {
            scannerRef.current.resume();
          }
          isProcessingRef.current = false;
        }, 1400);
      }
    },
    [location, purpose, rapidMode, sessionStartedAt, linkedSession],
  );

  const startScanner = useCallback(async () => {
    setCameraError("");
    setOverlay(null);
    isProcessingRef.current = false;
    cooldownRef.current.clear();

    try {
      setIsScanning(true);
      // Give React one tick to render the qr-reader div before we attach
      await new Promise((r) => setTimeout(r, 50));

      // Restrict decoder to QR codes only + opt into native BarcodeDetector
      // when available (Chrome on Android uses GPU-accelerated decoding).
      const html5QrCode = new Html5Qrcode(qrRegionId, {
        verbose: false,
        formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
        experimentalFeatures: { useBarCodeDetectorIfSupported: true },
      });
      scannerRef.current = html5QrCode;

      const isIOS =
        typeof navigator !== "undefined" &&
        /iPad|iPhone|iPod/.test(navigator.userAgent);

      await html5QrCode.start(
        { facingMode },
        {
          // More decode attempts per second = the QR is caught the instant it's
          // sharp. iOS uses a JS decoder, so keep it a touch lower there.
          fps: isIOS ? 20 : 30,
          // On Android/desktop the native BarcodeDetector scans the WHOLE frame
          // cheaply, so we omit qrbox entirely — a QR is found anywhere in view
          // and the user never has to centre their device. iOS falls back to a
          // JS decoder where a full high-res frame is expensive, so there we
          // bound it to a generous 90% box to stay swift while still covering
          // almost the entire view.
          ...(isIOS
            ? {
                qrbox: (vw: number, vh: number) => {
                  const size = Math.floor(Math.min(vw, vh) * 0.9);
                  return { width: size, height: size };
                },
              }
            : {}),
          aspectRatio: 1.0,
          // QR codes don't need mirror detection - skipping the flip
          // attempt almost doubles effective scan throughput.
          disableFlip: true,
          // Request the highest practical resolution. More pixels means a QR
          // held farther from the camera still resolves enough detail to decode,
          // so the device no longer has to be right up against the code.
          videoConstraints: {
            facingMode,
            width: { ideal: 2560 },
            height: { ideal: 1440 },
            frameRate: { ideal: 30 },
          } as MediaTrackConstraints,
        },
        (decoded) => {
          handleScan(decoded);
        },
        () => {
          // ignore per-frame decode errors
        },
      );

      // Probe camera capabilities for torch + zoom + focus
      try {
        const caps =
          (html5QrCode as unknown as {
            getRunningTrackCapabilities?: () => MediaTrackCapabilities;
          }).getRunningTrackCapabilities?.() || {};

        if ("torch" in caps) setTorchSupported(true);

        const zoomCap = (caps as unknown as { zoom?: { min: number; max: number; step?: number } }).zoom;
        if (zoomCap && typeof zoomCap.min === "number" && typeof zoomCap.max === "number") {
          setZoomCaps({ min: zoomCap.min, max: zoomCap.max, step: zoomCap.step || 0.1 });
          // Keep a wide field of view (no forced zoom). Zoom magnifies but
          // narrows the view, which actually forces the user closer/aligned.
          // High resolution above does the "scan from far" work; the manual
          // zoom slider is still available if someone wants to magnify.
          setZoom(Math.max(1, zoomCap.min));
        }

        // Try continuous autofocus where supported (most modern phones).
        // Cast through unknown because focusMode isn't in the lib.dom types.
        const focusModes = (caps as unknown as { focusMode?: string[] }).focusMode;
        if (focusModes?.includes("continuous")) {
          try {
            await (html5QrCode as unknown as {
              applyVideoConstraints: (c: MediaTrackConstraints) => Promise<void>;
            }).applyVideoConstraints({
              advanced: [{ focusMode: "continuous" } as unknown as MediaTrackConstraintSet],
            });
          } catch {
            // ignore — focusMode is non-standard
          }
        }
      } catch {
        // capability probing failed — ignore
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to start camera. Check permissions.";
      setCameraError(message);
      setIsScanning(false);
    }
  }, [facingMode, handleScan]);

  const applyZoom = useCallback(
    async (value: number) => {
      const s = scannerRef.current;
      if (!s || !zoomCaps) return;
      const clamped = Math.min(Math.max(value, zoomCaps.min), zoomCaps.max);
      try {
        await (s as unknown as {
          applyVideoConstraints: (c: MediaTrackConstraints) => Promise<void>;
        }).applyVideoConstraints({
          advanced: [{ zoom: clamped } as MediaTrackConstraintSet],
        });
        setZoom(clamped);
      } catch {
        // ignore
      }
    },
    [zoomCaps],
  );

  const toggleTorch = useCallback(async () => {
    const s = scannerRef.current;
    if (!s || !torchSupported) return;
    try {
      const next = !torchOn;
      await (s as unknown as {
        applyVideoConstraints: (c: MediaTrackConstraints) => Promise<void>;
      }).applyVideoConstraints({
        advanced: [{ torch: next } as MediaTrackConstraintSet],
      });
      setTorchOn(next);
    } catch {
      // torch toggle is unreliable; silently ignore
    }
  }, [torchOn, torchSupported]);

  const flipCamera = useCallback(async () => {
    const wasScanning = isScanning;
    if (wasScanning) await stopCameraInternal();
    setFacingMode((f) => (f === "environment" ? "user" : "environment"));
    if (wasScanning) {
      // small delay so the device releases the previous track
      setTimeout(() => startScanner(), 150);
    }
  }, [isScanning, startScanner, stopCameraInternal]);

  // Auto-start the camera the first time the scanner mounts so the flow feels
  // instant — no extra "Start" tap before the camera is live.
  useEffect(() => {
    if (autoStartedRef.current) return;
    autoStartedRef.current = true;
    const t = setTimeout(() => startScanner(), 120);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load attendance session when opened from Attendance Management
  useEffect(() => {
    const id =
      typeof window !== "undefined"
        ? sessionStorage.getItem("activeAttendanceSessionId")
        : null;
    if (!id) {
      setLinkedSession(null);
      setLivePresentCount(null);
      return;
    }
    attendanceService
      .getSession(id)
      .then(data => {
        const present = data.stats.present + data.stats.late;
        setLinkedSession({
          id,
          title: data.session.title,
          courseCode: data.session.courseCode,
          presentCount: present,
          expectedCount: data.stats.expected,
        });
        setLivePresentCount(present);
        if (data.session.location) setLocation(data.session.location);
      })
      .catch(() => {
        sessionStorage.removeItem("activeAttendanceSessionId");
        setLinkedSession(null);
      });
  }, []);

  const clearLinkedSession = () => {
    sessionStorage.removeItem("activeAttendanceSessionId");
    setLinkedSession(null);
    setLivePresentCount(null);
  };

  // Cleanup
  useEffect(
    () => () => {
      if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
      if (overlayTimerRef.current) clearTimeout(overlayTimerRef.current);
      stopCameraInternal();
    },
    [stopCameraInternal],
  );

  // Press Escape to stop the scanner from anywhere
  useEffect(() => {
    if (!isScanning) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") stopScanner();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isScanning, stopScanner]);

  return (
    <div className={`relative rounded-3xl border border-white/10 bg-slate-900/60 backdrop-blur-md ${className}`}>
      {/* Session header */}
      <header className="flex flex-wrap items-center gap-3 border-b border-white/10 p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500/30 to-indigo-500/30 ring-1 ring-white/10">
            <svg className="h-5 w-5 text-blue-300" viewBox="0 0 24 24" fill="none" strokeWidth="2" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.875A.875.875 0 014.625 4h14.75a.875.875 0 01.875.875v14.25a.875.875 0 01-.875.875H4.625a.875.875 0 01-.875-.875V4.875zM8.25 8.25h2.25v2.25H8.25V8.25zm5.25 0h2.25v2.25h-2.25V8.25zM8.25 13.5h2.25v2.25H8.25V13.5zm5.25 0h2.25v2.25h-2.25V13.5z" />
            </svg>
          </div>
          <div>
            <h2 className="text-base font-semibold text-white">Attendance Scanner</h2>
            <p className="text-xs text-slate-400">
              {purpose}
              {location ? ` · ${location}` : ""}
              {sessionStartedAt ? ` · ${sessionTotal} marked` : ""}
            </p>
          </div>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <label className="flex cursor-pointer items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs text-slate-200 transition hover:bg-white/[0.06]">
            <span
              className={`relative inline-flex h-4 w-7 items-center rounded-full transition ${
                rapidMode ? "bg-emerald-500" : "bg-slate-600"
              }`}
            >
              <span
                className={`inline-block h-3 w-3 transform rounded-full bg-white transition ${
                  rapidMode ? "translate-x-3.5" : "translate-x-0.5"
                }`}
              />
            </span>
            <span>Rapid mode</span>
            <input
              type="checkbox"
              className="hidden"
              checked={rapidMode}
              onChange={(e) => setRapidMode(e.target.checked)}
            />
          </label>

          <button
            type="button"
            onClick={() => setShowSettings((s) => !s)}
            className="rounded-full border border-white/10 bg-white/[0.03] p-2 text-slate-300 transition hover:bg-white/[0.06]"
            aria-label="Session settings"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" strokeWidth="2" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 011.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78l.893.15c.543.09.94.56.94 1.109v1.094c0 .55-.397 1.02-.94 1.11l-.893.149c-.425.07-.765.383-.93.78-.165.398-.143.854.107 1.204l.527.738c.32.447.269 1.06-.12 1.45l-.774.773a1.125 1.125 0 01-1.449.12l-.738-.527c-.35-.25-.806-.272-1.203-.107-.398.165-.71.505-.781.929l-.149.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93-.398-.164-.854-.142-1.204.108l-.738.527c-.447.32-1.06.269-1.45-.12l-.773-.774a1.125 1.125 0 01-.12-1.45l.527-.737c.25-.35.273-.806.108-1.204-.165-.397-.505-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.109v-1.094c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.764-.383.93-.78.165-.398.143-.854-.108-1.204l-.526-.738a1.125 1.125 0 01.12-1.45l.773-.773a1.125 1.125 0 011.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.929l.15-.894z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </div>

        {showSettings && !linkedSession && (
          <div className="flex w-full flex-col gap-3 rounded-2xl border border-white/10 bg-slate-900/80 p-4 sm:flex-row">
            <label className="flex-1">
              <span className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-slate-400">Purpose</span>
              <input
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                placeholder="e.g. CSC301 lecture"
                className="w-full rounded-lg border border-white/10 bg-slate-800/70 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-blue-400 focus:outline-none"
              />
            </label>
            <label className="flex-1">
              <span className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-slate-400">Location</span>
              <input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Lecture Hall A"
                className="w-full rounded-lg border border-white/10 bg-slate-800/70 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-blue-400 focus:outline-none"
              />
            </label>
          </div>
        )}
        {showSettings && linkedSession && (
          <p className="w-full text-xs text-slate-400 px-1">
            Purpose and room come from the linked session. Unlink to scan without a session.
          </p>
        )}
        {linkedSession && (
          <div className="flex w-full flex-wrap items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-900/20 px-3 py-2.5">
            <span className="text-emerald-300 text-xs font-medium">Session linked</span>
            <span className="text-white text-sm truncate flex-1 min-w-0">
              {linkedSession.courseCode} · {linkedSession.title}
            </span>
            <span className="text-emerald-200 text-sm font-semibold tabular-nums">
              {livePresentCount ?? linkedSession.presentCount}/{linkedSession.expectedCount}
            </span>
            <button
              type="button"
              onClick={clearLinkedSession}
              className="text-xs text-slate-400 hover:text-white underline"
            >
              Unlink
            </button>
          </div>
        )}
      </header>

      {/* Stage */}
      <div className="p-4">
        {!isScanning ? (
          <div className="flex flex-col items-center justify-center gap-6 rounded-2xl border border-dashed border-white/10 bg-slate-900/40 px-6 py-12 text-center">
            <div className="relative">
              <div className="absolute inset-0 -z-10 rounded-full bg-blue-500/15 blur-2xl" />
              <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-blue-500/30 to-indigo-500/20 ring-1 ring-white/10">
                <svg className="h-10 w-10 text-blue-300" viewBox="0 0 24 24" fill="none" strokeWidth="1.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23l-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
                </svg>
              </div>
            </div>
            <div className="space-y-1.5">
              <h3 className="text-xl font-semibold text-white">Ready to scan</h3>
              <p className="max-w-sm text-sm text-slate-400">
                Start the camera and hold any QR code in view — no need to line it up. It reads instantly and,
                in rapid mode, marks attendance automatically.
              </p>
            </div>
            <button
              type="button"
              onClick={startScanner}
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/30 transition hover:shadow-blue-500/50"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" strokeWidth="2" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 3l14 9-14 9V3z" />
              </svg>
              Start scanner
            </button>

            {cameraError && (
              <p className="max-w-sm rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2 text-xs text-red-200">
                {cameraError}
              </p>
            )}
          </div>
        ) : (
          <div className="relative">
            {/* Camera viewport */}
            <div className="relative overflow-hidden rounded-3xl bg-black ring-1 ring-white/10" style={{ aspectRatio: "1 / 1", maxHeight: 520 }}>
              <div id={qrRegionId} className="absolute inset-0" />

              {/* Full-frame guide — the whole view is scanned, so the brackets
                  just frame the live feed rather than a small target box. */}
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center p-5">
                <div className="relative h-full w-full">
                  <span className="absolute -left-px -top-px h-9 w-9 rounded-tl-3xl border-l-2 border-t-2 border-emerald-300/80" />
                  <span className="absolute -right-px -top-px h-9 w-9 rounded-tr-3xl border-r-2 border-t-2 border-emerald-300/80" />
                  <span className="absolute -bottom-px -left-px h-9 w-9 rounded-bl-3xl border-b-2 border-l-2 border-emerald-300/80" />
                  <span className="absolute -bottom-px -right-px h-9 w-9 rounded-br-3xl border-b-2 border-r-2 border-emerald-300/80" />
                  <span className="absolute left-0 right-0 h-px animate-scan-line bg-emerald-300/70 shadow-[0_0_12px_2px_rgba(110,231,183,0.6)]" />
                </div>
              </div>

              {/* Subtle vignette for depth (does not restrict the scan area) */}
              <div
                className="pointer-events-none absolute inset-0"
                style={{
                  background:
                    "radial-gradient(closest-side at 50% 50%, transparent 70%, rgba(0,0,0,0.35) 100%)",
                }}
              />

              {/* Top toolbar */}
              <div className="absolute left-3 right-3 top-3 flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-black/45 px-3 py-1 text-[11px] font-medium text-emerald-200 backdrop-blur">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  </span>
                  Scanning
                </span>

                <div className="flex items-center gap-1.5">
                  {torchSupported && (
                    <button
                      type="button"
                      onClick={toggleTorch}
                      className={`rounded-full p-2 backdrop-blur transition ${
                        torchOn
                          ? "bg-amber-300 text-amber-950"
                          : "bg-black/45 text-white hover:bg-black/65"
                      }`}
                      aria-label="Toggle flashlight"
                    >
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" strokeWidth="2" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                      </svg>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={flipCamera}
                    className="rounded-full bg-black/45 p-2 text-white backdrop-blur transition hover:bg-black/65"
                    aria-label="Flip camera"
                  >
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" strokeWidth="2" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={stopScanner}
                    className="inline-flex items-center gap-1.5 rounded-full bg-red-500/90 px-3 py-1.5 text-xs font-medium text-white backdrop-blur transition hover:bg-red-500"
                    aria-label="Stop scanner"
                    title="Stop scanner"
                  >
                    <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" strokeWidth="2.5" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h12v12H6z" />
                    </svg>
                    <span>Stop</span>
                  </button>
                </div>
              </div>

              {/* Hint bar */}
              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-center">
                <span className="rounded-full bg-black/45 px-4 py-1.5 text-[11px] text-slate-100/90 backdrop-blur">
                  Point at any QR code — it scans automatically
                </span>
              </div>

              {/* Zoom slider (only shown when camera supports it) */}
              {zoomCaps && (
                <div className="absolute right-3 top-1/2 flex -translate-y-1/2 flex-col items-center gap-2">
                  <button
                    type="button"
                    onClick={() => applyZoom(zoom + (zoomCaps.step || 0.5))}
                    className="rounded-full bg-black/55 p-1.5 text-white backdrop-blur transition hover:bg-black/75"
                    aria-label="Zoom in"
                  >
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" strokeWidth="2.5" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14M5 12h14" />
                    </svg>
                  </button>
                  <div className="flex h-32 w-1.5 items-end overflow-hidden rounded-full bg-white/15">
                    <div
                      className="w-full rounded-full bg-emerald-300"
                      style={{
                        height: `${
                          ((zoom - zoomCaps.min) / Math.max(zoomCaps.max - zoomCaps.min, 0.0001)) * 100
                        }%`,
                      }}
                    />
                  </div>
                  <span className="rounded-full bg-black/55 px-1.5 py-0.5 text-[10px] font-mono text-white backdrop-blur">
                    {zoom.toFixed(1)}×
                  </span>
                  <button
                    type="button"
                    onClick={() => applyZoom(zoom - (zoomCaps.step || 0.5))}
                    className="rounded-full bg-black/55 p-1.5 text-white backdrop-blur transition hover:bg-black/75"
                    aria-label="Zoom out"
                  >
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" strokeWidth="2.5" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14" />
                    </svg>
                  </button>
                </div>
              )}

              {/* Success / error overlay */}
              {overlay && (
                <div className="absolute inset-0 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]">
                  {overlay.type === "success" ? (
                    <SuccessCard
                      student={overlay.student}
                      onContinue={() => {
                        if (overlayTimerRef.current) clearTimeout(overlayTimerRef.current);
                        setOverlay(null);
                        if (scannerRef.current) scannerRef.current.resume();
                        isProcessingRef.current = false;
                      }}
                      onStop={() => {
                        if (overlayTimerRef.current) clearTimeout(overlayTimerRef.current);
                        setOverlay(null);
                        stopScanner();
                      }}
                      onOpenDetails={() => {
                        if (overlayTimerRef.current) clearTimeout(overlayTimerRef.current);
                        setDetailsFor({
                          student: overlay.student,
                          scannedAt: overlay.recordedAt,
                          purpose,
                          location,
                        });
                      }}
                      autoContinue={rapidMode}
                    />
                  ) : overlay.type === "identity" ? (
                    <IdentityCard
                      person={overlay.person}
                      userType={overlay.userType}
                      autoContinue={rapidMode}
                      onContinue={() => {
                        if (overlayTimerRef.current) clearTimeout(overlayTimerRef.current);
                        setOverlay(null);
                        if (scannerRef.current) scannerRef.current.resume();
                        isProcessingRef.current = false;
                      }}
                      onStop={() => {
                        if (overlayTimerRef.current) clearTimeout(overlayTimerRef.current);
                        setOverlay(null);
                        stopScanner();
                      }}
                    />
                  ) : (
                    <div className="mx-6 max-w-sm rounded-2xl border border-red-500/30 bg-red-500/10 p-5 text-center backdrop-blur-md">
                      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-red-500/20">
                        <svg className="h-6 w-6 text-red-300" viewBox="0 0 24 24" fill="none" strokeWidth="2.5" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </div>
                      <p className="text-sm font-medium text-red-200">{overlay.message}</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Persistent action bar below the camera — always reachable */}
            <div className="mt-3 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-2">
              <p className="text-[11px] text-slate-500 text-center sm:text-left">
                {sessionTotal > 0
                  ? `${sessionTotal} marked this session`
                  : "Camera is active — point at a student's QR code"}
              </p>
              <button
                type="button"
                onClick={stopScanner}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-red-500/90 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-red-500/20 transition hover:bg-red-500 hover:shadow-red-500/40"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" strokeWidth="2.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h12v12H6z" />
                </svg>
                {sessionTotal > 0 ? "Done scanning" : "Close scanner"}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Student details modal */}
      {detailsFor && (
        <StudentDetailsModal
          student={detailsFor.student}
          scannedAt={detailsFor.scannedAt}
          purpose={detailsFor.purpose}
          location={detailsFor.location}
          onClose={() => {
            setDetailsFor(null);
            // If a success overlay was paused for details, dismiss it and resume scanning.
            if (overlay?.type === "success") {
              setOverlay(null);
              if (scannerRef.current) scannerRef.current.resume();
              isProcessingRef.current = false;
            }
          }}
        />
      )}

      {/* Recent scans rail */}
      {recent.length > 0 && (
        <div className="border-t border-white/10 p-4">
          <div className="mb-3 flex items-center justify-between">
            <h4 className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
              Recent · {sessionTotal} this session
            </h4>
            <button
              type="button"
              onClick={() => setRecent([])}
              className="text-xs text-slate-500 transition hover:text-slate-300"
            >
              Clear
            </button>
          </div>
          <ul className="flex gap-3 overflow-x-auto pb-1">
            {recent.map((r) => (
              <li key={r.id} className="flex-shrink-0">
                <button
                  type="button"
                  onClick={() =>
                    setDetailsFor({
                      student: r.student,
                      scannedAt: r.scannedAt,
                      purpose: r.purpose,
                      location: r.location,
                    })
                  }
                  className="flex min-w-[200px] items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-2 text-left transition hover:border-white/20 hover:bg-white/[0.07] focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/40"
                >
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-blue-500/30 to-indigo-500/30 ring-1 ring-white/10">
                    {r.avatar && r.avatar.startsWith("data:image") ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={r.avatar} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <span className="text-xs font-semibold text-white">
                        {initials(r.name.split(" ")[0], r.name.split(" ")[1])}
                      </span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-white">{r.name}</p>
                    <p className="truncate text-[11px] text-slate-400">{r.studentId}</p>
                  </div>
                  <svg className="h-3.5 w-3.5 flex-shrink-0 text-slate-500" viewBox="0 0 24 24" fill="none" strokeWidth="2.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function SuccessCard({
  student,
  onContinue,
  onStop,
  onOpenDetails,
  autoContinue,
}: {
  student: ScannedStudent;
  onContinue: () => void;
  onStop: () => void;
  onOpenDetails: () => void;
  autoContinue: boolean;
}) {
  return (
    <div className="mx-6 w-full max-w-sm rounded-3xl border border-emerald-400/30 bg-slate-900/90 p-6 text-center shadow-2xl shadow-emerald-500/20 backdrop-blur-md animate-[popIn_0.25s_ease-out]">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/15 ring-2 ring-emerald-400/40">
        <svg className="h-7 w-7 text-emerald-300" viewBox="0 0 24 24" fill="none" strokeWidth="3" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </div>

      <button
        type="button"
        onClick={onOpenDetails}
        className="group block w-full rounded-2xl p-2 text-center transition hover:bg-white/[0.04] focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/40"
        aria-label={`View full details for ${student.name}`}
      >
        <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-blue-500/40 to-indigo-500/40 ring-2 ring-white/10">
          {student.avatar && student.avatar.startsWith("data:image") ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={student.avatar} alt="" className="h-full w-full object-cover" />
          ) : (
            <span className="text-lg font-semibold text-white">
              {initials(student.firstName, student.lastName)}
            </span>
          )}
        </div>

        <h3 className="text-lg font-semibold text-white">{student.name}</h3>
        <p className="mt-0.5 text-[12px] font-mono text-slate-400">{student.studentId}</p>
        {(student.department || student.year) && (
          <p className="mt-2 text-xs text-slate-300">
            {student.department}
            {student.year ? ` · ${student.year}` : ""}
          </p>
        )}

        <span className="mt-3 inline-flex items-center gap-1 text-[11px] font-medium text-slate-400 transition group-hover:text-emerald-300">
          View full details
          <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" strokeWidth="2.5" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </span>
      </button>

      <div className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-3 py-1 text-[11px] font-medium text-emerald-200">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
        Attendance marked
      </div>

      <div className="mt-5 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={onStop}
          className="inline-flex items-center justify-center gap-1.5 rounded-full bg-red-500/20 border border-red-400/30 px-4 py-2 text-sm font-medium text-red-200 transition hover:bg-red-500/30"
        >
          <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" strokeWidth="2.5" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h12v12H6z" />
          </svg>
          Stop
        </button>
        <button
          type="button"
          onClick={onContinue}
          className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-emerald-500/20 transition hover:shadow-emerald-500/40"
        >
          {autoContinue ? "Continue" : "Scan next"}
        </button>
      </div>
    </div>
  );
}

function IdentityCard({
  person,
  userType,
  onContinue,
  onStop,
  autoContinue,
}: {
  person: IdentityPerson;
  userType: "student" | "lecturer";
  onContinue: () => void;
  onStop: () => void;
  autoContinue: boolean;
}) {
  const isVerified = person.status === "active";
  const roleLabel = userType === "lecturer" ? "Lecturer" : "Student";
  return (
    <div className="mx-6 w-full max-w-sm rounded-3xl border border-blue-400/30 bg-slate-900/90 p-6 text-center shadow-2xl shadow-blue-500/20 backdrop-blur-md animate-[popIn_0.25s_ease-out]">
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-blue-500/40 to-indigo-500/40 ring-2 ring-white/10">
        {person.avatar && person.avatar.startsWith("data:image") ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={person.avatar} alt="" className="h-full w-full object-cover" />
        ) : (
          <span className="text-lg font-semibold text-white">
            {initials(person.name.split(" ")[0], person.name.split(" ")[1])}
          </span>
        )}
      </div>

      <span className="mb-2 inline-flex items-center gap-1 rounded-full bg-blue-500/15 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-blue-300">
        {roleLabel}
      </span>
      <h3 className="text-lg font-semibold text-white">{person.name}</h3>
      {person.idValue && (
        <p className="mt-0.5 text-[12px] font-mono text-slate-400">
          {person.idLabel}: {person.idValue}
        </p>
      )}
      {(person.department || person.subtitle) && (
        <p className="mt-2 text-xs text-slate-300">
          {person.department}
          {person.subtitle ? ` · ${person.subtitle}` : ""}
        </p>
      )}

      <div
        className={`mt-4 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-medium ${
          isVerified ? "bg-emerald-500/15 text-emerald-200" : "bg-amber-500/15 text-amber-200"
        }`}
      >
        <span className={`h-1.5 w-1.5 rounded-full ${isVerified ? "bg-emerald-400" : "bg-amber-400"}`} />
        {isVerified ? "Identity verified" : `Status: ${person.status}`}
      </div>

      <div className="mt-5 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={onStop}
          className="inline-flex items-center justify-center gap-1.5 rounded-full bg-red-500/20 border border-red-400/30 px-4 py-2 text-sm font-medium text-red-200 transition hover:bg-red-500/30"
        >
          <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" strokeWidth="2.5" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h12v12H6z" />
          </svg>
          Stop
        </button>
        <button
          type="button"
          onClick={onContinue}
          className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition hover:shadow-blue-500/40"
        >
          {autoContinue ? "Continue" : "Scan next"}
        </button>
      </div>
    </div>
  );
}

type HistoryEntry = {
  id: string;
  scannedAt: string;
  scannedBy: { name: string; userType: string };
  purpose?: string;
  location?: string;
};

function StudentDetailsModal({
  student,
  scannedAt,
  purpose,
  location,
  onClose,
}: {
  student: ScannedStudent;
  scannedAt: string;
  purpose?: string;
  location?: string;
  onClose: () => void;
}) {
  const [history, setHistory] = useState<HistoryEntry[] | null>(null);
  const [historyTotal, setHistoryTotal] = useState<number | null>(null);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const fetchHistory = async () => {
      if (!student.studentId) return;
      setLoadingHistory(true);
      setHistoryError(null);
      try {
        const res = await qrService.getStudentAttendanceHistory(student.studentId, 1, 10);
        if (cancelled) return;
        setHistory(res.attendance as HistoryEntry[]);
        const total = (res.pagination as unknown as { total?: number; totalRecords?: number });
        setHistoryTotal(total.total ?? total.totalRecords ?? res.attendance.length);
      } catch (err) {
        if (!cancelled) {
          setHistoryError(err instanceof Error ? err.message : "Failed to load history");
        }
      } finally {
        if (!cancelled) setLoadingHistory(false);
      }
    };
    fetchHistory();
    return () => {
      cancelled = true;
    };
  }, [student.studentId]);

  // Close on ESC, lock body scroll while open
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  const scannedAtLabel = useMemo(() => {
    try {
      const d = new Date(scannedAt);
      return d.toLocaleString(undefined, {
        weekday: "short",
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return scannedAt;
    }
  }, [scannedAt]);

  const fmtTime = (iso: string) => {
    try {
      const d = new Date(iso);
      return d.toLocaleString(undefined, {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return iso;
    }
  };

  const isVerified = student.status === "active";

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-slate-950/70 backdrop-blur-md sm:items-center"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="student-details-heading"
    >
      <div
        className="relative w-full max-w-md overflow-hidden rounded-t-3xl border border-white/10 bg-slate-900/95 shadow-2xl shadow-emerald-500/10 backdrop-blur-xl sm:max-h-[90vh] sm:rounded-3xl"
        style={{ animation: "popIn 0.22s ease-out" }}
      >
        {/* Sheet drag handle (mobile cue) */}
        <div className="flex justify-center pt-2 sm:hidden">
          <span className="h-1 w-10 rounded-full bg-white/15" />
        </div>

        {/* Hero */}
        <div className="relative overflow-hidden px-6 pb-5 pt-5">
          <div
            aria-hidden
            className="absolute inset-0 -z-10 bg-gradient-to-br from-blue-500/20 via-indigo-500/10 to-emerald-500/15"
          />
          <div className="flex items-start gap-4">
            <div className="relative h-20 w-20 flex-shrink-0">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500/40 to-indigo-500/40 ring-2 ring-white/10" />
              <div className="absolute inset-0 flex items-center justify-center overflow-hidden rounded-2xl">
                {student.avatar && student.avatar.startsWith("data:image") ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={student.avatar} alt="" className="h-full w-full object-cover" />
                ) : (
                  <span className="text-2xl font-semibold text-white">
                    {initials(student.firstName, student.lastName)}
                  </span>
                )}
              </div>
              {isVerified && (
                <span
                  className="absolute -bottom-1 -right-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 ring-2 ring-slate-900"
                  title="Verified"
                  aria-label="Verified"
                >
                  <svg className="h-3.5 w-3.5 text-white" viewBox="0 0 24 24" fill="none" strokeWidth="3" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </span>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <h3 id="student-details-heading" className="truncate text-lg font-semibold text-white">
                {student.name}
              </h3>
              <p className="mt-0.5 truncate font-mono text-xs text-slate-400">{student.studentId}</p>
              {(student.department || student.year) && (
                <p className="mt-2 truncate text-xs text-slate-300">
                  {student.department}
                  {student.year ? ` · ${student.year}` : ""}
                </p>
              )}
              <span
                className={`mt-3 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                  isVerified
                    ? "bg-emerald-500/15 text-emerald-300"
                    : "bg-amber-500/15 text-amber-300"
                }`}
              >
                <span className="h-1 w-1 rounded-full bg-current" />
                {student.status}
              </span>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="ml-2 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-white/[0.06] text-slate-300 transition hover:bg-white/10 hover:text-white"
              aria-label="Close"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" strokeWidth="2.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Scrollable body */}
        <div className="max-h-[calc(90vh-12rem)] overflow-y-auto px-6 pb-6">
          {/* Identity facts */}
          <section className="mb-5">
            <h4 className="mb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
              Identity
            </h4>
            <dl className="grid grid-cols-1 gap-2 rounded-2xl border border-white/5 bg-white/[0.025] p-3">
              <DetailRow label="Full name" value={student.name} />
              <DetailRow
                label="Student ID"
                value={student.studentId || "—"}
                mono
              />
              <DetailRow
                label="Email"
                value={student.email || "—"}
                copyable={!!student.email}
              />
              <DetailRow label="Department" value={student.department || "—"} />
              {student.year && <DetailRow label="Year / Level" value={student.year} />}
            </dl>
          </section>

          {/* This scan */}
          <section className="mb-5">
            <h4 className="mb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
              This scan
            </h4>
            <dl className="grid grid-cols-1 gap-2 rounded-2xl border border-emerald-400/15 bg-emerald-500/[0.04] p-3">
              <DetailRow label="Recorded at" value={scannedAtLabel} />
              {purpose && <DetailRow label="Purpose" value={purpose} />}
              {location && <DetailRow label="Location" value={location} />}
            </dl>
          </section>

          {/* Recent attendance */}
          <section>
            <div className="mb-2 flex items-center justify-between">
              <h4 className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                Recent attendance
                {historyTotal != null && (
                  <span className="ml-2 rounded-full bg-white/[0.04] px-1.5 py-0.5 text-[9px] font-medium text-slate-400">
                    {historyTotal} total
                  </span>
                )}
              </h4>
            </div>

            {loadingHistory && (
              <div className="flex items-center justify-center rounded-2xl border border-white/5 bg-white/[0.025] py-6">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-emerald-300/60 border-t-transparent" />
              </div>
            )}

            {historyError && (
              <p className="rounded-2xl border border-red-500/20 bg-red-500/5 p-3 text-xs text-red-300">
                {historyError}
              </p>
            )}

            {history && history.length === 0 && !loadingHistory && (
              <p className="rounded-2xl border border-white/5 bg-white/[0.025] p-3 text-xs text-slate-500">
                No previous attendance records.
              </p>
            )}

            {history && history.length > 0 && (
              <ul className="divide-y divide-white/5 rounded-2xl border border-white/5 bg-white/[0.025]">
                {history.map((h) => (
                  <li key={h.id} className="flex items-start gap-3 px-3 py-2.5">
                    <div className="mt-1 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-emerald-500/15">
                      <svg className="h-3.5 w-3.5 text-emerald-300" viewBox="0 0 24 24" fill="none" strokeWidth="2.5" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium text-white">{fmtTime(h.scannedAt)}</p>
                      <p className="mt-0.5 truncate text-[11px] text-slate-400">
                        {h.purpose || "Attendance"}
                        {h.location ? ` · ${h.location}` : ""}
                        {" · scanned by "}
                        {h.scannedBy?.name || "—"}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        {/* Sticky footer */}
        <div className="border-t border-white/5 bg-slate-900/95 p-3">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/30 transition hover:shadow-emerald-500/50"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

function DetailRow({
  label,
  value,
  mono,
  copyable,
}: {
  label: string;
  value: string;
  mono?: boolean;
  copyable?: boolean;
}) {
  const [copied, setCopied] = useState(false);

  const copy = useCallback(async () => {
    if (!copyable) return;
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // ignore
    }
  }, [copyable, value]);

  return (
    <div className="flex items-start justify-between gap-3">
      <dt className="text-[11px] font-medium uppercase tracking-wide text-slate-500">{label}</dt>
      <dd className="flex min-w-0 flex-1 items-center justify-end gap-2 text-right">
        <span
          className={`truncate text-sm text-white ${mono ? "font-mono text-[13px]" : ""}`}
          title={value}
        >
          {value}
        </span>
        {copyable && (
          <button
            type="button"
            onClick={copy}
            className="flex-shrink-0 rounded-md p-1 text-slate-500 transition hover:bg-white/[0.06] hover:text-emerald-300"
            aria-label={`Copy ${label}`}
          >
            {copied ? (
              <svg className="h-3.5 w-3.5 text-emerald-300" viewBox="0 0 24 24" fill="none" strokeWidth="3" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" strokeWidth="2" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75" />
              </svg>
            )}
          </button>
        )}
      </dd>
    </div>
  );
}
