"use client";

import { useState, useEffect, useCallback } from 'react';
import QRCodeSVG from 'react-qr-code';
import { qrService } from '@/lib/qrService';

interface StudentQRDisplayProps {
  className?: string;
}

export default function StudentQRDisplay({ className = '' }: StudentQRDisplayProps) {
  const [qrData, setQrData] = useState<string>('');
  const [userInfo, setUserInfo] = useState<{
    name: string;
    userType: string;
    id: string;
    avatar?: string;
  } | null>(null);
  const [expiresAt, setExpiresAt] = useState<Date | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [refreshing, setRefreshing] = useState<boolean>(false);

  // Generate QR code
  const generateQR = useCallback(async () => {
    try {
      setRefreshing(true);
      setError('');
      
      const response = await qrService.generateQRCode();
      
      setQrData(response.qrData);
      setUserInfo(response.userInfo);
      
      // Calculate expiration time (24 hours from now)
      const expirationDate = new Date();
      expirationDate.setHours(expirationDate.getHours() + 24);
      setExpiresAt(expirationDate);
      
      // Calculate time left in seconds
      const timeLeftSeconds = Math.floor((expirationDate.getTime() - Date.now()) / 1000);
      setTimeLeft(timeLeftSeconds);
      
    } catch (err: any) {
      setError(err.message || 'Failed to generate QR code');
      console.error('QR generation error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Initial QR generation (only once on mount)
  useEffect(() => {
    generateQR();
  }, [generateQR]);

  // Countdown timer (updates every minute for 24-hour countdown)
  useEffect(() => {
    if (timeLeft <= 0 || !expiresAt) return;

    const timer = setInterval(() => {
      const newTimeLeft = Math.floor((expiresAt.getTime() - Date.now()) / 1000);
      if (newTimeLeft <= 0) {
        setTimeLeft(0);
        clearInterval(timer);
      } else {
        setTimeLeft(newTimeLeft);
      }
    }, 60000); // Update every minute instead of every second

    return () => clearInterval(timer);
  }, [expiresAt, timeLeft]);

  // Format time left for 24-hour display
  const formatTimeLeft = (seconds: number): string => {
    if (seconds <= 0) return 'Expired';
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  // Get color based on time left
  const getTimerColor = (): string => {
    const hoursLeft = timeLeft / 3600;
    if (hoursLeft > 12) return 'text-green-400'; // > 12 hours
    if (hoursLeft > 6) return 'text-yellow-400'; // > 6 hours
    if (hoursLeft > 1) return 'text-orange-400'; // > 1 hour
    return 'text-red-400'; // < 1 hour
  };

  // Format expiration date
  const formatExpirationDate = (): string => {
    if (!expiresAt) return '';
    return expiresAt.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className={`bg-slate-800/50 backdrop-blur-sm p-8 rounded-2xl border border-slate-700/50 ${className}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-slate-300">Generating your QR code...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-slate-800/50 backdrop-blur-sm p-8 rounded-2xl border border-slate-700/50 ${className}`}>
        <div className="text-center">
          <div className="h-16 w-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="h-8 w-8 text-red-400" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">Error Generating QR Code</h3>
          <p className="text-slate-400 mb-4">{error}</p>
          <button 
            onClick={generateQR}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-slate-800/50 backdrop-blur-sm p-8 rounded-2xl border border-slate-700/50 ${className}`}>
      <div className="text-center">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white mb-2">My Digital ID</h2>
          <p className="text-slate-400">Show this QR code to mark your attendance</p>
        </div>

        {/* Student Info */}
        {userInfo && (
          <div className="mb-6 p-4 bg-slate-700/30 rounded-lg">
            <p className="text-white font-semibold text-lg">{userInfo.name}</p>
            <p className="text-slate-400 text-sm">{userInfo.id}</p>
          </div>
        )}

        {/* QR Code with Avatar Overlay */}
        <div className="relative inline-block mb-6">
          <div className={`bg-white p-6 rounded-2xl transition-opacity duration-300 ${refreshing ? 'opacity-50' : 'opacity-100'}`}>
            {qrData ? (
              <div className="relative">
                <QRCodeSVG
                  value={qrData}
                  size={280}
                  level="H"
                />
                {/* Avatar Overlay in Center */}
                {userInfo?.avatar && (
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <div className="bg-white rounded-lg p-2 shadow-lg border-2 border-slate-200">
                      <div className="h-12 w-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-lg">{userInfo.avatar}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="w-[280px] h-[280px] flex items-center justify-center">
                <p className="text-slate-600">No QR code available</p>
              </div>
            )}
          </div>
          
          {refreshing && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          )}
        </div>

        {/* Expiration Info */}
        <div className="mb-6">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className={`text-2xl font-bold font-mono ${getTimerColor()}`}>
              {formatTimeLeft(timeLeft)}
            </span>
          </div>
          <p className="text-slate-400 text-sm">
            {timeLeft > 0 ? `Valid until ${formatExpirationDate()}` : 'QR code expired'}
          </p>
        </div>

        {/* Regenerate Button */}
        <button
          onClick={generateQR}
          disabled={refreshing}
          className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 mx-auto"
        >
          <svg className={`h-5 w-5 ${refreshing ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
          </svg>
          <span>{refreshing ? 'Regenerating...' : 'Regenerate QR Code'}</span>
        </button>

        {/* Info */}
        <div className="mt-6 p-4 bg-blue-900/20 border border-blue-700/50 rounded-lg">
          <p className="text-blue-300 text-sm">
            <span className="font-semibold">💡 Tip:</span> This QR code is valid for 24 hours. You can regenerate it anytime if needed.
          </p>
        </div>
      </div>
    </div>
  );
}
