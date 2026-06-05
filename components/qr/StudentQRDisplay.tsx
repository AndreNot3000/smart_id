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
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  // Storage keys
  const QR_DATA_KEY = 'student_qr_data';
  const QR_USER_INFO_KEY = 'student_qr_user_info';

  // Load QR data from storage
  const loadQRFromStorage = useCallback(() => {
    try {
      const storedQRData = sessionStorage.getItem(QR_DATA_KEY);
      const storedUserInfo = sessionStorage.getItem(QR_USER_INFO_KEY);

      if (storedQRData && storedUserInfo) {
        setQrData(storedQRData);
        setUserInfo(JSON.parse(storedUserInfo));
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error loading QR from storage:', err);
      return false;
    }
  }, []);

  // Save QR data to storage
  const saveQRToStorage = useCallback((qrData: string, userInfo: any) => {
    try {
      sessionStorage.setItem(QR_DATA_KEY, qrData);
      sessionStorage.setItem(QR_USER_INFO_KEY, JSON.stringify(userInfo));
    } catch (err) {
      console.error('Error saving QR to storage:', err);
    }
  }, []);

  // Generate QR code
  const generateQR = useCallback(async () => {
    try {
      // Try to load from storage first
      const loaded = loadQRFromStorage();
      if (loaded) {
        setLoading(false);
        return;
      }

      setError('');
      
      const response = await qrService.generateQRCode();
      
      setQrData(response.qrData);
      setUserInfo(response.userInfo);

      // Save to storage (permanent, no expiration)
      saveQRToStorage(response.qrData, response.userInfo);
      
    } catch (err: any) {
      setError(err.message || 'Failed to generate QR code');
      console.error('QR generation error:', err);
    } finally {
      setLoading(false);
    }
  }, [loadQRFromStorage, saveQRToStorage]);

  // Initial QR load/generation (only once on mount)
  useEffect(() => {
    generateQR();
  }, [generateQR]);

  if (loading) {
    return (
      <div className={`bg-slate-800/50 backdrop-blur-sm p-8 rounded-2xl border border-slate-700/50 ${className}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-slate-300">Loading your QR code...</p>
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
          <h3 className="text-xl font-semibold text-white mb-2">Error Loading QR Code</h3>
          <p className="text-slate-400 mb-4">{error}</p>
          <button 
            onClick={() => { setLoading(true); setError(''); generateQR(); }}
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
          <div className="bg-white p-6 rounded-2xl">
            {qrData ? (
              <div className="relative">
                <QRCodeSVG
                  value={qrData}
                  size={280}
                  level="H"
                />
                {/* Avatar Overlay in Center */}
                {userInfo && (
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <div className="bg-white rounded-lg p-2 shadow-lg border-2 border-slate-200">
                      <div className="h-12 w-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center overflow-hidden">
                        {userInfo.avatar && userInfo.avatar.startsWith('data:image') ? (
                          <img 
                            src={userInfo.avatar} 
                            alt="Profile" 
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <span className="text-white font-bold text-sm">
                            {userInfo.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                          </span>
                        )}
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
        </div>

        {/* Permanent Badge */}
        <div className="mb-6">
          <span className="inline-flex items-center px-4 py-2 bg-green-900/30 border border-green-700/50 rounded-full">
            <svg className="h-4 w-4 text-green-400 mr-2" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
            </svg>
            <span className="text-green-400 text-sm font-medium">Permanent ID - Does not expire</span>
          </span>
        </div>

        {/* Info */}
        <div className="p-4 bg-blue-900/20 border border-blue-700/50 rounded-lg">
          <p className="text-blue-300 text-sm">
            <span className="font-semibold">💡 Tip:</span> This is your permanent digital ID. It stays the same and never expires.
          </p>
        </div>
      </div>
    </div>
  );
}
