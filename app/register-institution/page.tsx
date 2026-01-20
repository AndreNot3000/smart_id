"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

const API_BASE_URL = 'http://localhost:8000/api';

export default function RegisterInstitutionPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({});
  const [formData, setFormData] = useState({
    institutionCode: '',
    adminFirstName: '',
    adminLastName: '',
    adminEmail: '',
    password: '',
    confirmPassword: ''
  });

  const router = useRouter();

  // Calculate password strength
  const calculatePasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (password.length >= 12) strength += 25;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength += 25;
    if (/\d/.test(password)) strength += 15;
    if (/[^a-zA-Z0-9]/.test(password)) strength += 10;
    return Math.min(strength, 100);
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength < 40) return 'bg-red-500';
    if (passwordStrength < 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength < 40) return 'Weak';
    if (passwordStrength < 70) return 'Medium';
    return 'Strong';
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    setError('');
    
    // Clear validation error for this field
    if (validationErrors[name]) {
      setValidationErrors({
        ...validationErrors,
        [name]: ''
      });
    }

    // Update password strength
    if (name === 'password') {
      setPasswordStrength(calculatePasswordStrength(value));
    }

    // Real-time validation
    validateField(name, value);
  };

  const validateField = (name: string, value: string) => {
    const errors: {[key: string]: string} = {};

    switch (name) {
      case 'institutionCode':
        if (value && value.length < 3) {
          errors[name] = 'Institution code must be at least 3 characters';
        }
        break;
      case 'adminFirstName':
      case 'adminLastName':
        if (value && value.length < 2) {
          errors[name] = 'Name must be at least 2 characters';
        }
        break;
      case 'adminEmail':
        if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          errors[name] = 'Please enter a valid email address';
        }
        break;
      case 'password':
        if (value && value.length < 8) {
          errors[name] = 'Password must be at least 8 characters';
        }
        break;
      case 'confirmPassword':
        if (value && value !== formData.password) {
          errors[name] = 'Passwords do not match';
        }
        break;
    }

    setValidationErrors(prev => ({
      ...prev,
      ...errors
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate all fields
    const errors: {[key: string]: string} = {};
    
    if (!formData.institutionCode) errors.institutionCode = 'Institution code is required';
    if (!formData.adminFirstName) errors.adminFirstName = 'First name is required';
    if (!formData.adminLastName) errors.adminLastName = 'Last name is required';
    if (!formData.adminEmail) errors.adminEmail = 'Email is required';
    if (!formData.password) errors.password = 'Password is required';
    if (!formData.confirmPassword) errors.confirmPassword = 'Please confirm your password';

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    // Validate password strength
    if (formData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters long';
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    setIsLoading(true);

    try {
      console.log('Sending registration request to:', `${API_BASE_URL}/auth/admin/register`);
      console.log('Request body:', {
        institutionCode: formData.institutionCode,
        adminFirstName: formData.adminFirstName,
        adminLastName: formData.adminLastName,
        adminEmail: formData.adminEmail,
        password: '***',
        confirmPassword: '***'
      });

      const response = await fetch(`${API_BASE_URL}/auth/admin/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          institutionCode: formData.institutionCode,
          adminFirstName: formData.adminFirstName,
          adminLastName: formData.adminLastName,
          adminEmail: formData.adminEmail,
          password: formData.password,
          confirmPassword: formData.confirmPassword
        })
      });

      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Response data:', data);

      if (!response.ok) {
        throw new Error(data.message || data.error || 'Registration failed');
      }

      // Store email and institution info for OTP verification
      sessionStorage.setItem('verificationEmail', formData.adminEmail);
      sessionStorage.setItem('institutionName', data.institutionName || '');
      sessionStorage.setItem('institutionCode', data.institutionCode || '');
      sessionStorage.setItem('adminId', data.adminId || '');

      console.log('Registration successful, navigating to OTP page');
      // Navigate to OTP verification page
      router.push('/verify-otp');
    } catch (err: any) {
      console.error('Registration error:', err);
      
      // Check if it's a network error
      if (err.message === 'Failed to fetch') {
        setError('Cannot connect to server. Please make sure the backend is running on http://localhost:8000');
      } else {
        setError(err.message || 'Registration failed. Please check your connection and try again.');
      }
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800">
      <div className="flex min-h-screen">
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

            {/* Form Card */}
            <div className="card-hover bg-slate-800/50 backdrop-blur-sm p-8 rounded-2xl border border-slate-700/50">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-white mb-2">Register Your Institution</h2>
                <p className="text-slate-300 text-sm">
                  Start managing your campus with digital identity
                </p>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-900/30 border border-red-700 rounded-lg">
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Institution Code */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Institution Code <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    name="institutionCode"
                    value={formData.institutionCode}
                    onChange={handleInputChange}
                    required
                    className={`w-full px-4 py-3 bg-slate-700/50 border ${
                      validationErrors.institutionCode ? 'border-red-500' : 'border-slate-600'
                    } rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300`}
                    placeholder="e.g., UNIBADAN"
                  />
                  {validationErrors.institutionCode && (
                    <p className="text-red-400 text-xs mt-1">{validationErrors.institutionCode}</p>
                  )}
                  {!validationErrors.institutionCode && (
                    <p className="text-slate-400 text-xs mt-1">
                      Enter your institution's unique code (e.g., UNIBADAN for University of Ibadan)
                    </p>
                  )}
                </div>

                {/* Admin Name */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Admin First Name <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      name="adminFirstName"
                      value={formData.adminFirstName}
                      onChange={handleInputChange}
                      required
                      className={`w-full px-4 py-3 bg-slate-700/50 border ${
                        validationErrors.adminFirstName ? 'border-red-500' : 'border-slate-600'
                      } rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300`}
                      placeholder="John"
                    />
                    {validationErrors.adminFirstName && (
                      <p className="text-red-400 text-xs mt-1">{validationErrors.adminFirstName}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Admin Last Name <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      name="adminLastName"
                      value={formData.adminLastName}
                      onChange={handleInputChange}
                      required
                      className={`w-full px-4 py-3 bg-slate-700/50 border ${
                        validationErrors.adminLastName ? 'border-red-500' : 'border-slate-600'
                      } rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300`}
                      placeholder="Doe"
                    />
                    {validationErrors.adminLastName && (
                      <p className="text-red-400 text-xs mt-1">{validationErrors.adminLastName}</p>
                    )}
                  </div>
                </div>

                {/* Admin Email */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Admin Email <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="email"
                    name="adminEmail"
                    value={formData.adminEmail}
                    onChange={handleInputChange}
                    required
                    className={`w-full px-4 py-3 bg-slate-700/50 border ${
                      validationErrors.adminEmail ? 'border-red-500' : 'border-slate-600'
                    } rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300`}
                    placeholder="admin@university.edu"
                  />
                  {validationErrors.adminEmail && (
                    <p className="text-red-400 text-xs mt-1">{validationErrors.adminEmail}</p>
                  )}
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Password <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      required
                      minLength={8}
                      className={`w-full px-4 py-3 pr-12 bg-slate-700/50 border ${
                        validationErrors.password ? 'border-red-500' : 'border-slate-600'
                      } rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300`}
                      placeholder="Create a strong password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                    >
                      {showPassword ? (
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                        </svg>
                      ) : (
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      )}
                    </button>
                  </div>
                  {validationErrors.password && (
                    <p className="text-red-400 text-xs mt-1">{validationErrors.password}</p>
                  )}
                  
                  {/* Password Strength Indicator */}
                  {formData.password && (
                    <div className="mt-2">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-slate-400">Password strength:</span>
                        <span className={`text-xs font-medium ${
                          passwordStrength < 40 ? 'text-red-400' : 
                          passwordStrength < 70 ? 'text-yellow-400' : 
                          'text-green-400'
                        }`}>
                          {getPasswordStrengthText()}
                        </span>
                      </div>
                      <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${getPasswordStrengthColor()} transition-all duration-300`}
                          style={{ width: `${passwordStrength}%` }}
                        />
                      </div>
                      <div className="mt-2 space-y-1">
                        <p className={`text-xs ${formData.password.length >= 8 ? 'text-green-400' : 'text-slate-400'}`}>
                          ✓ At least 8 characters
                        </p>
                        <p className={`text-xs ${/[A-Z]/.test(formData.password) && /[a-z]/.test(formData.password) ? 'text-green-400' : 'text-slate-400'}`}>
                          ✓ Upper and lowercase letters
                        </p>
                        <p className={`text-xs ${/\d/.test(formData.password) ? 'text-green-400' : 'text-slate-400'}`}>
                          ✓ At least one number
                        </p>
                        <p className={`text-xs ${/[^a-zA-Z0-9]/.test(formData.password) ? 'text-green-400' : 'text-slate-400'}`}>
                          ✓ Special character (!@#$%^&*)
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Confirm Password <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      required
                      minLength={8}
                      className={`w-full px-4 py-3 pr-12 bg-slate-700/50 border ${
                        validationErrors.confirmPassword ? 'border-red-500' : 
                        formData.confirmPassword && formData.password === formData.confirmPassword ? 'border-green-500' :
                        'border-slate-600'
                      } rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300`}
                      placeholder="Confirm your password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                    >
                      {showConfirmPassword ? (
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                        </svg>
                      ) : (
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      )}
                    </button>
                  </div>
                  {validationErrors.confirmPassword && (
                    <p className="text-red-400 text-xs mt-1">{validationErrors.confirmPassword}</p>
                  )}
                  {formData.confirmPassword && formData.password === formData.confirmPassword && (
                    <p className="text-green-400 text-xs mt-1 flex items-center">
                      <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      Passwords match
                    </p>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn-primary w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-slate-600 disabled:to-slate-700 disabled:cursor-not-allowed text-white py-3 rounded-lg font-semibold mt-6 transition-all duration-300"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Registering Institution...
                    </div>
                  ) : (
                    'Register Institution'
                  )}
                </button>
              </form>

              {/* Footer */}
              <div className="mt-6 text-center">
                <p className="text-slate-400 text-sm">
                  Already have an account?{' '}
                  <Link href="/signup" className="text-blue-400 hover:text-blue-300 transition-colors">
                    Sign In
                  </Link>
                </p>
              </div>
            </div>

            {/* Terms */}
            <div className="mt-6 text-center">
              <p className="text-slate-400 text-sm">
                By registering, you agree to our{' '}
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
                Why Choose Campus ID?
              </h2>
              <p className="text-slate-300 text-lg mb-8">
                Join hundreds of institutions modernizing their campus identity management.
              </p>
              
              {/* Features List */}
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="h-8 w-8 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center">
                    <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-slate-300">Complete student & lecturer management</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="h-8 w-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                    <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-slate-300">QR code-based attendance tracking</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="h-8 w-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center">
                    <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-slate-300">Secure digital identity cards</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="h-8 w-8 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-full flex items-center justify-center">
                    <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-slate-300">Real-time analytics & reporting</span>
                </div>
              </div>

              {/* Stats */}
              <div className="mt-12 grid grid-cols-2 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">500K+</div>
                  <div className="text-slate-400 text-sm">Active Users</div>
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
