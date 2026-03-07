"use client";

import { useState, useEffect } from 'react';
import { paymentService, Transaction } from '@/lib/paymentService';

export default function TransactionHistory() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchTransactions = async (pageNum: number = 1) => {
    try {
      setLoading(true);
      const response = await paymentService.getTransactionHistory(pageNum, 10);
      setTransactions(response.transactions);
      setTotalPages(response.pagination.totalPages);
      setPage(pageNum);
      setError('');
    } catch (err: any) {
      console.error('Transaction fetch error:', err);
      // Don't show error for empty transactions (404)
      if (!err.message.includes('404')) {
        setError(err.message || 'Failed to load transactions');
      }
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading && transactions.length === 0) {
    return (
      <div className="bg-slate-800/50 backdrop-blur-sm p-6 rounded-2xl border border-slate-700/50">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg">
              <div className="flex items-center space-x-3 flex-1">
                <div className="h-10 w-10 bg-slate-600 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-slate-600 rounded w-32 mb-2"></div>
                  <div className="h-3 bg-slate-600 rounded w-24"></div>
                </div>
              </div>
              <div className="h-4 bg-slate-600 rounded w-20"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-slate-800/50 backdrop-blur-sm p-6 rounded-2xl border border-slate-700/50">
        <div className="text-center">
          <div className="h-12 w-12 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg className="h-6 w-6 text-red-400" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
          </div>
          <p className="text-red-400 text-sm mb-3">{error}</p>
          <button
            onClick={() => fetchTransactions(page)}
            className="text-blue-400 hover:text-blue-300 text-sm font-medium"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="bg-slate-800/50 backdrop-blur-sm p-8 rounded-2xl border border-slate-700/50">
        <div className="text-center">
          <div className="h-16 w-16 bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="h-8 w-8 text-slate-400" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">No Transactions Yet</h3>
          <p className="text-slate-400 text-sm">Your transaction history will appear here</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm p-6 rounded-2xl border border-slate-700/50">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-white">Transaction History</h3>
        <button
          onClick={() => fetchTransactions(page)}
          disabled={loading}
          className="text-blue-400 hover:text-blue-300 text-sm font-medium disabled:opacity-50"
        >
          <svg className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
          </svg>
        </button>
      </div>

      <div className="space-y-3">
        {transactions.map((transaction) => (
          <div
            key={transaction.id}
            className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg hover:bg-slate-700/50 transition-colors"
          >
            <div className="flex items-center space-x-3 flex-1 min-w-0">
              {/* Icon */}
              <div className={`h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                transaction.transactionType === 'credit'
                  ? 'bg-green-500/20'
                  : 'bg-red-500/20'
              }`}>
                <span className="text-lg">
                  {paymentService.getTransactionIcon(transaction.type)}
                </span>
              </div>

              {/* Details */}
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium text-sm truncate">
                  {transaction.description || transaction.type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </p>
                <div className="flex items-center space-x-2 mt-1">
                  <p className="text-slate-400 text-xs">
                    {formatDate(transaction.createdAt)}
                  </p>
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                    transaction.status === 'success'
                      ? 'bg-green-900/30 text-green-400'
                      : transaction.status === 'pending'
                      ? 'bg-yellow-900/30 text-yellow-400'
                      : 'bg-red-900/30 text-red-400'
                  }`}>
                    {transaction.status}
                  </span>
                </div>
              </div>
            </div>

            {/* Amount */}
            <div className="text-right flex-shrink-0 ml-4">
              <p className={`font-bold text-sm ${
                transaction.transactionType === 'credit'
                  ? 'text-green-400'
                  : 'text-red-400'
              }`}>
                {transaction.transactionType === 'credit' ? '+' : '-'}
                {paymentService.formatCurrency(transaction.amount)}
              </p>
              <p className="text-slate-400 text-xs mt-1">
                Bal: {paymentService.formatCurrency(transaction.balanceAfter)}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center space-x-2 mt-6">
          <button
            onClick={() => fetchTransactions(page - 1)}
            disabled={page === 1 || loading}
            className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <span className="text-slate-400 text-sm">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => fetchTransactions(page + 1)}
            disabled={page === totalPages || loading}
            className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
