"use client";

import { useEffect, useState } from "react";
import { paymentService, DedicatedAccount } from "@/lib/paymentService";
import GetAccountNumberModal from "./GetAccountNumberModal";

interface BankTransferCardProps {
  refreshKey?: number;
  onAccountReady?: () => void;
  profile?: {
    firstName?: string;
    lastName?: string;
    phone?: string;
  };
}

export default function BankTransferCard({
  refreshKey = 0,
  onAccountReady,
  profile,
}: BankTransferCardProps) {
  const [account, setAccount] = useState<DedicatedAccount | null>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [mockAmount, setMockAmount] = useState("1000");
  const [mockLoading, setMockLoading] = useState(false);

  const loadAccount = async () => {
    try {
      const { wallet } = await paymentService.getWalletBalance();
      setAccount(wallet.dedicatedAccount ?? null);
    } catch {
      setAccount(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    loadAccount();
  }, [refreshKey]);

  const copy = async (label: string, value: string) => {
    await paymentService.copyReference(value);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleSuccess = () => {
    loadAccount();
    onAccountReady?.();
  };

  if (loading) {
    return (
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6 animate-pulse h-32" />
    );
  }

  return (
    <>
      <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <span>🏦</span> Bank transfer
            </h3>
            <p className="text-slate-400 text-sm mt-1">
              Fund your wallet by transferring from any Nigerian bank app.
            </p>
          </div>
        </div>

        {account?.accountNumber && account.status === "active" ? (
          <div className="space-y-4">
            {account.isMock && (
              <div className="p-3 rounded-xl bg-violet-900/30 border border-violet-600/40">
                <p className="text-violet-200 text-sm font-medium">Demo account</p>
                <p className="text-violet-200/70 text-xs mt-1">
                  Paystack DVA is not enabled on your business. This number is for UI testing only — real
                  bank transfers will not arrive. Use the simulator below to test wallet credit.
                </p>
              </div>
            )}

            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-600/50">
              <p className="text-slate-400 text-xs uppercase tracking-wide mb-1">Account number</p>
              <div className="flex items-center justify-between gap-2">
                <p className="text-2xl font-mono font-bold text-white tracking-wider">
                  {account.accountNumber}
                </p>
                <button
                  type="button"
                  onClick={() => copy("number", account.accountNumber)}
                  className="text-blue-400 hover:text-blue-300 text-sm font-medium shrink-0"
                >
                  {copied === "number" ? "Copied!" : "Copy"}
                </button>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-3 text-sm">
              <div className="p-3 rounded-lg bg-slate-900/40">
                <p className="text-slate-500 text-xs">Bank</p>
                <p className="text-white font-medium">{account.bankName}</p>
              </div>
              <div className="p-3 rounded-lg bg-slate-900/40">
                <p className="text-slate-500 text-xs">Account name</p>
                <div className="flex items-center justify-between gap-2">
                  <p className="text-white font-medium truncate">{account.accountName}</p>
                  <button
                    type="button"
                    onClick={() => copy("name", account.accountName)}
                    className="text-blue-400 hover:text-blue-300 text-xs shrink-0"
                  >
                    {copied === "name" ? "✓" : "Copy"}
                  </button>
                </div>
              </div>
            </div>

            <p className="text-slate-500 text-xs">
              {account.isMock
                ? "Demo mode — simulate an incoming transfer below."
                : "Transfers are credited automatically. Use this account number only for your campus wallet."}
            </p>

            {account.isMock && (
              <div className="p-4 rounded-xl bg-slate-900/50 border border-dashed border-slate-600">
                <p className="text-slate-300 text-sm font-medium mb-2">Simulate incoming transfer</p>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min={100}
                    value={mockAmount}
                    onChange={(e) => setMockAmount(e.target.value)}
                    className="flex-1 bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm"
                    placeholder="Amount (₦)"
                  />
                  <button
                    type="button"
                    disabled={mockLoading}
                    onClick={async () => {
                      const amount = parseInt(mockAmount, 10);
                      if (!amount || amount < 100) return;
                      setMockLoading(true);
                      try {
                        await paymentService.simulateMockTransfer(amount);
                        await loadAccount();
                        onAccountReady?.();
                      } catch (err: unknown) {
                        alert(err instanceof Error ? err.message : "Simulation failed");
                      } finally {
                        setMockLoading(false);
                      }
                    }}
                    className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 disabled:opacity-50"
                  >
                    {mockLoading ? "…" : "Simulate"}
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : account?.status === "pending" ? (
          <div className="p-4 rounded-xl bg-amber-900/20 border border-amber-700/40">
            <p className="text-amber-200 text-sm font-medium">Account setup in progress</p>
            <p className="text-amber-200/80 text-xs mt-1">
              Your dedicated account number will appear here once Paystack finishes verification.
            </p>
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-slate-400 text-sm mb-4">
              Get a personal account number to receive transfers from family, sponsors, or your own bank.
            </p>
            <button
              type="button"
              onClick={() => setShowModal(true)}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-medium hover:from-emerald-700 hover:to-teal-700 transition-all"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
              </svg>
              Get account number
            </button>
          </div>
        )}
      </div>

      <GetAccountNumberModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSuccess={handleSuccess}
        initialFirstName={profile?.firstName}
        initialLastName={profile?.lastName}
        initialPhone={profile?.phone}
      />
    </>
  );
}
