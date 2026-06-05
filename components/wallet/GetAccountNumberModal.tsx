"use client";

import { useState } from "react";
import { paymentService } from "@/lib/paymentService";

const NIGERIAN_BANKS = [
  { name: "Access Bank", code: "044" },
  { name: "GTBank", code: "058" },
  { name: "UBA", code: "033" },
  { name: "Zenith Bank", code: "057" },
  { name: "First Bank", code: "011" },
  { name: "FCMB", code: "214" },
  { name: "Wema Bank", code: "035" },
  { name: "Sterling Bank", code: "232" },
  { name: "Stanbic IBTC", code: "221" },
  { name: "Union Bank", code: "032" },
];

interface GetAccountNumberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialFirstName?: string;
  initialLastName?: string;
  initialPhone?: string;
}

export default function GetAccountNumberModal({
  isOpen,
  onClose,
  onSuccess,
  initialFirstName = "",
  initialLastName = "",
  initialPhone = "",
}: GetAccountNumberModalProps) {
  const [firstName, setFirstName] = useState(initialFirstName);
  const [lastName, setLastName] = useState(initialLastName);
  const [phone, setPhone] = useState(initialPhone);
  const [bvn, setBvn] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [bankCode, setBankCode] = useState("");
  const [useBvn, setUseBvn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await paymentService.provisionWalletAccount({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: phone.trim() || undefined,
        ...(useBvn && bvn
          ? {
              bvn: bvn.replace(/\D/g, ""),
              accountNumber: accountNumber.replace(/\D/g, ""),
              bankCode,
            }
          : {}),
      });
      onSuccess();
      onClose();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to get account number";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-xl">
        <div className="p-6 border-b border-slate-700">
          <h2 className="text-xl font-bold text-white">Get wallet account number</h2>
          <p className="text-slate-400 text-sm mt-1">
            Receive bank transfers into your campus wallet. If Paystack DVA is not on your account, a demo
            account number is created automatically for testing (no BVN needed).
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-red-900/30 border border-red-700/50 text-red-300 text-sm">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 text-xs mb-1">First name</label>
              <input
                type="text"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm"
              />
            </div>
            <div>
              <label className="block text-slate-400 text-xs mb-1">Last name</label>
              <input
                type="text"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-400 text-xs mb-1">Phone number</label>
            <input
              type="tel"
              placeholder="+2348012345678"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm"
            />
          </div>

          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={useBvn}
              onChange={(e) => setUseBvn(e.target.checked)}
              className="mt-1"
            />
            <span className="text-slate-300 text-sm">
              I have a BVN (required for live bank accounts in production)
            </span>
          </label>

          {useBvn && (
            <>
              <div>
                <label className="block text-slate-400 text-xs mb-1">BVN (11 digits)</label>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={11}
                  value={bvn}
                  onChange={(e) => setBvn(e.target.value.replace(/\D/g, "").slice(0, 11))}
                  className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-400 text-xs mb-1">Your bank account number</label>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={10}
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, "").slice(0, 10))}
                  className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-400 text-xs mb-1">Your bank</label>
                <select
                  required={useBvn}
                  value={bankCode}
                  onChange={(e) => setBankCode(e.target.value)}
                  className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm"
                >
                  <option value="">Select bank</option>
                  {NIGERIAN_BANKS.map((b) => (
                    <option key={b.code} value={b.code}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 rounded-xl bg-slate-700 text-white hover:bg-slate-600 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium hover:from-blue-700 hover:to-purple-700 disabled:opacity-50"
            >
              {loading ? "Setting up…" : "Get account number"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
