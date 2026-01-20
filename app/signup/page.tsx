"use client";

import Link from "next/link";

export default function SignupPage() {
  return (
    <div className="min-h-screen">
      {/* Info Panel */}
      <div className="bg-gradient-to-br from-blue-900/20 to-purple-900/20 backdrop-blur-sm border-b border-slate-700/50 px-6 py-8">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Account Creation Process
          </h2>
          <p className="text-slate-300 mb-6">
            Student, Lecturer, and Admin accounts are created by your institution's administrators for security and verification purposes.
          </p>
        </div>
      </div>

      <div className="flex min-h-screen lg:min-h-auto">
        {/* Main Content */}
        <div className="flex-1 flex items-center justify-center px-6 py-12 lg:px-8">
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

            {/* Account Creation Info */}
            <div className="card-hover bg-slate-800/50 backdrop-blur-sm p-8 rounded-2xl border border-slate-700/50">
              <div className="text-center">
                <div className="h-16 w-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                
                <h3 className="text-2xl font-bold text-white mb-4">Account Creation</h3>
                <p className="text-slate-300 mb-6">
                  Your institution's administrators will create your account and send you an email with login instructions.
                </p>

                <div className="space-y-4 mb-8">
                  <div className="flex items-start space-x-3 text-left">
                    <div className="h-6 w-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-white text-xs">1</span>
                    </div>
                    <div>
                      <p className="text-white font-medium">Admin Creates Account</p>
                      <p className="text-slate-400 text-sm">Your institution admin creates your account with your details</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3 text-left">
                    <div className="h-6 w-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-white text-xs">2</span>
                    </div>
                    <div>
                      <p className="text-white font-medium">Email Verification</p>
                      <p className="text-slate-400 text-sm">You receive an email with a magic link to verify your account</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3 text-left">
                    <div className="h-6 w-6 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-white text-xs">3</span>
                    </div>
                    <div>
                      <p className="text-white font-medium">First Login</p>
                      <p className="text-slate-400 text-sm">Login with your credentials and change your default password</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <Link
                    href="/login"
                    className="block w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 rounded-lg transition-all duration-300"
                  >
                    Already Have an Account? Sign In
                  </Link>
                  
                  <Link
                    href="/register-institution"
                    className="block w-full border border-slate-600 text-slate-300 py-3 rounded-lg hover:bg-slate-700/50 transition-colors"
                  >
                    Register Your Institution
                  </Link>
                </div>
              </div>
            </div>

            {/* Contact Info */}
            <div className="mt-8 text-center">
              <p className="text-slate-400 text-sm mb-4">
                Don't have an account yet? Contact your institution's IT department or registrar.
              </p>
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="bg-slate-800/30 rounded-lg p-3">
                  <p className="text-slate-300 font-medium">Students</p>
                  <p className="text-slate-400">Contact Student Affairs</p>
                </div>
                <div className="bg-slate-800/30 rounded-lg p-3">
                  <p className="text-slate-300 font-medium">Staff</p>
                  <p className="text-slate-400">Contact HR Department</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Info Panel (Desktop Only) */}
        <div className="hidden lg:flex flex-1 bg-gradient-to-br from-blue-900/20 to-purple-900/20 backdrop-blur-sm border-l border-slate-700/50">
          <div className="flex flex-col justify-center px-12 py-16">
            <div className="max-w-md">
              <h2 className="text-3xl font-bold text-white mb-6">
                Secure Account Management
              </h2>
              <p className="text-slate-300 text-lg mb-8">
                Our institutional approach ensures security, proper verification, and seamless integration with your campus systems.
              </p>
              
              {/* Features List */}
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="h-8 w-8 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center">
                    <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <span className="text-slate-300">Verified institutional accounts</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="h-8 w-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                    <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                    </svg>
                  </div>
                  <span className="text-slate-300">Secure password management</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="h-8 w-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center">
                    <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <span className="text-slate-300">Email verification system</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="h-8 w-8 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-full flex items-center justify-center">
                    <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <span className="text-slate-300">Role-based access control</span>
                </div>
              </div>

              {/* Stats */}
              <div className="mt-12 grid grid-cols-2 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">500K+</div>
                  <div className="text-slate-400 text-sm">Verified Users</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">200+</div>
                  <div className="text-slate-400 text-sm">Institutions</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}