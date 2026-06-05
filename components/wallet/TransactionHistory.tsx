"use client";

import { useCallback, useEffect, useState } from "react";
import { paymentService, type HistoryFilter, type Transaction } from "@/lib/paymentService";

interface TransactionHistoryProps {
  refreshKey?: number;
}

export default function TransactionHistory({ refreshKey = 0 }: TransactionHistoryProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filter, setFilter] = useState<HistoryFilter>("all");
  const [copiedRef, setCopiedRef] = useState<string | null>(null);

  const fetchTransactions = useCallback(
    async (pageNum: number = 1, f: HistoryFilter = filter) => {
      try {
        setLoading(true);
        const response = await paymentService.getTransactionHistory(pageNum, 10, f);
        setTransactions(response.transactions);
        setTotalPages(response.pagination.totalPages);
        setPage(pageNum);
        setError("");
      } catch (err: unknown) {
        if (!(err instanceof Error && err.message.includes("404"))) {
          setError(err instanceof Error ? err.message : "Failed to load transactions");
        }
        setTransactions([]);
      } finally {
        setLoading(false);
      }
    },
    [filter]
  );

  useEffect(() => {
    fetchTransactions(1, filter);
  }, [filter, refreshKey, fetchTransactions]);

  const copyRef = async (ref: string) => {
    await paymentService.copyReference(ref);
    setCopiedRef(ref);
    setTimeout(() => setCopiedRef(null), 2000);
  };

  const filters: { id: HistoryFilter; label: string }[] = [
    { id: "all", label: "All" },
    { id: "credit", label: "Credits" },
    { id: "debit", label: "Debits" },
    { id: "pending", label: "Pending" },
  ];

  if (loading && transactions.length === 0) {
    return (
      <div className="bg-slate-800/50 backdrop-blur-sm p-6 rounded-2xl border border-slate-700/50">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-16 bg-slate-700/30 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-slate-800/50 backdrop-blur-sm p-6 rounded-2xl border border-slate-700/50 text-center">
        <p className="text-red-400 text-sm mb-3">{error}</p>
        <button
          type="button"
          onClick={() => fetchTransactions(page)}
          className="text-blue-400 text-sm"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm p-6 rounded-2xl border border-slate-700/50">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <h3 className="text-lg font-bold text-white">Transaction history</h3>
        <div className="flex rounded-lg border border-slate-600 overflow-hidden">
          {filters.map(f => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilter(f.id)}
              className={`px-3 py-1 text-xs ${
                filter === f.id ? "bg-slate-600 text-white" : "text-slate-400 hover:text-white"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {transactions.length === 0 ? (
        <p className="text-slate-400 text-sm text-center py-8">No transactions in this view</p>
      ) : (
        <div className="space-y-3">
          {transactions.map(transaction => (
            <div
              key={transaction.id || transaction.reference}
              className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg"
            >
              <div className="flex items-center space-x-3 flex-1 min-w-0">
                <div
                  className={`h-10 w-10 rounded-full flex items-center justify-center shrink-0 ${
                    transaction.transactionType === "credit"
                      ? "bg-green-500/20"
                      : "bg-red-500/20"
                  }`}
                >
                  <span className="text-lg">
                    {paymentService.getTransactionIcon(transaction.type)}
                  </span>
                </div>
                <div className="min-w-0">
                  <p className="text-white font-medium text-sm truncate">
                    {transaction.description ||
                      transaction.type.replace(/_/g, " ")}
                  </p>
                  <p className="text-slate-400 text-xs">
                    {new Date(transaction.createdAt).toLocaleString()}
                  </p>
                  <button
                    type="button"
                    onClick={() => copyRef(transaction.reference)}
                    className="text-slate-500 hover:text-slate-300 text-xs font-mono mt-0.5 truncate max-w-full text-left"
                  >
                    {copiedRef === transaction.reference ? "Copied!" : transaction.reference}
                  </button>
                </div>
              </div>
              <div className="text-right shrink-0 ml-3">
                <p
                  className={`font-bold text-sm ${
                    transaction.transactionType === "credit"
                      ? "text-green-400"
                      : "text-red-400"
                  }`}
                >
                  {transaction.transactionType === "credit" ? "+" : "-"}
                  {paymentService.formatCurrency(transaction.amount)}
                </p>
                <span
                  className={`text-xs px-2 py-0.5 rounded ${
                    transaction.status === "success"
                      ? "bg-green-900/30 text-green-400"
                      : transaction.status === "pending"
                        ? "bg-yellow-900/30 text-yellow-400"
                        : "bg-red-900/30 text-red-400"
                  }`}
                >
                  {transaction.status}
                </span>
                {transaction.balanceAfter != null && (
                  <p className="text-slate-500 text-xs mt-1">
                    Bal {paymentService.formatCurrency(transaction.balanceAfter)}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <button
            type="button"
            onClick={() => fetchTransactions(page - 1)}
            disabled={page === 1 || loading}
            className="px-4 py-2 bg-slate-700 text-white rounded-lg text-sm disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-slate-400 text-sm">
            {page} / {totalPages}
          </span>
          <button
            type="button"
            onClick={() => fetchTransactions(page + 1)}
            disabled={page === totalPages || loading}
            className="px-4 py-2 bg-slate-700 text-white rounded-lg text-sm disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
