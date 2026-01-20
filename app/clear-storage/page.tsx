"use client";

import { useRouter } from "next/navigation";

export default function ClearStoragePage() {
  const router = useRouter();

  const clearAllStorage = () => {
    // Clear localStorage
    localStorage.clear();
    
    // Clear sessionStorage
    sessionStorage.clear();
    
    // Clear cookies (if any)
    document.cookie.split(";").forEach((c) => {
      document.cookie = c
        .replace(/^ +/, "")
        .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });
    
    alert("All storage cleared! You can now test fresh logins.");
    router.push('/login');
  };

  const showStorageInfo = () => {
    const localStorageData = { ...localStorage };
    const sessionStorageData = { ...sessionStorage };
    
    console.log("=== STORAGE DEBUG INFO ===");
    console.log("localStorage:", localStorageData);
    console.log("sessionStorage:", sessionStorageData);
    
    alert("Check browser console for storage information");
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Storage Debug</h1>
          <p className="text-slate-400">Clear storage and debug authentication issues</p>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-sm p-8 rounded-2xl border border-slate-700/50 space-y-4">
          <button
            onClick={clearAllStorage}
            className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold py-3 rounded-lg transition-all duration-300"
          >
            Clear All Storage & Redirect to Login
          </button>
          
          <button
            onClick={showStorageInfo}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 rounded-lg transition-all duration-300"
          >
            Show Storage Info (Check Console)
          </button>
          
          <button
            onClick={() => router.push('/login')}
            className="w-full border border-slate-600 text-slate-300 py-3 rounded-lg hover:bg-slate-700/50 transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    </div>
  );
}