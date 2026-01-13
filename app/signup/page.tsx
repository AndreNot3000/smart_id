"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const [activeTab, setActiveTab] = useState<'signup' | 'signin'>('signup');
  const [userType, setUserType] = useState<'student' | 'admin' | 'lecturer'>('student');
  const router = useRouter();

  return (
    <div className="min-h-screen">
      {/* Mobile Info Panel - Visible on smaller screens */}
      <div className="lg:hidden bg-gradient-to-br from-blue-900/20 to-purple-900/20 backdrop-blur-sm border-b border-slate-700/50 px-6 py-8">
        <div className="max-w-md mx-auto text-center">
          <h2 className="text-2xl font-bold text-white mb-4">
            Join the Digital Campus Revolution
          </h2>
          <p className="text-slate-300 mb-6">
            Experience the future of campus life with secure, convenient, and modern digital identity management.
          </p>
          
          {/* Mobile Features Grid */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="flex flex-col items-center">
              <div className="h-10 w-10 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mb-2">
                <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="text-slate-300 text-sm">Instant Access</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="h-10 w-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mb-2">
                <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="text-slate-300 text-sm">Secure Payments</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="h-10 w-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center mb-2">
                <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="text-slate-300 text-sm">Real-time Sync</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="h-10 w-10 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-full flex items-center justify-center mb-2">
                <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="text-slate-300 text-sm">Multi-device</span>
            </div>
          </div>

          {/* Mobile Stats */}
          <div className="flex justify-center space-x-8">
            <div className="text-center">
              <div className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">500K+</div>
              <div className="text-slate-400 text-xs">Students</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">200+</div>
              <div className="text-slate-400 text-xs">Universities</div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex min-h-screen lg:min-h-auto">
        {/* Left Side - Form */}
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

            {/* User Type Selector */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-300 mb-3">
                I am a:
              </label>
              <div className="grid grid-cols-3 bg-slate-800/50 backdrop-blur-sm rounded-lg p-1 gap-1">
                <button
                  onClick={() => setUserType('student')}
                  className={`py-2 px-3 rounded-md text-xs sm:text-sm font-medium transition-all duration-300 ${
                    userType === 'student'
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  🎓 Student
                </button>
                <button
                  onClick={() => setUserType('lecturer')}
                  className={`py-2 px-3 rounded-md text-xs sm:text-sm font-medium transition-all duration-300 ${
                    userType === 'lecturer'
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  👨‍🏫 Lecturer
                </button>
                <button
                  onClick={() => setUserType('admin')}
                  className={`py-2 px-3 rounded-md text-xs sm:text-sm font-medium transition-all duration-300 ${
                    userType === 'admin'
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  👨‍💼 Admin
                </button>
              </div>
            </div>

            {/* Tab Switcher */}
            <div className="flex bg-slate-800/50 backdrop-blur-sm rounded-lg p-1 mb-8">
              <button
                onClick={() => setActiveTab('signup')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-300 ${
                  activeTab === 'signup'
                    ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                Create Account
              </button>
              <button
                onClick={() => setActiveTab('signin')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-300 ${
                  activeTab === 'signin'
                    ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                Sign In
              </button>
            </div>

            {/* Form Content */}
            <div className="card-hover bg-slate-800/50 backdrop-blur-sm p-8 rounded-2xl border border-slate-700/50">
              {activeTab === 'signup' ? (
                <SignupForm userType={userType} router={router} />
              ) : (
                <SigninForm userType={userType} router={router} />
              )}
            </div>

            {/* Footer Links */}
            <div className="mt-8 text-center">
              <p className="text-slate-400 text-sm">
                By continuing, you agree to our{' '}
                <Link href="#" className="text-blue-400 hover:text-blue-300 transition-colors">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link href="#" className="text-blue-400 hover:text-blue-300 transition-colors">
                  Privacy Policy
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* Right Side - Info Panel (Desktop Only) */}
        <div className="hidden lg:flex flex-1 bg-gradient-to-br from-blue-900/20 to-purple-900/20 backdrop-blur-sm border-l border-slate-700/50">
          <div className="flex flex-col justify-center px-12 py-16">
            <div className="max-w-md">
              <h2 className="text-3xl font-bold text-white mb-6">
                Join the Digital Campus Revolution
              </h2>
              <p className="text-slate-300 text-lg mb-8">
                Experience the future of campus life with secure, convenient, and modern digital identity management.
              </p>
              
              {/* Features List */}
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="h-8 w-8 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center">
                    <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-slate-300">Instant campus access</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="h-8 w-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                    <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-slate-300">Contactless payments</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="h-8 w-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center">
                    <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-slate-300">Real-time notifications</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="h-8 w-8 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-full flex items-center justify-center">
                    <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-slate-300">Multi-device sync</span>
                </div>
              </div>

              {/* Stats */}
              <div className="mt-12 grid grid-cols-2 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">500K+</div>
                  <div className="text-slate-400 text-sm">Students</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">200+</div>
                  <div className="text-slate-400 text-sm">Universities</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SignupForm({ userType, router }: { userType: 'student' | 'admin' | 'lecturer', router: any }) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    id: '',
    institution: '',
    department: '',
    password: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate API call for account creation
    setTimeout(() => {
      // Navigate to OTP verification page
      router.push('/verify-otp');
      setIsLoading(false);
    }, 2000);
  };

  return (
    <div>
      <h3 className="text-2xl font-bold text-white mb-6">
        Create {userType === 'student' ? 'Student' : userType === 'lecturer' ? 'Lecturer' : 'Admin'} Account
      </h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              First Name
            </label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
              placeholder="John"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Last Name
            </label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
              placeholder="Doe"
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            {userType === 'student' ? 'Student Email' : userType === 'lecturer' ? 'Academic Email' : 'Work Email'}
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            required
            className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
            placeholder={userType === 'student' ? 'john.doe@university.edu' : userType === 'lecturer' ? 'prof.doe@university.edu' : 'john.doe@university.edu'}
          />
        </div>

        {userType === 'student' ? (
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Student ID
            </label>
            <input
              type="text"
              name="id"
              value={formData.id}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
              placeholder="STU123456789"
            />
          </div>
        ) : userType === 'lecturer' ? (
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Faculty ID
            </label>
            <input
              type="text"
              name="id"
              value={formData.id}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
              placeholder="FAC123456789"
            />
          </div>
        ) : (
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Employee ID
            </label>
            <input
              type="text"
              name="id"
              value={formData.id}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
              placeholder="EMP123456789"
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            {userType === 'student' ? 'University' : 'Institution'}
          </label>
          <select 
            name="institution"
            value={formData.institution}
            onChange={handleInputChange}
            required
            className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
          >
            <option value="">Select your {userType === 'student' ? 'university' : 'institution'}</option>
            <option value="harvard">Harvard University</option>
            <option value="mit">MIT</option>
            <option value="stanford">Stanford University</option>
            <option value="berkeley">UC Berkeley</option>
            <option value="other">Other</option>
          </select>
        </div>

        {(userType === 'admin' || userType === 'lecturer') && (
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              {userType === 'lecturer' ? 'Department' : 'Department'}
            </label>
            <select 
              name="department"
              value={formData.department}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
            >
              <option value="">Select your department</option>
              {userType === 'lecturer' ? (
                <>
                  <option value="computer-science">Computer Science</option>
                  <option value="mathematics">Mathematics</option>
                  <option value="physics">Physics</option>
                  <option value="chemistry">Chemistry</option>
                  <option value="biology">Biology</option>
                  <option value="engineering">Engineering</option>
                  <option value="business">Business Administration</option>
                  <option value="psychology">Psychology</option>
                  <option value="english">English Literature</option>
                  <option value="history">History</option>
                  <option value="other">Other</option>
                </>
              ) : (
                <>
                  <option value="it">IT Services</option>
                  <option value="student-affairs">Student Affairs</option>
                  <option value="security">Campus Security</option>
                  <option value="finance">Finance</option>
                  <option value="registrar">Registrar</option>
                  <option value="other">Other</option>
                </>
              )}
            </select>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Password
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
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="btn-primary w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-slate-600 disabled:to-slate-700 disabled:cursor-not-allowed text-white py-3 rounded-lg font-semibold mt-6 transition-all duration-300"
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Creating Account...
            </div>
          ) : (
            `Create ${userType === 'student' ? 'Student' : userType === 'lecturer' ? 'Lecturer' : 'Admin'} Account`
          )}
        </button>
      </form>
    </div>
  );
}

function SigninForm({ userType, router }: { userType: 'student' | 'admin' | 'lecturer', router: any }) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    emailOrId: '',
    password: '',
    rememberMe: false
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate API call for sign in
    setTimeout(() => {
      // Navigate to appropriate dashboard based on user type
      if (userType === 'lecturer') {
        router.push('/lecturer-dashboard');
      } else if (userType === 'admin') {
        router.push('/admin-dashboard');
      } else {
        router.push('/test-dashboard');
      }
      setIsLoading(false);
    }, 2000);
  };

  return (
    <div>
      <h3 className="text-2xl font-bold text-white mb-6">
        {userType === 'student' ? 'Student' : userType === 'lecturer' ? 'Lecturer' : 'Admin'} Sign In
      </h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            {userType === 'student' ? 'Email or Student ID' : userType === 'lecturer' ? 'Email or Faculty ID' : 'Email or Employee ID'}
          </label>
          <input
            type="text"
            name="emailOrId"
            value={formData.emailOrId}
            onChange={handleInputChange}
            required
            className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
            placeholder={userType === 'student' ? 'john.doe@university.edu or STU123456789' : userType === 'lecturer' ? 'prof.doe@university.edu or FAC123456789' : 'john.doe@university.edu or EMP123456789'}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Password
          </label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            required
            className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
            placeholder="Enter your password"
          />
        </div>

        <div className="flex items-center justify-between">
          <label className="flex items-center">
            <input 
              type="checkbox" 
              name="rememberMe"
              checked={formData.rememberMe}
              onChange={handleInputChange}
              className="rounded border-slate-600 text-blue-600 focus:ring-blue-500" 
            />
            <span className="ml-2 text-sm text-slate-300">Remember me</span>
          </label>
          <Link href="#" className="text-sm text-blue-400 hover:text-blue-300 transition-colors">
            Forgot password?
          </Link>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="btn-primary w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-slate-600 disabled:to-slate-700 disabled:cursor-not-allowed text-white py-3 rounded-lg font-semibold mt-6 transition-all duration-300"
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Signing In...
            </div>
          ) : (
            `Sign In as ${userType === 'student' ? 'Student' : userType === 'lecturer' ? 'Lecturer' : 'Admin'}`
          )}
        </button>
      </form>

      {/* Social Login - Only for Students */}
      {userType === 'student' && (
        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-600"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-slate-800 text-slate-400">Or continue with</span>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <button type="button" className="btn-secondary flex items-center justify-center px-4 py-2 border border-slate-600 rounded-lg text-slate-300 hover:bg-slate-700/50 transition-colors">
              <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Google
            </button>
            <button type="button" className="btn-secondary flex items-center justify-center px-4 py-2 border border-slate-600 rounded-lg text-slate-300 hover:bg-slate-700/50 transition-colors">
              <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              Facebook
            </button>
          </div>
        </div>
      )}
    </div>
  );
}