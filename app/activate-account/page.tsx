"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function ActivateAccountPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(true);
  const [error, setError] = useState('');
  const [tokenValid, setTokenValid] = useState(false);
  const [userInfo, setUserInfo] = useState<{
    email: string;
    fullName: string;
    role: string;
  } | null>(null);
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });

  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  useEffect(() => {
    // Verify activation token on page load
    const verifyToken = async () => {
      if (!token) {
        setError('Invalid activation link');
        setIsVerifying(false);
        return;
      }

      try {
        // TODO: Replace with actual API call
        // const response = await fetch(`/api/auth/verify-activation-token/${token}`);
        // const data = await response.json();

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Mock user data
        setUserInfo({
          email: 'john.doe@harvard.edu',
          fullName: 'John Doe',
          role: 'student'
        });
        setTokenValid(true);
      } catch (err) {
        setError('Invalid or expired activation link');
        setTokenValid(false);
      } finally {
        setIsVerifying(false);
      }
    };

    verifyToken();
  }, [token]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    // Validate password strength
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    setIsLoading(true);

    try {
      // TODO: Replace with actual API call
      // const response = await fetch('/api/auth/activate-account', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     token,
      //     password: formData.password
      //   })
      // });

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Navigate to appropriate dashboard based on role
      if (userInfo?.role === 'lecturer') {
        router.push('/lecturer-dashboard');
      } else if (userInfo?.role === 'admin') {
        router.push('/admin-dashboard');
      } else {
        router.push('/test-dashboard');
      }
    } catch (err) {
      setError('Account activation failed. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800">
      <div className="flex min-h-screen items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="flex items-center justify-center mb-8">
            <Link href="/" className="flex items-center space-x-2">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center icon-hover">
                <span className="text-white font-bold">ID</span>
              </div>
              <span className="text-2xl font-bold text-white">Campus ID</span>
            </Link>
          </div>

          {/* Form Card */}
          <div className="card-hover bg-slate-800/50 backdrop-blur-sm p-8 rounded-2xl border border-slate-700/50">
            {isVerifying ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                <p className="text-slate-300">Verifying activation link...</p>
              </div>
            ) : !tokenValid ? (
              <div className="text-center py-8">
                <div className="h-16 w-16 bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="h-8 w-8 text-red-400" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Invalid Link</h2>
                <p className="text-slate-300 mb-6">{error}</p>
                <Link 
                  href="/signup"
                  className="inline-block bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300"
                >
                  Go to Sign In
                </Link>
              </div>
            ) : (
              <>
                <div className="text-center mb-6">
                  <div className="h-16 w-16 bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="h-8 w-8 text-green-400" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2">Activate Your Account</h2>
                  <p className="text-slate-300 text-sm">
                    Welcome, {userInfo?.fullName}!
                  </p>
                  <p className="text-slate-400 text-xs mt-1">
                    {userInfo?.email}
                  </p>
                </div>

                {error && (
                  <div className="mb-4 p-3 bg-red-900/30 border border-red-700 rounded-lg">
                    <p className="text-red-400 text-sm">{error}</p>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Password */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Create Password <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      required
                      minLength={8}
                      className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                      placeholder="Create a strong password"
                    />
                    <p className="text-slate-400 text-xs mt-1">
                      Must be at least 8 characters long
                    </p>
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Confirm Password <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      required
                      minLength={8}
                      className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                      placeholder="Confirm your password"
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="btn-primary w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-slate-600 disabled:to-slate-700 disabled:cursor-not-allowed text-white py-3 rounded-lg font-semibold mt-6 transition-all duration-300"
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Activating Account...
                      </div>
                    ) : (
                      'Activate Account'
                    )}
                  </button>
                </form>
              </>
            )}
          </div>

          {/* Footer */}
          {tokenValid && (
            <div className="mt-6 text-center">
              <p className="text-slate-400 text-sm">
                Need help?{' '}
                <Link href="#" className="text-blue-400 hover:text-blue-300 transition-colors">
                  Contact Support
                </Link>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
