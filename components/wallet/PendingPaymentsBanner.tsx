"use client";

import { useCallback, useEffect, useState } from "react";
import { paymentService, type PendingTopUp } from "@/lib/paymentService";

interface PendingPaymentsBannerProps {
  refreshKey?: number;
  onResolved?: () => void;
}

export default function PendingPaymentsBanner({
  refreshKey = 0,
  onResolved,
}: PendingPaymentsBannerProps) {
  const [pending, setPending] = useState<PendingTopUp[]>([]);
  const [verifying, setVerifying] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  const load = useCallback(async () => {
    try {
      const data = await paymentService.getPendingTopUps();
      setPending(data.pending);
    } catch {
      setPending([]);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load, refreshKey]);

  const verifyOne = async (reference: string) => {
    setVerifying(reference);
    setMessage("");
    try {
      await paymentService.verifyPayment(reference);
      setMessage("Payment confirmed — wallet updated.");
      await load();
      onResolved?.();
    } catch (e: unknown) {
      setMessage(e instanceof Error ? e.message : "Verification failed");
    } finally {
      setVerifying(null);
    }
  };

  if (pending.length === 0 && !message) return null;

  return (
    <div className="rounded-2xl border border-amber-500/40 bg-amber-900/20 p-4">
      <h3 className="text-amber-200 font-semibold text-sm mb-2">Pending top-ups</h3>
      <p className="text-amber-100/80 text-xs mb-3">
        If you paid via Paystack but your balance did not update, tap verify below.
      </p>
      {message && (
        <p className="text-sm text-emerald-300 mb-3">{message}</p>
      )}
      <ul className="space-y-2">
        {pending.map(p => (
          <li
            key={p.reference}
            className="flex flex-wrap items-center justify-between gap-2 bg-slate-900/40 rounded-xl px-3 py-2"
          >
            <div>
              <p className="text-white font-medium">
                {paymentService.formatCurrency(p.amount)}
              </p>
              <p className="text-slate-400 text-xs font-mono truncate max-w-[200px]">
                {p.reference}
              </p>
            </div>
            <button
              type="button"
              disabled={verifying === p.reference}
              onClick={() => verifyOne(p.reference)}
              className="px-3 py-1.5 rounded-lg bg-amber-600 text-white text-xs font-medium disabled:opacity-50"
            >
              {verifying === p.reference ? "Checking…" : "Verify payment"}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
