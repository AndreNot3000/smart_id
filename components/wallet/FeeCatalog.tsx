"use client";

import { useCallback, useEffect, useState } from "react";
import { paymentService, type PayableCatalogItem } from "@/lib/paymentService";

interface FeeCatalogProps {
  refreshKey?: number;
  walletBalance: number;
  onPaymentSuccess: () => void;
}

export default function FeeCatalog({
  refreshKey = 0,
  walletBalance,
  onPaymentSuccess,
}: FeeCatalogProps) {
  const [items, setItems] = useState<PayableCatalogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<PayableCatalogItem | null>(null);
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await paymentService.getCatalog();
      setItems(data.items);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load, refreshKey]);

  const openPay = (item: PayableCatalogItem) => {
    setSelected(item);
    setError("");
    setNote("");
    setAmount(item.fixedAmount != null ? String(item.fixedAmount) : "");
  };

  const handlePay = async () => {
    if (!selected) return;
    const amountNum = selected.fixedAmount ?? parseInt(amount, 10);
    if (!amountNum || amountNum < 1) {
      setError("Enter a valid amount");
      return;
    }
    if (walletBalance < amountNum) {
      setError(
        `Insufficient balance. You have ${paymentService.formatCurrency(walletBalance)} but need ${paymentService.formatCurrency(amountNum)}.`
      );
      return;
    }

    setBusy(true);
    setError("");
    try {
      await paymentService.payCatalogItem(
        selected.id,
        selected.allowCustomAmount ? amountNum : undefined,
        note.trim() || undefined
      );
      setSelected(null);
      onPaymentSuccess();
    } catch (e: unknown) {
      const err = e as Error & { currentBalance?: number; required?: number };
      if (err.currentBalance != null && err.required != null) {
        setError(
          `Insufficient balance. Available ${paymentService.formatCurrency(err.currentBalance)}, need ${paymentService.formatCurrency(err.required)}.`
        );
      } else {
        setError(err.message || "Payment failed");
      }
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-8 text-center text-slate-400 text-sm">
        Loading payment options…
      </div>
    );
  }

  return (
    <>
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-5">
        <h3 className="text-white font-semibold mb-1">Pay school fees & services</h3>
        <p className="text-slate-400 text-xs mb-4">
          Pay from your wallet balance — tuition, dues, cafeteria, and more.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {items.map(item => (
            <button
              key={item.id}
              type="button"
              onClick={() => openPay(item)}
              className="text-left p-4 rounded-xl border border-slate-600/80 bg-slate-700/25 hover:bg-slate-700/45 hover:border-slate-500 transition-colors"
            >
              <span className="text-2xl">{item.icon}</span>
              <p className="text-white font-medium text-sm mt-2">{item.title}</p>
              <p className="text-slate-400 text-xs mt-0.5 line-clamp-2">{item.description}</p>
              {item.fixedAmount != null ? (
                <p className="text-emerald-400 text-sm font-semibold mt-2">
                  {paymentService.formatCurrency(item.fixedAmount)}
                </p>
              ) : (
                <p className="text-slate-500 text-xs mt-2">
                  From {paymentService.formatCurrency(item.minAmount || 100)}
                </p>
              )}
            </button>
          ))}
        </div>
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl max-w-md w-full p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <span className="text-2xl">{selected.icon}</span>
                <h3 className="text-lg font-bold text-white mt-1">{selected.title}</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {error && (
              <p className="text-red-400 text-sm mb-3 bg-red-900/20 rounded-lg px-3 py-2">{error}</p>
            )}

            {selected.allowCustomAmount && selected.fixedAmount == null && (
              <div className="mb-4">
                <label className="text-slate-400 text-xs block mb-1">Amount (₦)</label>
                <input
                  type="number"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  min={selected.minAmount || 1}
                  max={selected.maxAmount || undefined}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-600 text-white"
                />
                {selected.minAmount != null && (
                  <p className="text-slate-500 text-xs mt-1">
                    Min {paymentService.formatCurrency(selected.minAmount)}
                    {selected.maxAmount
                      ? ` · Max ${paymentService.formatCurrency(selected.maxAmount)}`
                      : ""}
                  </p>
                )}
              </div>
            )}

            <div className="mb-4">
              <label className="text-slate-400 text-xs block mb-1">Note (optional)</label>
              <input
                value={note}
                onChange={e => setNote(e.target.value)}
                placeholder="e.g. 2024/2025 first semester"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-600 text-white text-sm"
              />
            </div>

            <p className="text-slate-400 text-xs mb-4">
              Wallet balance: {paymentService.formatCurrency(walletBalance)}
            </p>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="flex-1 py-2.5 rounded-xl bg-slate-700 text-white text-sm"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={handlePay}
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-medium disabled:opacity-50"
              >
                {busy ? "Processing…" : "Pay now"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
