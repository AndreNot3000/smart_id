"use client";

import { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { qrService } from '@/lib/qrService';

interface ScannedUser {
  userType: 'student' | 'lecturer';
  userInfo: {
    // Student fields
    studentId?: string;
    // Lecturer fields
    lecturerId?: string;
    // Common fields
    firstName: string;
    lastName: string;
    email: string;
    department: string;
    year?: string; // Only for students
    role?: string; // Only for lecturers
    specialization?: string; // Only for lecturers
    avatar: string;
    institutionName: string;
    status: string;
    emailVerified: boolean;
  };
}

interface QRScannerProps {
  className?: string;
}

export default function QRScanner({ className = '' }: QRScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [scannedUser, setScannedUser] = useState<ScannedUser | null>(null);
  const [scannedQRData, setScannedQRData] = useState<string>('');
  const [purpose, setPurpose] = useState('');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [cameraError, setCameraError] = useState('');
  
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const qrCodeRegionId = "qr-reader";

  // Initialize scanner
  const startScanner = async () => {
    try {
      setCameraError('');
      setError('');
      setSuccess('');
      setScannedUser(null);

      // Request camera permission
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.getTracks().forEach(track => track.stop()); // Stop the test stream

      // Initialize Html5Qrcode
      const html5QrCode = new Html5Qrcode(qrCodeRegionId);
      scannerRef.current = html5QrCode;

      const config = {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
      };

      await html5QrCode.start(
        { facingMode: "environment" }, // Use back camera on mobile
        config,
        onScanSuccess,
        onScanFailure
      );

      setIsScanning(true);

    } catch (err: any) {
      console.error('Scanner start error:', err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setCameraError('Camera permission denied. Please allow camera access to scan QR codes.');
      } else if (err.name === 'NotFoundError') {
        setCameraError('No camera found on this device.');
      } else {
        setCameraError('Failed to start camera. Please try again.');
      }
    }
  };

  // Stop scanner
  const stopScanner = async () => {
    if (scannerRef.current && isScanning) {
      try {
        await scannerRef.current.stop();
        scannerRef.current.clear();
        setIsScanning(false);
      } catch (err) {
        console.error('Scanner stop error:', err);
      }
    }
  };

  // Handle successful scan
  const onScanSuccess = async (decodedText: string) => {
    try {
      // Stop scanner immediately after successful scan
      await stopScanner();

      setLoading(true);
      setError('');
      setSuccess('');

      // Store the QR data for later use
      setScannedQRData(decodedText);

      // Verify QR code and get user information
      const response = await qrService.verifyQRCode(decodedText, purpose, location, notes);

      if (response.verified) {
        setScannedUser({
          userType: response.userType,
          userInfo: response.userInfo
        });
        setSuccess(`${response.userType === 'student' ? 'Student' : 'Lecturer'} verified successfully!`);
        
        // Play success sound (optional)
        if (typeof window !== 'undefined' && 'vibrate' in navigator) {
          navigator.vibrate(200);
        }
      }

    } catch (err: any) {
      setError(err.message || 'Failed to verify QR code');
      console.error('QR verification error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handle scan failure (called continuously while scanning)
  const onScanFailure = (errorMessage: string) => {
    // Don't show errors for normal scanning process
    // Only log critical errors
    if (errorMessage.includes('NotFoundException')) {
      // This is normal - no QR code in view
      return;
    }
    console.warn('Scan error:', errorMessage);
  };

  // Mark attendance
  const markAttendance = async () => {
    if (!scannedUser || !scannedQRData) return;

    // Only allow marking attendance for students
    if (scannedUser.userType !== 'student') {
      setError('Attendance can only be marked for students');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccess('');

      // Mark attendance using the stored QR data
      const response = await qrService.scanAndMarkAttendance(
        scannedQRData,
        purpose || undefined,
        location || undefined
      );

      setSuccess(`Attendance marked successfully for ${response.student.name}!`);
      
      // Play success sound/vibration
      if (typeof window !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate([200, 100, 200]);
      }

      // Reset form after 2 seconds
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
      console.error('Mark attendance error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Cleanup on unmount
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
          <p className="text-slate-400">Scan student QR codes to verify identity and mark attendance</p>
        </div>

        {/* Camera Error */}
        {cameraError && (
          <div className="mb-6 p-4 bg-red-900/20 border border-red-700/50 rounded-lg">
            <div className="flex items-start space-x-3">
              <svg className="h-6 w-6 text-red-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
              <div className="text-left">
                <p className="text-red-400 font-semibold mb-1">Camera Access Required</p>
                <p className="text-red-300 text-sm">{cameraError}</p>
                <p className="text-red-300 text-sm mt-2">
                  Please check your browser settings and allow camera access for this site.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Scanner Container */}
        {!isScanning && !scannedUser && !cameraError && (
          <div className="mb-6">
            <div className="bg-slate-700/30 rounded-lg p-12 mb-4">
              <svg className="h-24 w-24 text-slate-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
              </svg>
              <p className="text-slate-300 text-lg">Ready to scan</p>
              <p className="text-slate-400 text-sm mt-2">Click the button below to start scanning</p>
            </div>
            
            <button
              onClick={startScanner}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-colors flex items-center space-x-2 mx-auto"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
              </svg>
              <span>Start Scanner</span>
            </button>
          </div>
        )}

        {/* Scanner View */}
        {isScanning && (
          <div className="mb-6">
            <div id={qrCodeRegionId} className="mx-auto mb-4 rounded-lg overflow-hidden"></div>
            
            <button
              onClick={stopScanner}
              className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2 mx-auto"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
              <span>Stop Scanner</span>
            </button>

            <div className="mt-4 p-3 bg-blue-900/20 border border-blue-700/50 rounded-lg">
              <p className="text-blue-300 text-sm">
                <span className="font-semibold">📱 Tip:</span> Position the QR code within the frame for automatic scanning
              </p>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="mb-6">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-slate-300">Verifying QR code...</p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-900/20 border border-red-700/50 rounded-lg">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {/* Success Message */}
        {success && !scannedUser && (
          <div className="mb-6 p-4 bg-green-900/20 border border-green-700/50 rounded-lg">
            <p className="text-green-400">{success}</p>
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
              
              <h3 className="text-xl font-bold text-white mb-2">
                {scannedUser.userType === 'student' ? 'Student' : 'Lecturer'} Verified
              </h3>
              <p className="text-slate-400 text-sm mb-4">Identity confirmed successfully</p>
              
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
                  <span className="text-slate-400">Email:</span>
                  <span className="text-white text-sm">{scannedUser.userInfo.email}</span>
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
                
                {scannedUser.userType === 'lecturer' && scannedUser.userInfo.role && (
                  <div className="flex justify-between items-center p-3 bg-slate-700/30 rounded-lg">
                    <span className="text-slate-400">Role:</span>
                    <span className="text-white">{scannedUser.userInfo.role}</span>
                  </div>
                )}
                
                {scannedUser.userType === 'lecturer' && scannedUser.userInfo.specialization && (
                  <div className="flex justify-between items-center p-3 bg-slate-700/30 rounded-lg">
                    <span className="text-slate-400">Specialization:</span>
                    <span className="text-white">{scannedUser.userInfo.specialization}</span>
                  </div>
                )}
                
                <div className="flex justify-between items-center p-3 bg-slate-700/30 rounded-lg">
                  <span className="text-slate-400">Institution:</span>
                  <span className="text-white">{scannedUser.userInfo.institutionName}</span>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-slate-700/30 rounded-lg">
                  <span className="text-slate-400">Status:</span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    scannedUser.userInfo.status === 'active' 
                      ? 'bg-green-900/30 text-green-400' 
                      : 'bg-yellow-900/30 text-yellow-400'
                  }`}>
                    {scannedUser.userInfo.status}
                  </span>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-slate-700/30 rounded-lg">
                  <span className="text-slate-400">Email Verified:</span>
                  <span className={scannedUser.userInfo.emailVerified ? 'text-green-400' : 'text-red-400'}>
                    {scannedUser.userInfo.emailVerified ? 'Yes' : 'No'}
                  </span>
                </div>
              </div>
            </div>

            {/* Mark Attendance Form - Only for Students */}
            {scannedUser.userType === 'student' && (
              <div className="bg-slate-700/30 rounded-lg p-6 mb-4">
                <h4 className="text-lg font-semibold text-white mb-4">Mark Attendance (Optional)</h4>
                
                <div className="space-y-4 text-left">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Purpose (Optional)
                    </label>
                    <input
                      type="text"
                      value={purpose}
                      onChange={(e) => setPurpose(e.target.value)}
                      placeholder="e.g., Lecture, Lab Session, Event"
                      className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Location (Optional)
                    </label>
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="e.g., Room 301, Main Hall"
                      className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Notes (Optional)
                    </label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Additional notes..."
                      rows={3}
                      className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
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
                  className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-lg hover:from-green-700 hover:to-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
