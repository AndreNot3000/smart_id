"use client";

import { useState, useEffect } from 'react';
import { profileService, StudentProfile, UpdateProfileData } from '@/lib/profileService';
import ProfilePhotoUpload from './ProfilePhotoUpload';

export default function StudentProfilePage({ onProfileUpdate }: { onProfileUpdate?: () => void }) {
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [debugInfo, setDebugInfo] = useState('');

  // Form state
  const [formData, setFormData] = useState<UpdateProfileData>({
    firstName: '',
    lastName: '',
    phone: '',
    address: '',
    dateOfBirth: '',
    department: '',
    year: '',
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      console.log('Loading profile in profile page...');
      setDebugInfo('📥 Loading profile...');
      
      const data = await profileService.getProfile();
      
      const hasAvatar = !!data.profile.avatar && data.profile.avatar.startsWith('data:image');
      const debugMsg = hasAvatar 
        ? `✅ Profile loaded with avatar (${data.profile.avatar.length} chars)`
        : '⚠️ Profile loaded WITHOUT avatar';
      
      console.log('Profile loaded:', {
        hasAvatar,
        avatarLength: data.profile.avatar?.length,
        avatarStart: data.profile.avatar?.substring(0, 50)
      });
      
      setDebugInfo(debugMsg);
      setTimeout(() => setDebugInfo(''), 5000);
      
      setProfile(data);
      
      // Initialize form data
      setFormData({
        firstName: data.profile.firstName || '',
        lastName: data.profile.lastName || '',
        phone: data.profile.phone || '',
        address: data.profile.address || '',
        dateOfBirth: data.profile.dateOfBirth ? data.profile.dateOfBirth.split('T')[0] : '',
        department: data.profile.department || '',
        year: data.profile.year || '',
      });
    } catch (err: any) {
      console.error('Load profile error:', err);
      setError(err.message || 'Failed to load profile');
      setDebugInfo('❌ Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError('');
      setSuccess('');

      // Validate required fields
      if (!formData.firstName || !formData.lastName) {
        setError('First name and last name are required');
        return;
      }

      const response = await profileService.updateProfile(formData);
      
      setSuccess('Profile updated successfully!');
      setIsEditing(false);
      
      // Reload profile
      await loadProfile();
      
      // Notify parent component
      if (onProfileUpdate) {
        onProfileUpdate();
      }
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
      
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setError('');
    // Reset form data to current profile
    if (profile) {
      setFormData({
        firstName: profile.profile.firstName || '',
        lastName: profile.profile.lastName || '',
        phone: profile.profile.phone || '',
        address: profile.profile.address || '',
        dateOfBirth: profile.profile.dateOfBirth ? profile.profile.dateOfBirth.split('T')[0] : '',
        department: profile.profile.department || '',
        year: profile.profile.year || '',
      });
    }
  };

  const handleAvatarUpdate = (newAvatar: string) => {
    if (profile) {
      setDebugInfo('🔄 Avatar updated locally, refreshing...');
      
      setProfile({
        ...profile,
        profile: {
          ...profile.profile,
          avatar: newAvatar
        }
      });
      
      // Notify parent component
      if (onProfileUpdate) {
        onProfileUpdate();
      }
      
      setTimeout(() => setDebugInfo(''), 3000);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-slate-300">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="p-6 bg-red-900/20 border border-red-700/50 rounded-lg">
        <p className="text-red-400">Failed to load profile</p>
      </div>
    );
  }

  const yearOptions = ['Year 1', 'Year 2', 'Year 3', 'Year 4'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">My Profile</h2>
          <p className="text-slate-400 mt-1">Manage your personal information</p>
        </div>
        
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2.5 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg flex items-center space-x-2"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
            </svg>
            <span>Edit Profile</span>
          </button>
        ) : (
          <div className="flex gap-3">
            <button
              onClick={handleCancel}
              className="bg-slate-700 text-white px-6 py-2.5 rounded-lg hover:bg-slate-600 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-2.5 rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Debug Info */}
      {debugInfo && (
        <div className="p-4 bg-blue-900/30 border border-blue-700/50 rounded-lg">
          <p className="text-blue-300 text-sm font-mono">{debugInfo}</p>
        </div>
      )}

      {/* Messages */}
      {error && (
        <div className="p-4 bg-red-900/20 border border-red-700/50 rounded-lg">
          <p className="text-red-400">{error}</p>
        </div>
      )}

      {success && (
        <div className="p-4 bg-green-900/20 border border-green-700/50 rounded-lg">
          <p className="text-green-400">{success}</p>
        </div>
      )}

      {/* Profile Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Photo & Basic Info */}
        <div className="lg:col-span-1">
          <div className="bg-slate-800/50 backdrop-blur-sm p-6 rounded-2xl border border-slate-700/50 space-y-6">
            {/* Profile Photo */}
            <ProfilePhotoUpload 
              currentAvatar={profile.profile.avatar}
              firstName={profile.profile.firstName}
              lastName={profile.profile.lastName}
              onUploadSuccess={handleAvatarUpdate}
            />

            {/* Basic Info */}
            <div className="pt-6 border-t border-slate-700/50 space-y-4">
              <div>
                <p className="text-slate-400 text-sm">Student ID</p>
                <p className="text-white font-semibold font-mono">{profile.profile.studentId}</p>
              </div>
              
              <div>
                <p className="text-slate-400 text-sm">Email</p>
                <p className="text-white font-medium break-all">{profile.email}</p>
              </div>
              
              <div>
                <p className="text-slate-400 text-sm">University</p>
                <p className="text-white font-medium">{profile.profile.universityName}</p>
              </div>
              
              <div>
                <p className="text-slate-400 text-sm">Status</p>
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                  profile.status === 'active' 
                    ? 'bg-green-900/30 text-green-400' 
                    : 'bg-yellow-900/30 text-yellow-400'
                }`}>
                  {profile.status}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Editable Fields */}
        <div className="lg:col-span-2">
          <div className="bg-slate-800/50 backdrop-blur-sm p-6 rounded-2xl border border-slate-700/50">
            <h3 className="text-lg font-bold text-white mb-6">Personal Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* First Name */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  First Name <span className="text-red-400">*</span>
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter first name"
                  />
                ) : (
                  <p className="text-white font-medium py-2.5">{profile.profile.firstName || '-'}</p>
                )}
              </div>

              {/* Last Name */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Last Name <span className="text-red-400">*</span>
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter last name"
                  />
                ) : (
                  <p className="text-white font-medium py-2.5">{profile.profile.lastName || '-'}</p>
                )}
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Phone Number <span className="text-red-400">*</span>
                </label>
                {isEditing ? (
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="+234 801 234 5678"
                  />
                ) : (
                  <p className="text-white font-medium py-2.5">{profile.profile.phone || '-'}</p>
                )}
              </div>

              {/* Date of Birth */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Date of Birth <span className="text-red-400">*</span>
                </label>
                {isEditing ? (
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-white font-medium py-2.5">
                    {profile.profile.dateOfBirth 
                      ? new Date(profile.profile.dateOfBirth).toLocaleDateString()
                      : '-'}
                  </p>
                )}
              </div>

              {/* Department */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Department <span className="text-red-400">*</span>
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Computer Science"
                  />
                ) : (
                  <p className="text-white font-medium py-2.5">{profile.profile.department || '-'}</p>
                )}
              </div>

              {/* Year */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Year <span className="text-red-400">*</span>
                </label>
                {isEditing ? (
                  <select
                    name="year"
                    value={formData.year}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select year</option>
                    {yearOptions.map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                ) : (
                  <p className="text-white font-medium py-2.5">{profile.profile.year || '-'}</p>
                )}
              </div>

              {/* Address */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Address <span className="text-red-400">*</span>
                </label>
                {isEditing ? (
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter your full address"
                  />
                ) : (
                  <p className="text-white font-medium py-2.5">{profile.profile.address || '-'}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
