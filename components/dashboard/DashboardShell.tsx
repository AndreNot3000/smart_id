"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import Icon, { type IconName } from "./Icon";
import { runTour, hasSeenTour, markTourSeen, type TourStep } from "@/lib/tour";
import { getApiUrl } from "@/lib/config";

export interface NavItem {
  id: string;
  name: string;
  icon: IconName;
  badge?: string | number;
}

export interface DashboardShellProps {
  role: "student" | "lecturer" | "admin";
  brand?: string;
  navItems: NavItem[];
  activeSection: string;
  onSelectSection: (id: string) => void;
  user: {
    name: string;
    subtitle?: string;
    secondary?: string;
    avatar?: string;
    initials: string;
  };
  pageTitle: string;
  pageSubtitle?: string;
  topbarActions?: ReactNode;
  children: ReactNode;
  /** Steps for the guided onboarding tour. When provided, a help button shows. */
  tourSteps?: TourStep[];
}

/**
 * Shared, professional dashboard frame: sidebar + topbar + main.
 *
 * Uses the design tokens defined in globals.css. Role determines accent color
 * via the [data-role] attribute on the root container.
 */
export default function DashboardShell({
  role,
  brand = "Campus ID",
  navItems,
  activeSection,
  onSelectSection,
  user,
  pageTitle,
  pageSubtitle,
  topbarActions,
  children,
  tourSteps,
}: DashboardShellProps) {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem("dashboard:sidebar-collapsed");
    if (stored === "true") setSidebarCollapsed(true);
  }, []);

  // Launch the guided tour. On small screens the sidebar is off-canvas, so we
  // open it first and expand the rail so nav steps are actually visible.
  const startTour = () => {
    if (!tourSteps?.length) return;
    const isDesktop =
      typeof window !== "undefined" &&
      window.matchMedia("(min-width: 1024px)").matches;
    if (isDesktop) {
      setSidebarCollapsed(false);
    } else {
      setSidebarOpen(true);
    }
    // Give the layout a tick to settle (sidebar slide-in) before spotlighting.
    window.setTimeout(() => {
      runTour(tourSteps, { onClose: () => setSidebarOpen(false) });
    }, 320);
  };

  // Auto-start once per role on a user's first visit.
  //
  // NOTE: we depend only on `role` (stable) — NOT on `tourSteps`, which is a
  // fresh array on every render and would otherwise cancel/reschedule the
  // timer endlessly. We also defer `markTourSeen` until the timer actually
  // fires, so React Strict Mode's mount→unmount→mount cycle (which clears the
  // first timer) still launches the tour on the second mount.
  useEffect(() => {
    if (!tourSteps?.length) return;
    if (hasSeenTour(role)) return;
    const t = window.setTimeout(() => {
      if (hasSeenTour(role)) return;
      markTourSeen(role);
      startTour();
    }, 800);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role]);

  const toggleCollapsed = () => {
    setSidebarCollapsed((prev) => {
      const next = !prev;
      if (typeof window !== "undefined") {
        window.localStorage.setItem("dashboard:sidebar-collapsed", String(next));
      }
      return next;
    });
  };

  const handleLogout = async () => {
    if (typeof window === "undefined") return;
    const token = sessionStorage.getItem("accessToken");
    // Best-effort server-side invalidation (bumps tokenVersion). We still clear
    // local storage and redirect even if the call fails or times out.
    if (token) {
      try {
        await fetch(getApiUrl("/api/users/logout"), {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch {
        // ignore network errors — local logout proceeds regardless
      }
    }
    sessionStorage.removeItem("accessToken");
    sessionStorage.removeItem("refreshToken");
    sessionStorage.removeItem("user");
    router.push("/login");
  };

  return (
    <div className="app-shell flex h-screen overflow-hidden" data-role={role}>
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`app-sidebar fixed inset-y-0 left-0 z-50 h-full shrink-0 ${
          sidebarCollapsed ? "w-[68px]" : "w-64"
        } flex flex-col transition-[width] duration-200 ease-out ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:relative lg:translate-x-0`}
      >
        <div className={`flex items-center justify-between ${sidebarCollapsed ? "px-2" : "px-4"} h-16 border-b border-[var(--border-subtle)]`}>
          <div className="flex items-center gap-2.5 min-w-0" data-tour="brand">
            <div className="h-8 w-8 rounded-lg flex items-center justify-center shrink-0"
                 style={{ background: "var(--accent)" }}>
              <span className="text-white font-bold text-[11px] tracking-wider">ID</span>
            </div>
            {!sidebarCollapsed && (
              <div className="min-w-0">
                <p className="text-[var(--text-primary)] font-semibold text-[15px] leading-tight truncate">
                  {brand}
                </p>
                <p className="text-[var(--text-muted)] text-[11px] uppercase tracking-wider">
                  {role}
                </p>
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            aria-label="Close menu"
          >
            <Icon name="close" />
          </button>
        </div>

        {!sidebarCollapsed && (
          <div className="px-4 py-4 border-b border-[var(--border-subtle)]" data-tour="profile-card">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full overflow-hidden flex items-center justify-center shrink-0"
                   style={{ background: "var(--surface-2)" }}>
                {user.avatar?.startsWith("data:image") ? (
                  <img src={user.avatar} alt="" className="h-full w-full object-cover" />
                ) : (
                  <span className="text-[var(--text-primary)] text-sm font-semibold">{user.initials}</span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[var(--text-primary)] text-sm font-medium truncate">{user.name}</p>
                {user.subtitle && (
                  <p className="text-[var(--text-muted)] text-xs truncate">{user.subtitle}</p>
                )}
              </div>
            </div>
          </div>
        )}

        <nav className={`flex-1 overflow-y-auto ${sidebarCollapsed ? "px-2" : "px-3"} py-4`} data-tour="nav">
          <ul className="space-y-1">
            {navItems.map((item) => {
              const active = activeSection === item.id;
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    title={sidebarCollapsed ? item.name : undefined}
                    data-active={active}
                    data-tour={`nav-${item.id}`}
                    onClick={() => {
                      onSelectSection(item.id);
                      setSidebarOpen(false);
                    }}
                    className={`nav-item w-full ${sidebarCollapsed ? "nav-item-collapsed" : ""}`}
                  >
                    <Icon name={item.icon} size={18} />
                    {!sidebarCollapsed && (
                      <span className="flex-1 text-left truncate">{item.name}</span>
                    )}
                    {!sidebarCollapsed && item.badge != null && (
                      <span className="pill pill-info text-[10px]">{item.badge}</span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className={`border-t border-[var(--border-subtle)] ${sidebarCollapsed ? "px-2" : "px-3"} py-3 space-y-1`}>
          <button
            type="button"
            title={sidebarCollapsed ? "Logout" : undefined}
            onClick={handleLogout}
            className={`nav-item w-full ${sidebarCollapsed ? "nav-item-collapsed" : ""}`}
          >
            <Icon name="logout" size={18} />
            {!sidebarCollapsed && <span className="flex-1 text-left">Logout</span>}
          </button>

          <button
            type="button"
            onClick={toggleCollapsed}
            className={`hidden lg:flex nav-item w-full ${sidebarCollapsed ? "nav-item-collapsed" : ""}`}
          >
            <Icon name={sidebarCollapsed ? "chevronRight" : "chevronLeft"} size={18} />
            {!sidebarCollapsed && <span className="flex-1 text-left">Collapse</span>}
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 min-h-0 overflow-hidden">
        <header className="app-topbar sticky top-0 z-30 shrink-0">
          <div className="h-16 flex items-center justify-between px-4 sm:px-6 gap-3">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <button
                type="button"
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                aria-label="Open menu"
              >
                <Icon name="menu" size={22} />
              </button>
              <div className="min-w-0">
                <h1 className="text-[var(--text-primary)] text-base sm:text-lg font-semibold tracking-tight truncate">
                  {pageTitle}
                </h1>
                {pageSubtitle && (
                  <p className="text-[var(--text-muted)] text-xs hidden sm:block truncate">{pageSubtitle}</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              {topbarActions}
              {tourSteps?.length ? (
                <button
                  type="button"
                  onClick={startTour}
                  data-tour="help"
                  title="Take a quick tour"
                  aria-label="Take a quick tour"
                  className="flex h-9 w-9 items-center justify-center rounded-full text-[var(--text-secondary)] transition hover:text-[var(--text-primary)]"
                  style={{ background: "var(--surface-2)", border: "1px solid var(--border-default)" }}
                >
                  <Icon name="help" size={18} />
                </button>
              ) : null}
              <div className="hidden md:flex flex-col items-end leading-tight">
                <p className="text-[var(--text-primary)] text-sm font-medium">{user.name.split(" ")[0]}</p>
                {user.secondary && (
                  <p className="text-[var(--text-muted)] text-xs">{user.secondary}</p>
                )}
              </div>
              <div className="h-9 w-9 rounded-full overflow-hidden flex items-center justify-center shrink-0"
                   data-tour="topbar-user"
                   style={{ background: "var(--surface-2)", border: "1px solid var(--border-default)" }}>
                {user.avatar?.startsWith("data:image") ? (
                  <img src={user.avatar} alt="" className="h-full w-full object-cover" />
                ) : (
                  <span className="text-[var(--text-primary)] text-xs font-semibold">{user.initials}</span>
                )}
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto min-h-0">
          <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-[1400px] mx-auto w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
