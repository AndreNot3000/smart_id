"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

// First Login Password Change Modal Component
function FirstLoginModal({ isOpen, onClose, onPasswordChange, loading, fieldErrors, setFieldErrors }: {
  isOpen: boolean;
  onClose: () => void;
  onPasswordChange: (currentPassword: string, newPassword: string) => void;
  loading: boolean;
  fieldErrors: { currentPassword: string; newPassword: string; confirmPassword: string };
  setFieldErrors: React.Dispatch<React.SetStateAction<{ currentPassword: string; newPassword: string; confirmPassword: string }>>;
}) {
  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [error, setError] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setFieldErrors({
      currentPassword: "",
      newPassword: "",
      confirmPassword: ""
    });

    if (passwords.newPassword !== passwords.confirmPassword) {
      setFieldErrors(prev => ({
        ...prev,
        confirmPassword: "New passwords don't match"
      }));
      return;
    }

    if (passwords.newPassword.length < 8) {
      setFieldErrors(prev => ({
        ...prev,
        newPassword: "Password must be at least 8 characters long"
      }));
      return;
    }

    onPasswordChange(passwords.currentPassword, passwords.newPassword);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-slate-800 rounded-2xl p-8 max-w-md w-full border border-slate-700">
        <div className="text-center mb-6">
          <h3 className="text-xl font-bold text-white mb-2">Change Your Password</h3>
          <p className="text-slate-300 text-sm">
            For security reasons, you must change your default password before continuing.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Current Password
            </label>
            <div className="relative">
              <input
                type={showCurrentPassword ? "text" : "password"}
                required
                value={passwords.currentPassword}
                onChange={(e) => {
                  setPasswords({ ...passwords, currentPassword: e.target.value });
                  setFieldErrors(prev => ({ ...prev, currentPassword: "" }));
                }}
                className={`w-full px-4 py-3 pr-12 bg-slate-700/50 border rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  fieldErrors.currentPassword ? 'border-red-500' : 'border-slate-600'
                }`}
                placeholder="Enter your current password"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
              >
                {showCurrentPassword ? (
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 11-4.243-4.243m4.242 4.242L9.88 9.88" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                )}
              </button>
            </div>
            {fieldErrors.currentPassword && (
              <p className="mt-1 text-sm text-red-400">{fieldErrors.currentPassword}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              New Password
            </label>
            <div className="relative">
              <input
                type={showNewPassword ? "text" : "password"}
                required
                value={passwords.newPassword}
                onChange={(e) => {
                  setPasswords({ ...passwords, newPassword: e.target.value });
                  setFieldErrors(prev => ({ ...prev, newPassword: "" }));
                }}
                className={`w-full px-4 py-3 pr-12 bg-slate-700/50 border rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  fieldErrors.newPassword ? 'border-red-500' : 'border-slate-600'
                }`}
                placeholder="Enter new password"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
              >
                {showNewPassword ? (
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 11-4.243-4.243m4.242 4.242L9.88 9.88" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                )}
              </button>
            </div>
            {fieldErrors.newPassword && (
              <p className="mt-1 text-sm text-red-400">{fieldErrors.newPassword}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Confirm New Password
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                required
                value={passwords.confirmPassword}
                onChange={(e) => {
                  setPasswords({ ...passwords, confirmPassword: e.target.value });
                  setFieldErrors(prev => ({ ...prev, confirmPassword: "" }));
                }}
                className={`w-full px-4 py-3 pr-12 bg-slate-700/50 border rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  fieldErrors.confirmPassword ? 'border-red-500' : 'border-slate-600'
                }`}
                placeholder="Confirm new password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
              >
                {showConfirmPassword ? (
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 11-4.243-4.243m4.242 4.242L9.88 9.88" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                )}
              </button>
            </div>
            {fieldErrors.confirmPassword && (
              <p className="mt-1 text-sm text-red-400">{fieldErrors.confirmPassword}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-3 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Changing Password..." : "Change Password"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    emailOrId: "",
    password: "",
    userType: "student"
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showFirstLoginModal, setShowFirstLoginModal] = useState(false);
  const [firstLoginData, setFirstLoginData] = useState<any>(null);
  const [fieldErrors, setFieldErrors] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("http://localhost:8000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.emailOrId,
          password: formData.password,
          userType: formData.userType
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      // Clear any existing localStorage data to prevent conflicts
      localStorage.clear();

      // Store tokens and user data in sessionStorage (tab-specific)
      sessionStorage.setItem("accessToken", data.accessToken);
      sessionStorage.setItem("refreshToken", data.refreshToken);
      sessionStorage.setItem("user", JSON.stringify(data.user));

      // Check if this is first login
      if (data.user.isFirstLogin) {
        setFirstLoginData(data);
        setShowFirstLoginModal(true);
        setLoading(false);
        return;
      }

      // Redirect based on user type
      redirectToDashboard(data.user.userType);
    } catch (err: any) {
      setError(err.message || "An error occurred during login");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (currentPassword: string, newPassword: string) => {
    setError("");
    setLoading(true);

    try {
      const response = await fetch("http://localhost:8000/api/users/change-password", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${firstLoginData.accessToken}`
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
          confirmPassword: newPassword
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle specific field errors from API
        if (data.field) {
          setFieldErrors(prev => ({
            ...prev,
            [data.field]: data.error
          }));
        } else {
          setError(data.error || data.message || "Password change failed");
        }
        setLoading(false);
        return;
      }

      // Update user data to clear isFirstLogin flag
      const updatedUser = { ...firstLoginData.user, isFirstLogin: false };
      sessionStorage.setItem("user", JSON.stringify(updatedUser));

      // Close modal and redirect
      setShowFirstLoginModal(false);
      redirectToDashboard(updatedUser.userType);
    } catch (err: any) {
      setError(err.message || "An error occurred while changing password");
      setLoading(false);
    }
  };

  const redirectToDashboard = (userType: string) => {
    if (userType === "admin") {
      router.push("/admin-dashboard");
    } else if (userType === "lecturer") {
      router.push("/lecturer-dashboard");
    } else {
      router.push("/test-dashboard");
    }
  };

  return (
    <>
      <FirstLoginModal
        isOpen={showFirstLoginModal}
        onClose={() => setShowFirstLoginModal(false)}
        onPasswordChange={handlePasswordChange}
        loading={loading}
        fieldErrors={fieldErrors}
        setFieldErrors={setFieldErrors}
      />

      <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <div className="inline-flex items-center space-x-2 mb-4">
              <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <span className="text-white font-bold text-xl">ID</span>
              </div>
              <span className="text-2xl font-bold text-white">Campus ID</span>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
            <p className="text-slate-400">Sign in to access your dashboard</p>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm p-8 rounded-2xl border border-slate-700/50">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  User Type
                </label>
                <select
                  value={formData.userType}
                  onChange={(e) => setFormData({ ...formData, userType: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="student">Student</option>
                  <option value="lecturer">Lecturer</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  {formData.userType === 'student' ? 'Email or Student ID' : 
                   formData.userType === 'lecturer' ? 'Email or Faculty ID' : 
                   'Email or Employee ID'}
                </label>
                <input
                  type="text"
                  required
                  value={formData.emailOrId}
                  onChange={(e) => setFormData({ ...formData, emailOrId: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={
                    formData.userType === 'student' ? 'you@university.edu or UNIV-123456789' :
                    formData.userType === 'lecturer' ? 'prof@university.edu or FAC-123456789' :
                    'admin@university.edu or EMP-123456789'
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-4 py-3 pr-12 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                  >
                    {showPassword ? (
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 11-4.243-4.243m4.242 4.242L9.88 9.88" />
                      </svg>
                    ) : (
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center text-slate-300">
                  <input type="checkbox" className="mr-2 rounded" />
                  Remember me
                </label>
                <Link href="/forgot-password" className="text-blue-400 hover:text-blue-300">
                  Forgot password?
                </Link>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Signing in..." : "Sign In"}
              </button>
            </form>

            <div className="mt-6 text-center text-sm text-slate-400">
              Need help accessing your account?{" "}
              <Link href="/forgot-password" className="text-blue-400 hover:text-blue-300 font-medium">
                Contact Support
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
