"use client";

import { useCallback, useEffect, useState } from "react";
import WalletCard from "./WalletCard";
import TopUpModal from "./TopUpModal";
import PaymentModal from "./PaymentModal";
import PendingPaymentsBanner from "./PendingPaymentsBanner";
import BankTransferCard from "./BankTransferCard";
import FeeCatalog from "./FeeCatalog";
import TransactionHistory from "./TransactionHistory";
import { paymentService } from "@/lib/paymentService";

interface PaymentsSectionProps {
  onBalanceChange?: (balance: number) => void;
  profile?: {
    firstName?: string;
    lastName?: string;
    phone?: string;
  };
}

export default function PaymentsSection({ onBalanceChange, profile }: PaymentsSectionProps) {
  const [refreshKey, setRefreshKey] = useState(0);
  const [walletBalance, setWalletBalance] = useState(0);
  const [showTopUp, setShowTopUp] = useState(false);
  const [showQuickPay, setShowQuickPay] = useState(false);

  const syncBalance = useCallback(async () => {
    try {
      const { wallet } = await paymentService.getWalletBalance();
      setWalletBalance(wallet.balance);
      onBalanceChange?.(wallet.balance);
    } catch {
      setWalletBalance(0);
      onBalanceChange?.(0);
    }
  }, [onBalanceChange]);

  const refreshAll = useCallback(async () => {
    setRefreshKey(k => k + 1);
    await syncBalance();
  }, [syncBalance]);

  useEffect(() => {
    syncBalance();
  }, [syncBalance, refreshKey]);

  return (
    <div className="space-y-6">
      <WalletCard
        refreshKey={refreshKey}
        onTopUpClick={() => setShowTopUp(true)}
        onPayClick={() => setShowQuickPay(true)}
      />

      <BankTransferCard
        refreshKey={refreshKey}
        onAccountReady={refreshAll}
        profile={profile}
      />

      <PendingPaymentsBanner refreshKey={refreshKey} onResolved={refreshAll} />

      <FeeCatalog
        refreshKey={refreshKey}
        walletBalance={walletBalance}
        onPaymentSuccess={refreshAll}
      />

      <TransactionHistory refreshKey={refreshKey} />

      <TopUpModal
        isOpen={showTopUp}
        onClose={() => setShowTopUp(false)}
        onSuccess={() => {}}
      />

      <PaymentModal
        isOpen={showQuickPay}
        onClose={() => setShowQuickPay(false)}
        onSuccess={refreshAll}
        walletBalance={walletBalance}
      />
    </div>
  );
}
