"use client";

import { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
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

export default function QRScannerSimple({ className = '' }: QRScannerProps) {
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
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scanIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Start camera
  const startCamera = async () => {
    try {
      setCameraError('');
      setError('');
      setSuccess('');
      setScannedUser(null);

      // Check if mediaDevices is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setCameraError('Camera API is not supported in this browser.');
        return;
      }

      // Request camera access
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: "environment",
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });

      streamRef.current = stream;

      // Set video source
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      setIsScanning(true);

      // Start scanning for QR codes
      startQRScanning();

    } catch (err: any) {
      console.error('Camera error:', err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setCameraError('Camera permission denied. Please allow camera access.');
      } else if (err.name === 'NotFoundError') {
        setCameraError('No camera found on this device.');
      } else if (err.name === 'NotReadableError') {
        setCameraError('Camera is already in use.');
      } else {
        setCameraError(`Camera error: ${err.message}`);
      }
    }
  };

  // Stop camera
  const stopCamera = () => {
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setIsScanning(false);
  };

  // Scan for QR codes using html5-qrcode
  const startQRScanning = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const html5QrCode = new Html5Qrcode("reader-canvas");
    
    scanIntervalRef.current = setInterval(async () => {
      if (!videoRef.current || !canvasRef.current || !isScanning) return;

      const canvas = canvasRef.current;
      const video = videoRef.current;
      const context = canvas.getContext('2d');

      if (!context) return;

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      try {
        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        // Try to decode QR code from image data
        // This is a simplified version - you might need a proper QR decoder library
      } catch (err) {
        // Silently fail - no QR code found
      }
    }, 500);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  // Mark attendance
  const markAttendance = async () => {
    if (!scannedUser || !scannedQRData) return;

    if (scannedUser.userType !== 'student') {
      setError('Attendance can only be marked for students');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccess('');

      const response = await qrService.scanAndMarkAttendance(
        scannedQRData,
        purpose || undefined,
        location || undefined
      );

      setSuccess(`Attendance marked successfully for ${response.student.name}!`);
      
      if (typeof window !== 'undefined' && 'vibrate' in navigator) {
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
          <div className="mb-6 p-4 sm:p-6 bg-red-900/20 border border-red-700/50 rounded-lg">
            <div className="flex items-start space-x-3">
              <svg className="h-6 w-6 text-red-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
              <div className="text-left flex-1">
                <p className="text-red-400 font-semibold mb-2">Camera Access Required</p>
                <p className="text-red-300 text-sm mb-3">{cameraError}</p>
                
                <button
                  onClick={() => {
                    setCameraError('');
                    startCamera();
                  }}
                  className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors text-sm"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Start Button */}
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
              onClick={startCamera}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-colors flex items-center space-x-2 mx-auto"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
              </svg>
              <span>Start Scanner</span>
            </button>
          </div>
        )}

        {/* Camera View */}
        {isScanning && (
          <div className="mb-6">
            <div className="relative mx-auto mb-4 rounded-lg overflow-hidden bg-black" style={{ maxWidth: '500px' }}>
              <video
                ref={videoRef}
                className="w-full h-auto"
                playsInline
                muted
                style={{ display: 'block', minHeight: '300px' }}
              />
              <canvas ref={canvasRef} id="reader-canvas" style={{ display: 'none' }} />
              
              {/* QR Frame Overlay */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-64 h-64 border-4 border-blue-500 rounded-lg"></div>
              </div>
            </div>
            
            <button
              onClick={stopCamera}
              className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2 mx-auto"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
              <span>Stop Scanner</span>
            </button>

            <div className="mt-4 p-3 bg-blue-900/20 border border-blue-700/50 rounded-lg">
              <p className="text-blue-300 text-sm">
                <span className="font-semibold">📱 Tip:</span> Position the QR code within the blue frame
              </p>
            </div>
          </div>
        )}

        {/* Error/Success Messages */}
        {error && (
          <div className="mb-6 p-4 bg-red-900/20 border border-red-700/50 rounded-lg">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {success && !scannedUser && (
          <div className="mb-6 p-4 bg-green-900/20 border border-green-700/50 rounded-lg">
            <p className="text-green-400">{success}</p>
          </div>
        )}
      </div>
    </div>
  );
}
