"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [message, setMessage] = useState('');
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const token = searchParams.get('token');
    const email = searchParams.get('email');

    if (!token || !email) {
      setStatus('error');
      setMessage('Invalid verification link. Please check your email and try again.');
      return;
    }

    verifyEmail(token, email);
  }, [searchParams]);

  useEffect(() => {
    if (status === 'success' && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);

      return () => clearTimeout(timer);
    } else if (status === 'success' && countdown === 0) {
      router.push('/login');
    }
  }, [status, countdown, router]);

  const verifyEmail = async (token: string, email: string) => {
    try {
      const response = await fetch(`http://localhost:8000/api/auth/verify-email?token=${token}&email=${email}`, {
        method: 'GET',
      });

      const data = await response.json();

      if (response.ok) {
        setStatus('success');
        setMessage('Your email has been verified successfully! Your account is now active.');
      } else {
        setStatus('error');
        setMessage(data.message || 'Email verification failed. The link may be expired or invalid.');
      }
    } catch (error) {
      setStatus('error');
      setMessage('An error occurred during verification. Please try again or contact support.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center space-x-2 mb-4">
            <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <span className="text-white font-bold text-xl">ID</span>
            </div>
            <span className="text-2xl font-bold text-white">Campus ID</span>
          </div>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-sm p-8 rounded-2xl border border-slate-700/50 text-center">
          {status === 'verifying' && (
            <>
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <h1 className="text-2xl font-bold text-white mb-4">Verifying Your Email</h1>
              <p className="text-slate-300">
                Please wait while we verify your email address...
              </p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="h-12 w-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-green-400 mb-4">Email Verified!</h1>
              <p className="text-slate-300 mb-6">{message}</p>
              <div className="bg-green-500/10 border border-green-500/50 text-green-400 px-4 py-3 rounded-lg text-sm mb-6">
                Redirecting to login page in {countdown} seconds...
              </div>
              <Link
                href="/login"
                className="inline-block bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300"
              >
                Go to Login Now
              </Link>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="h-12 w-12 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-red-400 mb-4">Verification Failed</h1>
              <p className="text-slate-300 mb-6">{message}</p>
              <div className="space-y-3">
                <Link
                  href="/login"
                  className="block w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 rounded-lg transition-all duration-300"
                >
                  Go to Login
                </Link>
                <Link
                  href="/forgot-password"
                  className="block w-full border border-slate-600 text-slate-300 py-3 rounded-lg hover:bg-slate-700/50 transition-colors"
                >
                  Request New Verification
                </Link>
              </div>
            </>
          )}
        </div>

        <div className="mt-6 text-center text-sm text-slate-400">
          Need help?{" "}
          <Link href="/forgot-password" className="text-blue-400 hover:text-blue-300 font-medium">
            Contact Support
          </Link>
        </div>
      </div>
    </div>
  );
}