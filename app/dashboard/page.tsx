"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/** Legacy route — student UI lives at /test-dashboard */
export default function StudentDashboardRedirect() {
  const router = useRouter();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const section = params.get("section");
    const target = section ? `/test-dashboard?section=${encodeURIComponent(section)}` : "/test-dashboard";
    router.replace(target);
  }, [router]);

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center">
      <p className="text-slate-400">Redirecting to dashboard…</p>
    </div>
  );
}
