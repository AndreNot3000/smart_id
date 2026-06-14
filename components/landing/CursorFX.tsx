"use client";

import { useEffect, useRef } from "react";

/**
 * Interactive cursor effect for the marketing/landing page.
 *
 * - A smooth, glowing "comet" trail flows behind the pointer (canvas, additive
 *   blending for a neon look) using a lerp chain so it keeps flowing even when
 *   the mouse pauses.
 * - An ambient spotlight follows the cursor and lights up the dark UI.
 *
 * Disabled on touch / coarse-pointer devices and when the user prefers
 * reduced motion. Purely decorative, so it never intercepts pointer events.
 */
export default function CursorFX() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const spotRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)").matches;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduce) return;

    const canvas = canvasRef.current;
    const spot = spotRef.current;
    if (!canvas || !spot) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = 0;
    let h = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const N = 20;
    const mouse = { x: w / 2, y: h / 2 };
    const pts = Array.from({ length: N }, () => ({ x: mouse.x, y: mouse.y }));
    let seen = false;

    // Brand colours: head = amber, tail = indigo.
    const head = [251, 191, 36];
    const tail = [129, 140, 248];
    const mix = (i: number) => {
      const t = i / (N - 1);
      return [
        Math.round(head[0] + (tail[0] - head[0]) * t),
        Math.round(head[1] + (tail[1] - head[1]) * t),
        Math.round(head[2] + (tail[2] - head[2]) * t),
      ];
    };

    const onMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      if (!seen) {
        // Snap the trail to the first known position to avoid a swoop-in.
        for (const p of pts) {
          p.x = mouse.x;
          p.y = mouse.y;
        }
        seen = true;
      }
      spot.style.setProperty("--x", `${e.clientX}px`);
      spot.style.setProperty("--y", `${e.clientY}px`);
      spot.style.opacity = "1";
    };
    const onLeave = () => {
      spot.style.opacity = "0";
    };
    const onDown = () => {
      spot.style.setProperty("--spot-scale", "1.35");
    };
    const onUp = () => {
      spot.style.setProperty("--spot-scale", "1");
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("mouseout", onLeave);
    window.addEventListener("mousedown", onDown);
    window.addEventListener("mouseup", onUp);

    let raf = 0;
    const tick = () => {
      // Glue the head to the real cursor (no lag), tail follows via lerp chain.
      pts[0].x = mouse.x;
      pts[0].y = mouse.y;
      for (let i = 1; i < N; i++) {
        pts[i].x += (pts[i - 1].x - pts[i].x) * 0.5;
        pts[i].y += (pts[i - 1].y - pts[i].y) * 0.5;
      }

      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = "lighter";
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      // No per-segment shadowBlur (very expensive). Glow comes from a wide,
      // faint additive pass under a brighter core pass.
      ctx.shadowBlur = 0;

      for (let i = 0; i < N - 1; i++) {
        const p = pts[i];
        const q = pts[i + 1];
        const t = 1 - i / N;
        const [r, g, b] = mix(i);

        // Soft glow pass.
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(q.x, q.y);
        ctx.lineWidth = t * 16;
        ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${t * 0.12})`;
        ctx.stroke();

        // Bright core pass.
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(q.x, q.y);
        ctx.lineWidth = t * 5;
        ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${t * 0.6})`;
        ctx.stroke();
      }

      // Bright glowing head via a cheap radial gradient (no shadowBlur).
      const hx = pts[0].x;
      const hy = pts[0].y;
      const grd = ctx.createRadialGradient(hx, hy, 0, hx, hy, 12);
      grd.addColorStop(0, "rgba(255, 248, 224, 0.95)");
      grd.addColorStop(0.35, "rgba(251, 191, 36, 0.55)");
      grd.addColorStop(1, "rgba(251, 191, 36, 0)");
      ctx.fillStyle = grd;
      ctx.beginPath();
      ctx.arc(hx, hy, 12, 0, Math.PI * 2);
      ctx.fill();

      ctx.globalCompositeOperation = "source-over";
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseout", onLeave);
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("mouseup", onUp);
    };
  }, []);

  return (
    <>
      <div ref={spotRef} className="cursor-spot" aria-hidden />
      <canvas ref={canvasRef} className="cursor-canvas" aria-hidden />
    </>
  );
}
