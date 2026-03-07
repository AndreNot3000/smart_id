"use client";

import { useState, useEffect, useRef } from 'react';
import { Html5Qrcode, Html5QrcodeScannerState } from 'html5-qrcode';
import { qrService } from '@/lib/qrService';

interface ScannedUser {
  userType: 'student' | 'lecturer';
  userInfo: {
    studentId?: string;
    lecturerId?: string;
    firstName: string;
    lastName: string;
    email: string;
    department: string;
    year?: string;
    role?: string;
    specialization?: string;
    avatar: string;
    institutionName: string;
    status: string;
    emailVerified: boolean;
  };
}

interface QRScannerProps {
  className?: string;
}

export default function QRScannerNew({ className = '' }: QRScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [scannedUser, setScannedUser] = useState<ScannedUser | null>(null);
  const [scannedQRData, setScannedQRData] = useState<string>('');
  const [purpose, setPurpose] = useState('');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [debugInfo, setDebugInfo] = useState('');
  
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const qrCodeRegionId = "qr-reader-new";
  const hasScanned = useRef(false);

  // Start scanner
  const startScanner = async () => {
    try {
      setError('');
      setDebugInfo('🔄 Initializing camera...');
      hasScanned.current = false;

      // Set scanning state first
      setIsScanning(true);
      await new Promise(resolve => setTimeout(resolve, 300));

      const html5QrCode = new Html5Qrcode(qrCodeRegionId);
      scannerRef.current = html5QrCode;

      setDebugInfo('📷 Starting camera...');

      await html5QrCode.start(
        { facingMode: "environment" },
        {
          fps: 30, // Increased from 10 to 30 for faster scanning
          qrbox: (viewfinderWidth, viewfinderHeight) => {
            const minDimension = Math.min(viewfinderWidth, viewfinderHeight);
            const qrboxSize = Math.floor(minDimension * 0.75);
            return { width: qrboxSize, height: qrboxSize };
          },
          aspectRatio: 1.0,
          disableFlip: false, // Allow flipping for better detection
        },
        (decodedText) => {
          // Only process once
          if (!hasScanned.current) {
            hasScanned.current = true;
            handleScan(decodedText);
          }
        },
        (errorMessage) => {
          // Ignore scanning errors (normal when no QR in view)
        }
      );

      setDebugInfo('✅ Camera ready! Point at QR code');

    } catch (err: any) {
      console.error('Scanner error:', err);
      setIsScanning(false);
      setError(`Failed to start camera: ${err.message || 'Unknown error'}`);
      setDebugInfo('');
    }
  };

  // Handle QR code scan
  const handleScan = async (decodedText: string) => {
    try {
      setDebugInfo(`✅ QR Detected! Data: ${decodedText.substring(0, 30)}...`);
      
      // Vibrate
      if (navigator.vibrate) {
        navigator.vibrate(200);
      }

      // Stop scanner
      if (scannerRef.current) {
        try {
          await scannerRef.current.stop();
          scannerRef.current.clear();
        } catch (e) {
          console.log('Stop error:', e);
        }
      }
      setIsScanning(false);

      setLoading(true);
      setDebugInfo('🔄 Verifying with backend...');

      // Store QR data
      setScannedQRData(decodedText);

      // Verify with backend
      const response = await qrService.verifyQRCode(decodedText, purpose, location, notes);

      setDebugInfo(`✅ Backend response: ${response.verified ? 'Success' : 'Failed'}`);

      if (response.verified) {
        setScannedUser({
          userType: response.userType,
          userInfo: response.userInfo
        });
        setSuccess(`${response.userType === 'student' ? 'Student' : 'Lecturer'} verified!`);
        setDebugInfo('');
        
        if (navigator.vibrate) {
          navigator.vibrate([200, 100, 200]);
        }
      } else {
        setError('QR code verification failed');
        setDebugInfo('❌ Verification failed');
      }

    } catch (err: any) {
      console.error('Verification error:', err);
      setError(err.message || 'Failed to verify QR code');
      setDebugInfo(`❌ Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Stop scanner
  const stopScanner = async () => {
    if (scannerRef.current) {
      try {
        const state = await scannerRef.current.getState();
        if (state === Html5QrcodeScannerState.SCANNING) {
          await scannerRef.current.stop();
        }
        scannerRef.current.clear();
      } catch (err) {
        console.log('Stop error:', err);
      }
    }
    setIsScanning(false);
    setDebugInfo('');
  };

  // Mark attendance
  const markAttendance = async () => {
    if (!scannedUser || !scannedQRData || scannedUser.userType !== 'student') return;

    try {
      setLoading(true);
      setError('');
      setSuccess('');

      const response = await qrService.scanAndMarkAttendance(
        scannedQRData,
        purpose || undefined,
        location || undefined
      );

      setSuccess(`Attendance marked for ${response.student.name}!`);
      
      if (navigator.vibrate) {
        navigator.vibrate([200, 100, 200]);
      }

      setTimeout(() => {
        setScannedUser(null);
        setScannedQRData('');
        setPurpose('');
        setLocation('');
        setNotes('');
        setSuccess('');
      }, 2000);

    } catch (err: any) {
      setError(err.message || 'Failed to mark attendance');
    } finally {
      setLoading(false);
    }
  };

  // Cleanup
  useEffect(() => {
    return () => {
      stopScanner();
    };
  }, []);

  return (
    <div className={`bg-slate-800/50 backdrop-blur-sm p-6 rounded-2xl border border-slate-700/50 ${className}`}>
      <div className="text-center">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white mb-2">QR Code Scanner</h2>
          <p className="text-slate-400">Scan student QR codes to verify identity</p>
        </div>

        {/* Debug Info */}
        {debugInfo && (
          <div className="mb-4 p-4 bg-yellow-900/30 border border-yellow-700/50 rounded-xl">
            <p className="text-yellow-300 text-sm font-mono break-all">{debugInfo}</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mb-4 p-4 bg-red-900/20 border border-red-700/50 rounded-lg">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {/* Success */}
        {success && !scannedUser && (
          <div className="mb-4 p-4 bg-green-900/20 border border-green-700/50 rounded-lg">
            <p className="text-green-400">{success}</p>
          </div>
        )}

        {/* Start Button */}
        {!isScanning && !scannedUser && (
          <div className="mb-6">
            <div className="relative bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm rounded-3xl p-12 mb-6 border-2 border-slate-700/50 shadow-2xl overflow-hidden">
              {/* Animated Background */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-pink-500/5 animate-pulse"></div>
              
              <div className="relative z-10">
                <div className="relative inline-block mb-6">
                  <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-2xl animate-pulse"></div>
                  <svg className="h-32 w-32 text-blue-400 mx-auto relative" fill="none" viewBox="0 0 24 24" strokeWidth="1" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">QR Scanner Ready</h3>
                <p className="text-slate-400 text-sm">Tap the button below to activate the scanner</p>
              </div>
            </div>
            
            <button
              onClick={startScanner}
              className="group relative bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white px-12 py-5 rounded-2xl hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 transition-all shadow-2xl hover:shadow-blue-500/50 flex items-center space-x-4 mx-auto font-bold text-lg transform hover:scale-105 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              <svg className="h-7 w-7 relative z-10 group-hover:rotate-12 transition-transform" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
              </svg>
              <span className="relative z-10">START SCANNER</span>
              <div className="relative z-10 flex space-x-1">
                <div className="w-1.5 h-1.5 bg-white rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-1.5 h-1.5 bg-white rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-1.5 h-1.5 bg-white rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </button>
          </div>
        )}

        {/* Scanner View */}
        <div className={isScanning ? "space-y-4 mb-6" : "hidden"}>
          <div className="relative">
            {/* Camera Container with Glow Effect */}
            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              <div 
                id={qrCodeRegionId} 
                className="w-full rounded-2xl overflow-hidden bg-slate-900" 
                style={{ maxHeight: '500px', display: 'block' }}
              ></div>
              
              {/* Animated Scanning Line */}
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute inset-0 border-4 border-blue-500/30 rounded-2xl"></div>
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-blue-400 to-transparent animate-scan-line"></div>
              </div>
              
              {/* Corner Brackets */}
              <div className="absolute top-4 left-4 w-12 h-12 border-t-4 border-l-4 border-green-400 rounded-tl-lg animate-pulse"></div>
              <div className="absolute top-4 right-4 w-12 h-12 border-t-4 border-r-4 border-green-400 rounded-tr-lg animate-pulse"></div>
              <div className="absolute bottom-4 left-4 w-12 h-12 border-b-4 border-l-4 border-green-400 rounded-bl-lg animate-pulse"></div>
              <div className="absolute bottom-4 right-4 w-12 h-12 border-b-4 border-r-4 border-green-400 rounded-br-lg animate-pulse"></div>
              
              {/* Scanning Status Badge */}
              <div className="absolute top-6 left-1/2 transform -translate-x-1/2 z-10">
                <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-3 rounded-full shadow-2xl flex items-center space-x-3 backdrop-blur-sm border-2 border-white/20">
                  <div className="relative">
                    <div className="w-3 h-3 bg-white rounded-full animate-ping absolute"></div>
                    <div className="w-3 h-3 bg-white rounded-full"></div>
                  </div>
                  <span className="font-bold text-sm tracking-wide">SCANNING ACTIVE</span>
                  <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </div>
              </div>
              
              {/* Target Crosshair */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="relative w-48 h-48">
                  <div className="absolute inset-0 border-2 border-blue-400/50 rounded-lg animate-pulse"></div>
                  <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-blue-400/50"></div>
                  <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-blue-400/50"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-col items-center space-y-4">
            <button
              onClick={stopScanner}
              className="group relative bg-gradient-to-r from-red-600 to-red-700 text-white px-10 py-4 rounded-2xl hover:from-red-700 hover:to-red-800 transition-all shadow-xl hover:shadow-2xl flex items-center space-x-3 font-bold text-lg transform hover:scale-105"
            >
              <svg className="h-6 w-6 group-hover:rotate-90 transition-transform" fill="none" viewBox="0 0 24 24" strokeWidth="3" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
              <span>STOP SCANNER</span>
            </button>

            <div className="p-5 bg-gradient-to-r from-blue-900/40 to-purple-900/40 border-2 border-blue-500/30 rounded-2xl max-w-md backdrop-blur-md shadow-xl">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
                    </svg>
                  </div>
                </div>
                <div className="text-left">
                  <p className="text-blue-300 font-semibold text-sm">Pro Tip</p>
                  <p className="text-blue-200 text-xs mt-1">Hold QR code steady in the center frame for instant detection</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="mb-6 bg-slate-800/50 p-8 rounded-2xl border border-slate-700/50">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500 mx-auto mb-4"></div>
            <p className="text-white font-semibold">Verifying QR Code...</p>
          </div>
        )}

        {/* Scanned User Info */}
        {scannedUser && (
          <div className="mb-6">
            <div className="bg-green-900/20 border border-green-700/50 rounded-lg p-6 mb-4">
              <div className="flex items-center justify-center mb-4">
                <div className="h-16 w-16 bg-green-500/20 rounded-full flex items-center justify-center">
                  <svg className="h-8 w-8 text-green-400" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              
              <h3 className="text-xl font-bold text-white mb-4">
                {scannedUser.userType === 'student' ? 'Student' : 'Lecturer'} Verified
              </h3>

              {/* Profile Photo */}
              <div className="flex justify-center mb-4">
                <div className="h-24 w-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center overflow-hidden border-4 border-green-500/30 shadow-xl">
                  {scannedUser.userInfo.avatar && scannedUser.userInfo.avatar.startsWith('data:image') ? (
                    <img 
                      src={scannedUser.userInfo.avatar} 
                      alt="Profile" 
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-white font-bold text-2xl">
                      {scannedUser.userInfo.firstName[0]}{scannedUser.userInfo.lastName[0]}
                    </span>
                  )}
                </div>
              </div>
              
              <div className="space-y-3 text-left">
                <div className="flex justify-between items-center p-3 bg-slate-700/30 rounded-lg">
                  <span className="text-slate-400">Name:</span>
                  <span className="text-white font-semibold">
                    {scannedUser.userInfo.firstName} {scannedUser.userInfo.lastName}
                  </span>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-slate-700/30 rounded-lg">
                  <span className="text-slate-400">
                    {scannedUser.userType === 'student' ? 'Student ID:' : 'Lecturer ID:'}
                  </span>
                  <span className="text-white font-mono">
                    {scannedUser.userType === 'student' 
                      ? scannedUser.userInfo.studentId 
                      : scannedUser.userInfo.lecturerId}
                  </span>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-slate-700/30 rounded-lg">
                  <span className="text-slate-400">Department:</span>
                  <span className="text-white">{scannedUser.userInfo.department}</span>
                </div>

                {scannedUser.userType === 'student' && scannedUser.userInfo.year && (
                  <div className="flex justify-between items-center p-3 bg-slate-700/30 rounded-lg">
                    <span className="text-slate-400">Year:</span>
                    <span className="text-white">{scannedUser.userInfo.year}</span>
                  </div>
                )}

                <div className="flex justify-between items-center p-3 bg-slate-700/30 rounded-lg">
                  <span className="text-slate-400">Email:</span>
                  <span className="text-white text-sm break-all">{scannedUser.userInfo.email}</span>
                </div>

                <div className="flex justify-between items-center p-3 bg-slate-700/30 rounded-lg">
                  <span className="text-slate-400">Status:</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    scannedUser.userInfo.status === 'active' 
                      ? 'bg-green-900/30 text-green-400' 
                      : 'bg-yellow-900/30 text-yellow-400'
                  }`}>
                    {scannedUser.userInfo.status}
                  </span>
                </div>
              </div>
            </div>

            {/* Mark Attendance Form */}
            {scannedUser.userType === 'student' && (
              <div className="bg-slate-700/30 rounded-lg p-6 mb-4">
                <h4 className="text-lg font-semibold text-white mb-4">Mark Attendance (Optional)</h4>
                
                <div className="space-y-4 text-left">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Purpose</label>
                    <input
                      type="text"
                      value={purpose}
                      onChange={(e) => setPurpose(e.target.value)}
                      placeholder="e.g., Lecture, Lab"
                      className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Location</label>
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="e.g., Room 301"
                      className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setScannedUser(null);
                  setScannedQRData('');
                  setPurpose('');
                  setLocation('');
                  setNotes('');
                  setError('');
                  setSuccess('');
                }}
                className="flex-1 bg-slate-700 text-white px-6 py-3 rounded-lg hover:bg-slate-600 transition-colors"
              >
                Scan Another
              </button>
              
              {scannedUser.userType === 'student' && (
                <button
                  onClick={markAttendance}
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-lg hover:from-green-700 hover:to-emerald-700 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Marking...' : 'Mark Attendance'}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
