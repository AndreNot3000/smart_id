"use client";

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { paymentService } from '@/lib/paymentService';

export default function PaymentCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'verifying' | 'success' | 'failed'>('verifying');
  const [message, setMessage] = useState('');
  const [newBalance, setNewBalance] = useState<number | null>(null);
  const [amount, setAmount] = useState<number | null>(null);

  useEffect(() => {
    verifyPayment();
  }, []);

  const verifyPayment = async () => {
    try {
      // Extract reference from URL - Paystack uses both 'reference' and 'trxref'
      const reference = searchParams.get('reference') || searchParams.get('trxref');
      
      if (!reference) {
        setStatus('failed');
        setMessage('Payment reference not found in URL');
        console.error('No reference found. URL params:', {
          reference: searchParams.get('reference'),
          trxref: searchParams.get('trxref'),
          allParams: Array.from(searchParams.entries())
        });
        return;
      }

      console.log('Verifying payment with reference:', reference);

      // Call verify API
      const response = await paymentService.verifyPayment(reference);

      console.log('Verification response:', response);

      if (response.status === 'success') {
        setStatus('success');
        setMessage(response.message || 'Payment verified successfully!');
        setNewBalance(response.newBalance);
        setAmount(response.amount);

        // Redirect to payments page after 3 seconds
        setTimeout(() => {
          router.push('/test-dashboard?section=payments');
        }, 3000);
      } else {
        setStatus('failed');
        setMessage('Payment verification failed');
      }

    } catch (err: any) {
      console.error('Payment verification error:', err);
      setStatus('failed');
      setMessage(err.message || 'Failed to verify payment');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 flex items-center justify-center p-4">
      <div className="bg-slate-800/50 backdrop-blur-sm p-8 rounded-2xl border border-slate-700/50 max-w-md w-full">
        {/* Verifying State */}
        {status === 'verifying' && (
          <div className="text-center">
            <div className="relative inline-block mb-6">
              <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-2xl animate-pulse"></div>
              <div className="relative animate-spin rounded-full h-20 w-20 border-b-4 border-blue-500 mx-auto"></div>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Verifying Payment</h2>
            <p className="text-slate-400">Please wait while we confirm your payment...</p>
            <div className="mt-6 p-4 bg-blue-900/20 border border-blue-700/50 rounded-lg">
              <p className="text-blue-300 text-sm">
                <span className="font-semibold">💳 Processing</span>
                <br />
                This may take a few seconds
              </p>
            </div>
          </div>
        )}

        {/* Success State */}
        {status === 'success' && (
          <div className="text-center">
            <div className="relative inline-block mb-6">
              <div className="absolute inset-0 bg-green-500/20 rounded-full blur-2xl"></div>
              <div className="relative h-20 w-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
                <svg className="h-12 w-12 text-green-400" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            
            <h2 className="text-2xl font-bold text-white mb-2">Payment Successful!</h2>
            <p className="text-slate-400 mb-6">{message}</p>

            {amount && (
              <div className="mb-4 p-4 bg-green-900/20 border border-green-700/50 rounded-lg">
                <p className="text-green-400 text-sm mb-2">Amount Credited</p>
                <p className="text-3xl font-bold text-white">
                  {paymentService.formatCurrency(amount)}
                </p>
              </div>
            )}

            {newBalance !== null && (
              <div className="mb-6 p-4 bg-slate-700/30 rounded-lg">
                <p className="text-slate-400 text-sm mb-1">New Wallet Balance</p>
                <p className="text-2xl font-bold text-white">
                  {paymentService.formatCurrency(newBalance)}
                </p>
              </div>
            )}

            <div className="flex items-center justify-center space-x-2 text-slate-400 text-sm">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-slate-400"></div>
              <span>Redirecting to wallet...</span>
            </div>
          </div>
        )}

        {/* Failed State */}
        {status === 'failed' && (
          <div className="text-center">
            <div className="relative inline-block mb-6">
              <div className="absolute inset-0 bg-red-500/20 rounded-full blur-2xl"></div>
              <div className="relative h-20 w-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto">
                <svg className="h-12 w-12 text-red-400" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                </svg>
              </div>
            </div>
            
            <h2 className="text-2xl font-bold text-white mb-2">Payment Verification Failed</h2>
            <p className="text-slate-400 mb-6">{message}</p>

            <div className="mb-6 p-4 bg-red-900/20 border border-red-700/50 rounded-lg">
              <p className="text-red-300 text-sm">
                <span className="font-semibold">⚠️ What to do:</span>
                <br />
                If money was deducted, please contact support with your transaction reference.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => router.push('/test-dashboard?section=payments')}
                className="flex-1 bg-slate-700 text-white px-6 py-3 rounded-lg hover:bg-slate-600 transition-colors font-medium"
              >
                Go to Wallet
              </button>
              <button
                onClick={verifyPayment}
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-colors font-medium"
              >
                Retry Verification
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
