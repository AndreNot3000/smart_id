"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";

const API_BASE_URL = 'http://localhost:8000/api';

export default function VerifyOTPPage() {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);
  const [email, setEmail] = useState('');
  const [institutionName, setInstitutionName] = useState('');
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const router = useRouter();

  useEffect(() => {
    // Get email from session storage
    const storedEmail = sessionStorage.getItem('verificationEmail');
    const storedInstitution = sessionStorage.getItem('institutionName');
    
    if (!storedEmail) {
      // If no email in session, redirect to signup
      router.push('/register-institution');
      return;
    }
    
    setEmail(storedEmail);
    setInstitutionName(storedInstitution || '');
    
    // Focus first input on mount
    inputRefs.current[0]?.focus();
    
    // Start countdown timer
    const timer = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [router]);

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return; // Prevent multiple characters
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError('');

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const otpCode = otp.join('');
    if (otpCode.length !== 6) {
      setError('Please enter the complete 6-digit code');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      console.log('Sending OTP verification request to:', `${API_BASE_URL}/auth/verify-otp`);
      console.log('Request body:', { email, code: otpCode });

      const response = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email,
          code: otpCode
        })
      });

      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Response data:', data);

      if (!response.ok) {
        throw new Error(data.message || data.error || 'Verification failed');
      }

      // Show success message
      setSuccess(true);
      console.log('OTP verified successfully, redirecting to login in 2 seconds');
      
      // Wait 2 seconds before redirecting
      setTimeout(() => {
        // Clear session storage
        sessionStorage.removeItem('verificationEmail');
        sessionStorage.removeItem('institutionName');
        sessionStorage.removeItem('institutionCode');
        sessionStorage.removeItem('adminId');
        
        // Navigate to login page after successful verification
        router.push('/signup');
      }, 2000);
    } catch (err: any) {
      console.error('OTP verification error:', err);
      
      // Check if it's a network error
      if (err.message === 'Failed to fetch') {
        setError('Cannot connect to server. Please make sure the backend is running on http://localhost:8000');
      } else {
        setError(err.message || 'Invalid OTP code. Please try again.');
      }
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    setResendTimer(60);
    setError('');
    
    try {
      // Call resend OTP API
      const response = await fetch(`${API_BASE_URL}/auth/resend-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      if (!response.ok) {
        throw new Error('Failed to resend code');
      }
      
      // Show success message (optional)
      console.log('OTP resent successfully');
    } catch (err) {
      setError('Failed to resend code. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center mb-8">
          <Link href="/" className="flex items-center space-x-2">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center icon-hover">
              <span className="text-white font-bold">ID</span>
            </div>
            <span className="text-2xl font-bold text-white">Campus ID</span>
          </Link>
        </div>  b

        {/* Main Card */}
        <div className="card-hover bg-slate-800/50 backdrop-blur-sm p-8 rounded-2xl border border-slate-700/50">
          <div className="text-center mb-8">
            <div className="h-16 w-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Verify Your Email</h2>
            <p className="text-slate-300">
              We've sent a 6-digit verification code to
            </p>
            <p className="text-blue-400 font-medium">{email}</p>
            {institutionName && (
              <p className="text-slate-400 text-sm mt-2">
                Institution: {institutionName}
              </p>
            )}
          </div>

          {/* OTP Input */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-300 mb-4 text-center">
              Enter verification code
            </label>
            <div className="flex justify-center space-x-3">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => {
                    inputRefs.current[index] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="w-12 h-12 text-center text-xl font-bold bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                />
              ))}
            </div>
          </div>

          {/* Success Message */}
          {success && (
            <div className="mb-4 p-3 bg-green-900/20 border border-green-700/50 rounded-lg">
              <p className="text-green-400 text-sm text-center flex items-center justify-center">
                <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                Email verified successfully! Redirecting to login...
              </p>
            </div>
          )}

          {/* Error Message */}
          {error && !success && (
            <div className="mb-4 p-3 bg-red-900/20 border border-red-700/50 rounded-lg">
              <p className="text-red-400 text-sm text-center">{error}</p>
            </div>
          )}

          {/* Verify Button */}
          <button
            onClick={handleVerify}
            disabled={isLoading || success || otp.join('').length !== 6}
            className="btn-primary w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-slate-600 disabled:to-slate-700 disabled:cursor-not-allowed text-white py-3 rounded-lg font-semibold mb-4 transition-all duration-300"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Verifying...
              </div>
            ) : success ? (
              <div className="flex items-center justify-center">
                <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                Verified!
              </div>
            ) : (
              'Verify Code'
            )}
          </button>

          {/* Resend Section */}
          <div className="text-center">
            <p className="text-slate-400 text-sm mb-2">
              Didn't receive the code?
            </p>
            {resendTimer > 0 ? (
              <p className="text-slate-500 text-sm">
                Resend code in {resendTimer}s
              </p>
            ) : (
              <button
                onClick={handleResend}
                className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors"
              >
                Resend Code
              </button>
            )}
          </div>
        </div>

        {/* Help Text */}
        <div className="mt-6 text-center">
          <p className="text-slate-400 text-sm">
            Having trouble? Check your spam folder or{' '}
            <Link href="#" className="text-blue-400 hover:text-blue-300 transition-colors">
              contact support
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}