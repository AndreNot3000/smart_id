"use client";

import { useState } from "react";
import { paymentService } from "@/lib/paymentService";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  walletBalance?: number;
}

const services = [
  { value: "tuition", label: "Tuition", icon: "🎓" },
  { value: "departmental_dues", label: "Dept. dues", icon: "🏛️" },
  { value: "cafeteria", label: "Cafeteria", icon: "🍽️" },
  { value: "library_fine", label: "Library", icon: "📚" },
  { value: "hostel", label: "Hostel", icon: "🏠" },
  { value: "transport", label: "Transport", icon: "🚌" },
  { value: "other", label: "Other", icon: "💳" },
] as const;

export default function PaymentModal({
  isOpen,
  onClose,
  onSuccess,
  walletBalance = 0,
}: PaymentModalProps) {
  const [serviceType, setServiceType] = useState<(typeof services)[number]["value"]>("other");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handlePayment = async () => {
    const amountNum = parseInt(amount, 10);

    if (!amountNum || amountNum <= 0) {
      setError("Please enter a valid amount");
      return;
    }

    if (walletBalance < amountNum) {
      setError(
        `Insufficient balance. You have ${paymentService.formatCurrency(walletBalance)}.`
      );
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await paymentService.payForService(
        serviceType,
        amountNum,
        description.trim() || undefined
      );

      setSuccess(`Payment successful! New balance: ${paymentService.formatCurrency(response.newBalance)}`);

      setTimeout(() => {
        onSuccess();
        onClose();
        setAmount("");
        setDescription("");
        setSuccess("");
      }, 1500);
    } catch (err: unknown) {
      const e = err as Error & { currentBalance?: number; required?: number };
      if (e.currentBalance != null && e.required != null) {
        setError(
          `Insufficient balance. Available ${paymentService.formatCurrency(e.currentBalance)}, need ${paymentService.formatCurrency(e.required)}.`
        );
      } else {
        setError(e.message || "Payment failed");
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-slate-800 rounded-2xl border border-slate-700 max-w-md w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-white">Quick payment</h3>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-white">
            ✕
          </button>
        </div>

        <p className="text-slate-400 text-xs mb-4">
          Balance: {paymentService.formatCurrency(walletBalance)}
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-900/20 border border-red-700/50 rounded-lg">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-900/20 border border-green-700/50 rounded-lg">
            <p className="text-green-400 text-sm">{success}</p>
          </div>
        )}

        <div className="mb-6">
          <label className="block text-sm font-medium text-slate-300 mb-3">Category</label>
          <div className="grid grid-cols-2 gap-2">
            {services.map(service => (
              <button
                key={service.value}
                type="button"
                onClick={() => setServiceType(service.value)}
                className={`p-3 rounded-lg border-2 transition-all ${
                  serviceType === service.value
                    ? "border-blue-500 bg-blue-500/20"
                    : "border-slate-600 bg-slate-700 hover:border-slate-500"
                }`}
              >
                <div className="text-2xl mb-1">{service.icon}</div>
                <div className="text-white text-sm font-medium">{service.label}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-slate-300 mb-2">Amount (₦)</label>
          <input
            type="number"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            className="w-full pl-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white"
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Description (optional)
          </label>
          <input
            type="text"
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="What is this payment for?"
            className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white"
          />
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="flex-1 px-4 py-3 bg-slate-700 text-white rounded-lg"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handlePayment}
            disabled={loading || !amount}
            className="flex-1 px-4 py-3 bg-emerald-600 text-white rounded-lg font-medium disabled:opacity-50"
          >
            {loading ? "Processing…" : "Pay now"}
          </button>
        </div>
      </div>
    </div>
  );
}
