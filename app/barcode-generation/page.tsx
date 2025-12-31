"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function BarcodeGenerationPage() {
  const [isGenerating, setIsGenerating] = useState(true);
  const [studentData, setStudentData] = useState({
    id: '',
    barcode: '',
    uniqueNumber: '',
    name: 'John Doe',
    email: 'john.doe@university.edu',
    university: 'Harvard University'
  });
  const router = useRouter();

  useEffect(() => {
    // Simulate barcode generation
    setTimeout(() => {
      const uniqueId = `STU${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
      const uniqueNumber = Math.random().toString().substr(2, 8);
      
      setStudentData(prev => ({
        ...prev,
        id: uniqueId,
        barcode: `data:image/svg+xml;base64,${btoa(generateBarcodeSVG(uniqueId))}`,
        uniqueNumber: uniqueNumber
      }));
      setIsGenerating(false);
    }, 3000);
  }, []);

  const generateBarcodeSVG = (text: string) => {
    // Simple barcode-like SVG generation
    const bars = text.split('').map((char, index) => {
      const width = (char.charCodeAt(0) % 3) + 2;
      const x = index * 8;
      return `<rect x="${x}" y="0" width="${width}" height="60" fill="black"/>`;
    }).join('');

    return `
      <svg width="200" height="80" xmlns="http://www.w3.org/2000/svg">
        <rect width="200" height="80" fill="white"/>
        ${bars}
        <text x="100" y="75" text-anchor="middle" font-family="monospace" font-size="8" fill="black">${text}</text>
      </svg>
    `;
  };

  const handleContinue = () => {
    router.push('/dashboard');
  };

  const handleDownload = () => {
    // Create download link for barcode
    const link = document.createElement('a');
    link.href = studentData.barcode;
    link.download = `campus-id-${studentData.id}.svg`;
    link.click();
  };

  if (isGenerating) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="text-center">
          <div className="h-20 w-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
            <svg className="h-10 w-10 text-white animate-spin" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Generating Your Digital ID</h2>
          <p className="text-slate-300 mb-4">Please wait while we create your unique campus identity...</p>
          <div className="flex justify-center space-x-1">
            <div className="h-2 w-2 bg-blue-500 rounded-full animate-bounce"></div>
            <div className="h-2 w-2 bg-purple-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
            <div className="h-2 w-2 bg-cyan-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="flex items-center justify-center mb-8">
          <Link href="/" className="flex items-center space-x-2">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center icon-hover">
              <span className="text-white font-bold">ID</span>
            </div>
            <span className="text-2xl font-bold text-white">Campus ID</span>
          </Link>
        </div>

        {/* Success Message */}
        <div className="text-center mb-8">
          <div className="h-16 w-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Account Created Successfully!</h2>
          <p className="text-slate-300">Your digital campus ID has been generated</p>
        </div>

        {/* ID Card */}
        <div className="card-hover bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm p-8 rounded-2xl border border-slate-700/50 mb-6">
          {/* Student Info */}
          <div className="text-center mb-6">
            <div className="h-20 w-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-white text-2xl font-bold">
                {studentData.name.split(' ').map(n => n[0]).join('')}
              </span>
            </div>
            <h3 className="text-xl font-bold text-white mb-1">{studentData.name}</h3>
            <p className="text-slate-300 text-sm mb-1">{studentData.email}</p>
            <p className="text-slate-400 text-sm">{studentData.university}</p>
          </div>

          {/* Barcode */}
          <div className="bg-white rounded-lg p-4 mb-6">
            <img 
              src={studentData.barcode} 
              alt="Student Barcode" 
              className="w-full h-auto"
            />
          </div>

          {/* Credentials */}
          <div className="space-y-4">
            <div className="bg-slate-700/50 rounded-lg p-4">
              <label className="block text-sm font-medium text-slate-300 mb-1">Student ID</label>
              <div className="flex items-center justify-between">
                <span className="text-white font-mono text-lg">{studentData.id}</span>
                <button 
                  onClick={() => navigator.clipboard.writeText(studentData.id)}
                  className="text-blue-400 hover:text-blue-300 transition-colors"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.375A2.25 2.25 0 014.125 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="bg-slate-700/50 rounded-lg p-4">
              <label className="block text-sm font-medium text-slate-300 mb-1">Login Number</label>
              <div className="flex items-center justify-between">
                <span className="text-white font-mono text-lg">{studentData.uniqueNumber}</span>
                <button 
                  onClick={() => navigator.clipboard.writeText(studentData.uniqueNumber)}
                  className="text-blue-400 hover:text-blue-300 transition-colors"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.375A2.25 2.25 0 014.125 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Important Note */}
          <div className="mt-6 p-4 bg-amber-900/20 border border-amber-700/50 rounded-lg">
            <div className="flex items-start space-x-3">
              <svg className="h-5 w-5 text-amber-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
              <div>
                <p className="text-amber-300 text-sm font-medium mb-1">Important</p>
                <p className="text-amber-200 text-sm">
                  Save these credentials safely. You'll use your Student ID or Login Number along with your password to sign in.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={handleDownload}
            className="btn-secondary w-full flex items-center justify-center px-6 py-3 border border-slate-600 rounded-lg text-slate-300 hover:bg-slate-700/50 transition-colors"
          >
            <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            Download Barcode
          </button>
          
          <Link href="/test-dashboard" className="block w-full">
            <button className="btn-primary w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-3 rounded-lg font-semibold">
              Continue to Dashboard
            </button>
          </Link>
        </div>

        {/* Help Text */}
        <div className="mt-6 text-center">
          <p className="text-slate-400 text-sm">
            Need help? Visit our{' '}
            <Link href="#" className="text-blue-400 hover:text-blue-300 transition-colors">
              support center
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}