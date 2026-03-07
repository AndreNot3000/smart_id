"use client";

import { useState, useEffect } from 'react';
import { profileService, ProfileCompletion } from '@/lib/profileService';

interface ProfileCompletionBannerProps {
  onNavigateToProfile: () => void;
  onRefresh?: () => void;
}

export default function ProfileCompletionBanner({ onNavigateToProfile, onRefresh }: ProfileCompletionBannerProps) {
  const [completion, setCompletion] = useState<ProfileCompletion | null>(null);
  const [loading, setLoading] = useState(true);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    checkCompletion();
  }, []);

  const checkCompletion = async () => {
    try {
      const data = await profileService.checkCompletion();
      setCompletion(data);
    } catch (error) {
      console.error('Failed to check profile completion:', error);
      // Don't show banner if there's an error
      setCompletion(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !completion || completion.isComplete || dismissed) {
    return null;
  }

  return (
    <div className="mb-6 bg-gradient-to-r from-yellow-900/30 to-orange-900/30 border-2 border-yellow-600/50 rounded-2xl p-6 backdrop-blur-sm shadow-xl">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-3">
            <div className="flex-shrink-0">
              <div className="h-12 w-12 bg-yellow-500/20 rounded-full flex items-center justify-center">
                <svg className="h-6 w-6 text-yellow-400" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                </svg>
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-yellow-300">Complete Your Profile</h3>
              <p className="text-yellow-200/80 text-sm mt-1">{completion.message}</p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-yellow-300">Profile Completion</span>
              <span className="text-sm font-bold text-yellow-300">{completion.completionPercentage}%</span>
            </div>
            <div className="w-full bg-slate-700/50 rounded-full h-3 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${completion.completionPercentage}%` }}
              ></div>
            </div>
          </div>

          {/* Missing Fields */}
          {completion.missingFields.length > 0 && (
            <div className="mb-4">
              <p className="text-sm text-yellow-200/80 mb-2">Missing information:</p>
              <div className="flex flex-wrap gap-2">
                {completion.missingFields.map((field) => (
                  <span 
                    key={field}
                    className="px-3 py-1 bg-yellow-900/30 border border-yellow-600/30 rounded-full text-xs text-yellow-300 font-medium"
                  >
                    {field.replace(/([A-Z])/g, ' $1').trim()}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Action Button */}
          <button
            onClick={onNavigateToProfile}
            className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-6 py-2.5 rounded-lg hover:from-yellow-600 hover:to-orange-600 transition-all shadow-lg hover:shadow-xl font-semibold text-sm flex items-center space-x-2"
          >
            <span>Complete Profile Now</span>
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </button>
        </div>

        {/* Dismiss Button */}
        <button
          onClick={() => setDismissed(true)}
          className="ml-4 text-yellow-400/60 hover:text-yellow-400 transition-colors"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}
