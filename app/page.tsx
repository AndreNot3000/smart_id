"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import CursorFX from "@/components/landing/CursorFX";

const FEATURES = [
  {
    title: "Digital Campus ID",
    desc: "Replace plastic cards with a signed JWT-backed QR code that lives on every student's phone.",
    accent: "from-blue-500 to-indigo-500",
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.875A.875.875 0 014.625 4h14.75a.875.875 0 01.875.875v14.25a.875.875 0 01-.875.875H4.625a.875.875 0 01-.875-.875V4.875zM8.25 8.25h2.25v2.25H8.25V8.25zm5.25 0h2.25v2.25h-2.25V8.25zM8.25 13.5h2.25v2.25H8.25V13.5zm5.25 0h2.25v2.25h-2.25V13.5z" />
    ),
    tag: "QR · NFC-ready",
  },
  {
    title: "QR Attendance",
    desc: "Lecturers scan students at the start of class. Attendance is stored, indexed and queryable by date or course.",
    accent: "from-emerald-500 to-teal-500",
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 7.5L7.5 3m13.5 4.5L16.5 3M3 16.5L7.5 21m13.5-4.5L16.5 21M7.5 12h9" />
    ),
    tag: "Real-time",
  },
  {
    title: "Smart Wallet",
    desc: "Naira wallet with Paystack-powered top-ups for tuition, meals and campus services. Indexed transaction history.",
    accent: "from-amber-500 to-orange-500",
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
    ),
    tag: "Paystack",
  },
  {
    title: "Class Schedules",
    desc: "Lecturers publish timetables. Students see their week live with polling updates &mdash; cancel, restore or announce changes in seconds.",
    accent: "from-purple-500 to-pink-500",
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
    ),
    tag: "Live updates",
  },
  {
    title: "Coursework &amp; Quizzes",
    desc: "Course materials, assignments with deadline reminders, online quizzes with timer, tab-switch tracking and plagiarism detection.",
    accent: "from-rose-500 to-red-500",
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
    ),
    tag: "Anti-cheat",
  },
  {
    title: "Multi-tenant Admin",
    desc: "One deployment, many institutions. Each university gets isolated data, its own admins, and a unique institution code.",
    accent: "from-cyan-500 to-blue-500",
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
    ),
    tag: "SaaS-native",
  },
];

export default function Home() {
  const [navScrolled, setNavScrolled] = useState(false);
  const [wallet, setWallet] = useState(0);
  const [activeFeature, setActiveFeature] = useState(0);
  const stageRef = useRef<HTMLDivElement>(null);
  const featureTrackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observerOptions = {
      threshold: 0.12,
      rootMargin: "0px 0px -60px 0px",
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) entry.target.classList.add("revealed");
      });
    }, observerOptions);

    document.querySelectorAll(".scroll-reveal").forEach((el) => observer.observe(el));

    const onScroll = () => setNavScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  // Count the wallet balance up on mount for an eye-catching reveal.
  useEffect(() => {
    const target = 24500;
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setWallet(target);
      return;
    }
    const duration = 1700;
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setWallet(Math.round(target * eased));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  // Cursor-driven 3D parallax tilt + glare for the hero ID card.
  const handleTilt = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = stageRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    el.style.setProperty("--ry", `${(px - 0.5) * 26}deg`);
    el.style.setProperty("--rx", `${(0.5 - py) * 22}deg`);
    el.style.setProperty("--mx", `${px * 100}%`);
    el.style.setProperty("--my", `${py * 100}%`);
  };

  const resetTilt = () => {
    const el = stageRef.current;
    if (!el) return;
    el.style.setProperty("--ry", "0deg");
    el.style.setProperty("--rx", "0deg");
    el.style.setProperty("--mx", "50%");
    el.style.setProperty("--my", "50%");
  };

  // Track the centred card in the mobile features carousel.
  const handleFeatureScroll = () => {
    const track = featureTrackRef.current;
    if (!track) return;
    const center = track.scrollLeft + track.clientWidth / 2;
    let nearest = 0;
    let min = Infinity;
    Array.from(track.children).forEach((child, i) => {
      const el = child as HTMLElement;
      const c = el.offsetLeft + el.offsetWidth / 2;
      const d = Math.abs(c - center);
      if (d < min) {
        min = d;
        nearest = i;
      }
    });
    setActiveFeature(nearest);
  };

  const scrollToFeature = (i: number) => {
    const track = featureTrackRef.current;
    if (!track) return;
    const el = track.children[i] as HTMLElement | undefined;
    if (el) track.scrollTo({ left: el.offsetLeft - (track.clientWidth - el.offsetWidth) / 2, behavior: "smooth" });
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#070d1c] text-slate-100">
      {/* Interactive cursor effect (desktop / fine-pointer only) */}
      <CursorFX />

      {/* Decorative background */}
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-grid-academic opacity-[0.05]" />
        <div className="absolute -top-40 left-1/3 h-[640px] w-[640px] -translate-x-1/2 rounded-full bg-blue-600/20 blur-[140px]" />
        <div className="absolute bottom-0 right-0 h-[520px] w-[520px] translate-x-1/3 rounded-full bg-amber-500/10 blur-[160px]" />
        <div className="absolute top-1/2 left-0 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-indigo-500/10 blur-[140px]" />
      </div>

      {/* Top announcement strip */}
      <div className="relative z-40 border-b border-amber-400/15 bg-gradient-to-r from-transparent via-amber-400/[0.06] to-transparent backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-center gap-2 px-4 py-2 text-center text-[12px] tracking-wide text-amber-100/80">
          <span className="inline-flex items-center gap-1.5 font-semibold text-amber-300">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-amber-400" />
            </span>
            LIVE
          </span>
          <span className="hidden sm:inline">·</span>
          <span>Onboarding Nigerian universities for the 2026/2027 academic session</span>
          <Link href="/register-institution" className="hidden font-semibold text-amber-200 underline-offset-4 hover:underline sm:inline">
            Register your institution →
          </Link>
        </div>
      </div>

      {/* Navigation */}
      <nav
        className={`sticky top-0 z-50 transition-all duration-300 ${
          navScrolled
            ? "border-b border-white/10 bg-[#070d1c]/85 backdrop-blur-xl"
            : "bg-transparent"
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="relative h-9 w-9">
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-blue-500 via-indigo-500 to-amber-500 opacity-90 transition-all group-hover:opacity-100" />
              <div className="absolute inset-[2px] flex items-center justify-center rounded-[10px] bg-[#070d1c]">
                <span className="bg-gradient-to-br from-amber-300 to-amber-500 bg-clip-text text-sm font-black tracking-tight text-transparent">
                  CI
                </span>
              </div>
            </div>
            <div className="flex flex-col leading-none">
              <span className="font-display text-lg font-semibold tracking-tight text-white">Campus ID</span>
              <span className="text-[10px] uppercase tracking-[0.18em] text-slate-400">Univ&middot;OS</span>
            </div>
          </Link>

          <div className="hidden items-center gap-8 md:flex">
            <a href="#features" className="text-sm text-slate-300 transition hover:text-white">Platform</a>
            <a href="#roles" className="text-sm text-slate-300 transition hover:text-white">For Universities</a>
            <a href="#security" className="text-sm text-slate-300 transition hover:text-white">Security</a>
            <Link href="/news" className="text-sm text-slate-300 transition hover:text-white">News</Link>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="hidden text-sm font-medium text-slate-200 transition hover:text-white sm:inline-block"
            >
              Sign in
            </Link>
            <Link
              href="/register-institution"
              className="group relative inline-flex items-center gap-1.5 overflow-hidden rounded-full bg-white px-4 py-2 text-sm font-semibold text-[#070d1c] shadow-[0_0_0_1px_rgba(255,255,255,0.06),0_8px_30px_-8px_rgba(244,184,76,0.5)] transition-all hover:shadow-[0_0_0_1px_rgba(244,184,76,0.4),0_10px_40px_-8px_rgba(244,184,76,0.6)]"
            >
              <span>Request access</span>
              <svg className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M13 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative px-6 pt-20 pb-24 sm:pt-28 sm:pb-32 lg:px-8">
        <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-16 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <div className="scroll-reveal inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs text-slate-300 backdrop-blur-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              <span className="font-medium tracking-wide">Multi-tenant SaaS · Built for African universities</span>
            </div>

            <h1 className="scroll-reveal mt-7 font-display text-[44px] font-semibold leading-[1.02] tracking-tight text-white sm:text-6xl lg:text-[72px]">
              The operating system
              <br />
              for the modern
              <span className="relative ml-3 inline-block">
                <span className="bg-gradient-to-br from-amber-200 via-amber-300 to-amber-500 bg-clip-text italic text-transparent">
                  university.
                </span>
                <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 300 12" fill="none" preserveAspectRatio="none">
                  <path d="M2 9C50 3 150 3 298 9" stroke="url(#u-underline)" strokeWidth="3" strokeLinecap="round" />
                  <defs>
                    <linearGradient id="u-underline" x1="0" y1="0" x2="300" y2="0">
                      <stop offset="0%" stopColor="#fcd34d" stopOpacity="0" />
                      <stop offset="50%" stopColor="#f59e0b" />
                      <stop offset="100%" stopColor="#fcd34d" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                </svg>
              </span>
            </h1>

            <p className="scroll-reveal mt-7 max-w-xl text-[17px] leading-relaxed text-slate-300/90">
              Replace plastic ID cards, paper attendance sheets, and scattered campus tools with one secure
              platform. <span className="text-slate-100">Campus ID</span> unifies identity, attendance, payments and
              learning &mdash; for every student, lecturer and administrator.
            </p>

            <div className="scroll-reveal mt-10 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
              <Link
                href="/register-institution"
                className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 px-7 py-3.5 text-[15px] font-semibold text-[#1a1305] shadow-[0_10px_40px_-10px_rgba(245,158,11,0.7)] transition-all hover:shadow-[0_14px_50px_-10px_rgba(245,158,11,0.9)]"
              >
                <span>Onboard your institution</span>
                <svg className="h-4 w-4 transition-transform group-hover:translate-x-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M13 5l7 7-7 7" />
                </svg>
              </Link>
              <Link
                href="/login"
                className="group inline-flex items-center gap-2 px-2 text-[15px] font-medium text-slate-200 transition hover:text-white"
              >
                <span className="relative">
                  Sign in to your campus
                  <span className="absolute -bottom-0.5 left-0 h-px w-0 bg-white transition-all group-hover:w-full" />
                </span>
                <svg className="h-4 w-4 opacity-70 transition-transform group-hover:translate-x-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>

            <div className="scroll-reveal mt-12 flex flex-wrap items-center gap-x-6 gap-y-3 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <svg className="h-3.5 w-3.5 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                <span>Production-deployed</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="h-3.5 w-3.5 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                <span>JWT &amp; bcrypt security</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="h-3.5 w-3.5 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                <span>Naira-native payments</span>
              </div>
            </div>
          </div>

          {/* Hero visual: interactive 3D ID card */}
          <div className="scroll-reveal relative lg:col-span-5">
            <div
              ref={stageRef}
              onMouseMove={handleTilt}
              onMouseLeave={resetTilt}
              className="hero-stage relative mx-auto h-[480px] w-full max-w-[420px]"
            >
              {/* Ambient aura + orbiting rings (replaces the emoji clutter) */}
              <div className="hero-aura" />
              <div className="hero-orbit hero-orbit-1">
                <span className="hero-orbit-dot" />
              </div>
              <div className="hero-orbit hero-orbit-2">
                <span className="hero-orbit-dot hero-orbit-dot-amber" />
              </div>
              <div className="hero-orbit hero-orbit-3">
                <span className="hero-orbit-dot hero-orbit-dot-emerald" />
              </div>

              {/* Tilt wrapper reacts to cursor position via CSS variables */}
              <div className="hero-tilt">
                <div className="hero-id-card">
                  <div className="id-card-inner relative">
                    {/* Holographic sheen + cursor glare + scan beam */}
                    <div className="id-card-sheen" />
                    <div className="id-card-glare" />
                    <div className="id-card-scan" />

                    <div className="id-card-header">
                      <div className="id-card-logo">CI</div>
                      <div className="id-card-title">CAMPUS · ID</div>
                      <div className="ml-auto inline-flex items-center gap-1 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2 py-0.5 text-[8px] font-bold tracking-wider text-emerald-300">
                        <span className="h-1 w-1 rounded-full bg-emerald-400 id-card-live" />
                        ACTIVE
                      </div>
                    </div>

                    <div className="id-card-avatar">
                      <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                      </svg>
                    </div>
                    <div className="id-card-name">Adaeze Okonkwo</div>
                    <div className="id-card-dept">Computer Science · 300L</div>

                    <div className="mt-3 flex items-center justify-between rounded-md border border-white/5 bg-black/20 px-2.5 py-2">
                      <div>
                        <div className="text-[8px] uppercase tracking-wider text-slate-500">Student ID</div>
                        <div className="text-[11px] font-mono font-semibold text-slate-200">CIU/24/CSC/0142</div>
                      </div>
                      {/* Gold smartcard chip — reads as a real ID card */}
                      <div className="id-card-chip" aria-hidden>
                        <span />
                        <span />
                        <span />
                        <span />
                      </div>
                    </div>

                    <div className="id-card-barcode">
                      {[...Array(20)].map((_, i) => (
                        <div key={i} />
                      ))}
                    </div>

                    {/* VERIFIED stamp flashes in after each scan pass */}
                    <div className="id-card-verified">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      VERIFIED
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating glass stat chips with depth + staggered entrance */}
              <div className="hero-chip hero-chip-attendance hidden sm:block">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500/20">
                    <svg className="h-4 w-4 text-emerald-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-xs text-slate-400">Attendance recorded</div>
                    <div className="text-sm font-semibold text-white">MTH301 · 09:14 AM</div>
                  </div>
                </div>
              </div>

              <div className="hero-chip hero-chip-wallet hidden sm:block">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-500/20">
                    <span className="font-bold text-amber-300">₦</span>
                  </div>
                  <div>
                    <div className="text-xs text-slate-400">Wallet balance</div>
                    <div className="text-sm font-semibold tabular-nums text-white">
                      ₦ {wallet.toLocaleString()}.00
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust strip */}
      <section className="relative border-y border-white/5 bg-white/[0.015] py-10">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <p className="mb-7 text-center text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
            Built on a modern, audited stack
          </p>
          <div className="grid grid-cols-2 items-center gap-x-4 gap-y-6 sm:grid-cols-3 lg:grid-cols-6">
            {[
              "Next.js 16",
              "MongoDB Atlas",
              "Bun · Hono",
              "Paystack",
              "JWT + Bcrypt",
              "Vercel · VPS",
            ].map((label) => (
              <div
                key={label}
                className="text-center font-display text-base font-medium tracking-tight text-slate-400/80 transition hover:text-slate-200"
              >
                {label}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats — realistic and product-focused */}
      <section className="relative px-6 py-24 lg:px-8">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-4">
          {[
            { num: "9", suffix: "", label: "Integrated modules", sub: "Auth, QR, Wallet, LMS…" },
            { num: "3", suffix: "", label: "Role tiers", sub: "Student · Lecturer · Admin" },
            { num: "<5", suffix: "min", label: "To onboard a school", sub: "From signup to dashboard" },
            { num: "100", suffix: "%", label: "Tenant data isolation", sub: "Per-institution security" },
          ].map((s) => (
            <div key={s.label} className="scroll-reveal text-center sm:text-left">
              <div className="flex items-baseline justify-center gap-1 sm:justify-start">
                <span className="font-display text-5xl font-semibold tracking-tight text-white">{s.num}</span>
                <span className="text-2xl font-medium text-amber-400">{s.suffix}</span>
              </div>
              <div className="mt-2 text-sm font-medium text-slate-200">{s.label}</div>
              <div className="mt-0.5 text-xs text-slate-500">{s.sub}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="relative px-6 py-24 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="scroll-reveal mx-auto max-w-2xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-400">The platform</p>
            <h2 className="mt-4 font-display text-4xl font-semibold tracking-tight text-white sm:text-5xl">
              Every campus workflow,
              <br />
              under one signed-in identity.
            </h2>
            <p className="mt-5 text-base text-slate-400">
              Nine integrated modules — built around a single multi-tenant user record. No more disconnected
              spreadsheets, paper forms, or vendor sprawl.
            </p>
          </div>

          {/* Mobile: snap carousel · Desktop: grid */}
          <div
            ref={featureTrackRef}
            onScroll={handleFeatureScroll}
            className="scroll-reveal no-scrollbar mt-12 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-px-6 px-6 pb-2 md:mt-16 md:grid md:grid-cols-2 md:gap-5 md:overflow-visible md:px-0 lg:grid-cols-3"
          >
            {FEATURES.map((f, i) => (
              <article
                key={f.title}
                className={`group relative w-[82%] shrink-0 snap-center overflow-hidden rounded-2xl border bg-gradient-to-b from-white/[0.04] to-white/[0.01] p-7 backdrop-blur-sm transition-all duration-500 ease-out hover:border-white/20 hover:bg-white/[0.06] sm:w-[58%] md:w-auto md:scale-100 md:border-white/10 md:opacity-100 ${
                  activeFeature === i
                    ? "scale-100 border-white/25 opacity-100 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.6)]"
                    : "scale-[0.9] border-white/10 opacity-50"
                }`}
              >
                <div
                  aria-hidden
                  className={`absolute -inset-px -z-10 rounded-2xl bg-gradient-to-br ${f.accent} opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-20 ${
                    activeFeature === i ? "opacity-20 md:opacity-0" : ""
                  }`}
                />

                <div className="flex items-start justify-between">
                  <div
                    className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${f.accent} shadow-lg transition-transform duration-500 group-hover:scale-110 ${
                      activeFeature === i ? "scale-110 md:scale-100" : ""
                    }`}
                  >
                    <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth="1.8" stroke="currentColor">
                      {f.icon}
                    </svg>
                  </div>
                  <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                    {f.tag}
                  </span>
                </div>

                <h3 className="mt-6 font-display text-xl font-semibold text-white" dangerouslySetInnerHTML={{ __html: f.title }} />
                <p
                  className="mt-3 text-sm leading-relaxed text-slate-400"
                  dangerouslySetInnerHTML={{ __html: f.desc }}
                />

                <div className="mt-6 flex items-center gap-2 text-xs font-medium text-slate-500 transition group-hover:text-amber-300">
                  Learn more
                  <svg className="h-3 w-3 transition-transform group-hover:translate-x-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M13 5l7 7-7 7" />
                  </svg>
                </div>
              </article>
            ))}
          </div>

          {/* Carousel pagination (mobile only) */}
          <div className="mt-6 flex items-center justify-center gap-2 md:hidden">
            {FEATURES.map((f, i) => (
              <button
                key={f.title}
                type="button"
                onClick={() => scrollToFeature(i)}
                aria-label={`Go to ${f.title.replace(/&amp;/g, "&")}`}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  activeFeature === i
                    ? "w-6 bg-amber-400"
                    : "w-1.5 bg-white/20 hover:bg-white/40"
                }`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Roles */}
      <section id="roles" className="relative px-6 py-28 lg:px-8">
        <div className="absolute inset-x-0 top-0 mx-auto h-px max-w-5xl bg-gradient-to-r from-transparent via-amber-400/40 to-transparent" />

        <div className="mx-auto max-w-7xl">
          <div className="scroll-reveal mx-auto max-w-2xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-400">Built for every campus role</p>
            <h2 className="mt-4 font-display text-4xl font-semibold tracking-tight text-white sm:text-5xl">
              One platform.
              <br />
              <span className="italic text-amber-300/90">Three audiences.</span>
            </h2>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-6 lg:grid-cols-3">
            {[
              {
                role: "Students",
                tagline: "Your campus in your pocket",
                color: "from-blue-500/20 to-indigo-500/5",
                border: "border-blue-500/20",
                items: [
                  "Digital ID with permanent QR code",
                  "Live class schedule with reminders",
                  "Naira wallet · fees & meal payments",
                  "Submit assignments, take quizzes",
                  "Attendance history & CGPA tracking",
                ],
              },
              {
                role: "Lecturers",
                tagline: "Teach, grade, track — in one app",
                color: "from-amber-500/20 to-orange-500/5",
                border: "border-amber-500/30",
                featured: true,
                items: [
                  "Scan QR to log student attendance",
                  "Publish & cancel classes on the fly",
                  "Upload materials, set assignments",
                  "Create timed online quizzes",
                  "Plagiarism check on submissions",
                ],
              },
              {
                role: "Administrators",
                tagline: "Run your institution like a product",
                color: "from-emerald-500/20 to-teal-500/5",
                border: "border-emerald-500/20",
                items: [
                  "Onboard students & lecturers in bulk",
                  "Auto-generated IDs (STU, FAC, EMP)",
                  "Department & course management",
                  "Real-time dashboard statistics",
                  "Institution-wide announcements",
                ],
              },
            ].map((r) => (
              <div
                key={r.role}
                className={`scroll-reveal group relative overflow-hidden rounded-3xl border ${
                  r.border
                } bg-gradient-to-b ${r.color} p-8 backdrop-blur-sm transition-all hover:-translate-y-1 ${
                  r.featured ? "lg:scale-[1.03] lg:shadow-[0_20px_60px_-20px_rgba(245,158,11,0.4)]" : ""
                }`}
              >
                {r.featured && (
                  <div className="absolute right-6 top-6 rounded-full bg-amber-400/90 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-950">
                    Faculty favorite
                  </div>
                )}
                <div className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  For {r.role.toLowerCase()}
                </div>
                <h3 className="font-display text-3xl font-semibold tracking-tight text-white">{r.role}</h3>
                <p className="mt-1 text-sm italic text-slate-300/80">{r.tagline}</p>

                <ul className="mt-7 space-y-3.5">
                  {r.items.map((item) => (
                    <li key={item} className="flex items-start gap-3 text-[14px] text-slate-200">
                      <span className="mt-1.5 inline-flex h-1.5 w-1.5 flex-shrink-0 rounded-full bg-amber-400" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="relative px-6 py-28 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="scroll-reveal mx-auto max-w-2xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-400">Onboarding</p>
            <h2 className="mt-4 font-display text-4xl font-semibold tracking-tight text-white sm:text-5xl">
              From signup to scan
              <br />
              <span className="italic text-amber-300/90">in under five minutes.</span>
            </h2>
          </div>

          <div className="mt-20 grid grid-cols-1 gap-4 lg:grid-cols-3">
            {[
              {
                step: "01",
                title: "Register your institution",
                desc: "Receive a unique institution code and the first admin account. No procurement cycle required.",
              },
              {
                step: "02",
                title: "Provision your community",
                desc: "Admins create students and lecturers. Each one gets an activation email with a magic link.",
              },
              {
                step: "03",
                title: "Go live on campus",
                desc: "Users activate accounts, claim their digital ID and start scanning, paying and learning.",
              },
            ].map((s, i) => (
              <div
                key={s.step}
                className="scroll-reveal relative rounded-2xl border border-white/10 bg-white/[0.02] p-8 backdrop-blur-sm"
              >
                <div className="flex items-baseline justify-between">
                  <span className="font-display text-5xl font-semibold tracking-tight text-amber-400/90">
                    {s.step}
                  </span>
                  {i < 2 && (
                    <svg
                      className="hidden h-5 w-12 text-amber-400/30 lg:block"
                      viewBox="0 0 60 20"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M0 10h54m-6-6l6 6-6 6" />
                    </svg>
                  )}
                </div>
                <h3 className="mt-6 font-display text-xl font-semibold text-white">{s.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-slate-400">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Security */}
      <section id="security" className="relative px-6 py-28 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-12">
            <div className="scroll-reveal lg:col-span-5">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-400">Trust &amp; security</p>
              <h2 className="mt-4 font-display text-4xl font-semibold leading-[1.05] tracking-tight text-white sm:text-5xl">
                Built like a bank.
                <br />
                <span className="italic text-slate-400">Audited like one too.</span>
              </h2>
              <p className="mt-6 max-w-md text-[15px] leading-relaxed text-slate-400">
                Every endpoint is protected by signed JWTs. Passwords are hashed with bcrypt at 12 rounds.
                Tenants are isolated at the database layer. Nothing leaves your institution&apos;s namespace.
              </p>

              <Link
                href="/register-institution"
                className="mt-9 inline-flex items-center gap-2 text-sm font-semibold text-amber-300 transition hover:text-amber-200"
              >
                See the architecture
                <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M13 5l7 7-7 7" />
                </svg>
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-3 lg:col-span-7">
              {[
                {
                  title: "JWT Authentication",
                  desc: "4-hour access tokens, 7-day refresh tokens, signed with rotated secrets.",
                  icon: "M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z",
                },
                {
                  title: "Bcrypt Password Hashing",
                  desc: "12-round salting. Last 5 passwords blocked from reuse on every change.",
                  icon: "M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z",
                },
                {
                  title: "Tenant Isolation",
                  desc: "Every record is institution-scoped. Cross-tenant access is structurally impossible.",
                  icon: "M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21",
                },
                {
                  title: "Rate Limiting",
                  desc: "5 login attempts per 15 minutes. OTPs with 10-minute TTL auto-expire in MongoDB.",
                  icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
                },
              ].map((s) => (
                <div
                  key={s.title}
                  className="scroll-reveal rounded-2xl border border-white/10 bg-white/[0.025] p-6 backdrop-blur-sm transition hover:border-amber-400/30 hover:bg-white/[0.04]"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-amber-400/30 bg-amber-400/10">
                    <svg
                      className="h-5 w-5 text-amber-300"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="1.8"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d={s.icon} />
                    </svg>
                  </div>
                  <h4 className="mt-4 font-display text-base font-semibold text-white">{s.title}</h4>
                  <p className="mt-2 text-[13px] leading-relaxed text-slate-400">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative px-6 py-28 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="scroll-reveal relative overflow-hidden rounded-[2rem] border border-amber-400/20 bg-gradient-to-br from-[#10182e] via-[#0d1428] to-[#1a1305] p-12 sm:p-16 lg:p-20">
            <div
              aria-hidden
              className="absolute -top-32 -right-32 h-[420px] w-[420px] rounded-full bg-amber-400/15 blur-[120px]"
            />
            <div
              aria-hidden
              className="absolute -bottom-32 -left-20 h-[360px] w-[360px] rounded-full bg-blue-500/15 blur-[120px]"
            />

            <div className="relative mx-auto max-w-3xl text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-400">
                The new academic standard
              </p>
              <h2 className="mt-5 font-display text-4xl font-semibold leading-tight tracking-tight text-white sm:text-6xl">
                Bring your campus
                <br />
                <span className="bg-gradient-to-br from-amber-200 via-amber-300 to-amber-500 bg-clip-text italic text-transparent">
                  into the 21st century.
                </span>
              </h2>
              <p className="mx-auto mt-7 max-w-xl text-[16px] leading-relaxed text-slate-300">
                Pilot Campus ID with your institution this semester. We&apos;ll have your admin
                signed in and your first student onboarded today.
              </p>

              <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Link
                  href="/register-institution"
                  className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 px-7 py-3.5 text-[15px] font-semibold text-[#1a1305] shadow-[0_10px_40px_-10px_rgba(245,158,11,0.7)] transition-all hover:shadow-[0_14px_50px_-10px_rgba(245,158,11,0.9)]"
                >
                  Register your institution
                  <svg className="h-4 w-4 transition-transform group-hover:translate-x-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M13 5l7 7-7 7" />
                  </svg>
                </Link>
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-7 py-3.5 text-[15px] font-medium text-white backdrop-blur transition hover:bg-white/10"
                >
                  Sign in
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative border-t border-white/5 bg-[#050a18] py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-10 sm:grid-cols-4 lg:grid-cols-5">
            <div className="col-span-2 lg:col-span-2">
              <Link href="/" className="flex items-center gap-2.5">
                <div className="relative h-9 w-9">
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-blue-500 via-indigo-500 to-amber-500" />
                  <div className="absolute inset-[2px] flex items-center justify-center rounded-[10px] bg-[#050a18]">
                    <span className="bg-gradient-to-br from-amber-300 to-amber-500 bg-clip-text text-sm font-black tracking-tight text-transparent">
                      CI
                    </span>
                  </div>
                </div>
                <div className="flex flex-col leading-none">
                  <span className="font-display text-lg font-semibold tracking-tight text-white">Campus ID</span>
                  <span className="text-[10px] uppercase tracking-[0.18em] text-slate-500">Univ&middot;OS</span>
                </div>
              </Link>
              <p className="mt-5 max-w-sm text-sm leading-relaxed text-slate-400">
                The operating system for the modern university. Identity, attendance, payments and learning &mdash;
                under one roof.
              </p>
              <p className="mt-4 text-xs text-slate-600">
                Made with care in Lagos, Nigeria &middot; Built for the African campus.
              </p>
            </div>

            <div>
              <h4 className="font-display text-sm font-semibold text-white">Platform</h4>
              <ul className="mt-4 space-y-3 text-sm text-slate-400">
                <li><a href="#features" className="hover:text-amber-300">Features</a></li>
                <li><a href="#roles" className="hover:text-amber-300">For Universities</a></li>
                <li><a href="#security" className="hover:text-amber-300">Security</a></li>
                <li><Link href="/news" className="hover:text-amber-300">News</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-display text-sm font-semibold text-white">Access</h4>
              <ul className="mt-4 space-y-3 text-sm text-slate-400">
                <li><Link href="/login" className="hover:text-amber-300">Sign in</Link></li>
                <li><Link href="/register-institution" className="hover:text-amber-300">Register institution</Link></li>
                <li><Link href="/forgot-password" className="hover:text-amber-300">Forgot password</Link></li>
                <li><Link href="/activate-account" className="hover:text-amber-300">Activate account</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-display text-sm font-semibold text-white">Legal</h4>
              <ul className="mt-4 space-y-3 text-sm text-slate-400">
                <li><a href="#" className="hover:text-amber-300">Privacy</a></li>
                <li><a href="#" className="hover:text-amber-300">Terms</a></li>
                <li><a href="#" className="hover:text-amber-300">Data policy</a></li>
                <li><a href="mailto:hello@smartunivid.xyz" className="hover:text-amber-300">Contact</a></li>
              </ul>
            </div>
          </div>

          <div className="mt-14 flex flex-col items-start gap-4 border-t border-white/5 pt-8 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-slate-500">
              &copy; {new Date().getFullYear()} Campus ID &middot; smartunivid.xyz. All rights reserved.
            </p>
            <div className="flex items-center gap-5 text-slate-500">
              <a href="#" aria-label="Twitter" className="transition hover:text-amber-300">
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </a>
              <a href="#" aria-label="LinkedIn" className="transition hover:text-amber-300">
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 0H5a5 5 0 00-5 5v14a5 5 0 005 5h14a5 5 0 005-5V5a5 5 0 00-5-5zM8 19H5V8h3v11zM6.5 6.732c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zM20 19h-3v-5.604c0-3.368-4-3.113-4 0V19h-3V8h3v1.765c1.396-2.586 7-2.777 7 2.476V19z" />
                </svg>
              </a>
              <a href="#" aria-label="GitHub" className="transition hover:text-amber-300">
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57v-2.04c-3.33.72-4.035-1.605-4.035-1.605-.54-1.395-1.335-1.755-1.335-1.755-1.08-.735.09-.72.09-.72 1.2.09 1.83 1.23 1.83 1.23 1.065 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.655-.3-5.445-1.32-5.445-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.545 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.92 1.23 3.225 0 4.62-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22v3.285c0 .315.225.69.825.57C20.565 21.795 24 17.31 24 12c0-6.63-5.37-12-12-12z" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
