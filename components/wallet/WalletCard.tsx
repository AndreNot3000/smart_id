"use client";

import { useState, useEffect } from 'react';
import { paymentService, Wallet } from '@/lib/paymentService';

interface WalletCardProps {
  onTopUpClick: () => void;
  onPayClick: () => void;
}

export default function WalletCard({ onTopUpClick, onPayClick }: WalletCardProps) {
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const fetchWallet = async () => {
    try {
      setRefreshing(true);
      const response = await paymentService.getWalletBalance();
      setWallet(response.wallet);
      setError('');
    } catch (err: any) {
      console.error('Wallet fetch error:', err);
      // Set a default wallet with 0 balance instead of showing error
      setWallet({
        id: '',
        balance: 0,
        currency: 'NGN',
        isActive: false
      });
      // Only show error if it's not a 404 (wallet not found)
      if (!err.message.includes('404')) {
        setError(err.message || 'Failed to load wallet');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchWallet();
  }, []);

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 p-6 rounded-2xl shadow-2xl">
        <div className="animate-pulse">
          <div className="h-4 bg-white/20 rounded w-24 mb-4"></div>
          <div className="h-8 bg-white/20 rounded w-32 mb-6"></div>
          <div className="flex gap-3">
            <div className="h-10 bg-white/20 rounded flex-1"></div>
            <div className="h-10 bg-white/20 rounded flex-1"></div>
          </div>
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
            onClick={fetchWallet}
            className="text-blue-400 hover:text-blue-300 text-sm font-medium"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 p-6 rounded-2xl shadow-2xl overflow-hidden">
      {/* Animated Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-40 h-40 bg-white rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-40 h-40 bg-white rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-white/80 text-sm font-medium">Wallet Balance</p>
            <div className="flex items-baseline space-x-2">
              <h3 className="text-3xl font-bold text-white">
                {wallet ? paymentService.formatCurrency(wallet.balance) : '₦0'}
              </h3>
              <button
                onClick={fetchWallet}
                disabled={refreshing}
                className="text-white/60 hover:text-white transition-colors disabled:opacity-50"
              >
                <svg 
                  className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  strokeWidth="2" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                </svg>
              </button>
            </div>
          </div>
          
          <div className="h-12 w-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
            <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a2.25 2.25 0 00-2.25-2.25H15a3 3 0 11-6 0H5.25A2.25 2.25 0 003 12m18 0v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 9m18 0V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v3" />
            </svg>
          </div>
        </div>

        {/* Status */}
        {wallet && (
          <div className="mb-6">
            <span className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium ${
              wallet.isActive 
                ? 'bg-green-500/20 text-green-100' 
                : 'bg-red-500/20 text-red-100'
            }`}>
              <div className={`w-1.5 h-1.5 rounded-full ${wallet.isActive ? 'bg-green-100' : 'bg-red-100'}`}></div>
              <span>{wallet.isActive ? 'Active' : 'Inactive'}</span>
            </span>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onTopUpClick}
            className="flex-1 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white px-4 py-3 rounded-xl transition-all font-medium flex items-center justify-center space-x-2 border border-white/20"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            <span>Top Up</span>
          </button>
          
          <button
            onClick={onPayClick}
            className="flex-1 bg-white text-purple-600 hover:bg-white/90 px-4 py-3 rounded-xl transition-all font-medium flex items-center justify-center space-x-2 shadow-lg"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
            </svg>
            <span>Pay</span>
          </button>
        </div>
      </div>
    </div>
  );
}
