"use client";

import { useState, useRef } from 'react';
import { profileService } from '@/lib/profileService';

interface ProfilePhotoUploadProps {
  currentAvatar: string;
  firstName?: string;
  lastName?: string;
  onUploadSuccess: (newAvatar: string) => void;
}

export default function ProfilePhotoUpload({ currentAvatar, firstName, lastName, onUploadSuccess }: ProfilePhotoUploadProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const displayAvatar = preview || currentAvatar;
  const initials = profileService.getInitials(firstName, lastName);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError('');
    setSuccess('');
    setUploading(true);

    try {
      // Validate file
      const validation = profileService.validateImage(file);
      if (!validation.valid) {
        setError(validation.error || 'Invalid file');
        setUploading(false);
        return;
      }

      // Compress and show preview
      console.log('Original file size:', (file.size / 1024).toFixed(2), 'KB');
      
      const compressedBase64 = await profileService.compressImage(file, 800, 800, 0.8);
      
      console.log('Compressed size:', (compressedBase64.length / 1024).toFixed(2), 'KB');
      
      setPreview(compressedBase64);
      setSuccess('Image compressed and ready to upload');
      
      // Clear success message after 2 seconds
      setTimeout(() => setSuccess(''), 2000);
      
    } catch (err: any) {
      console.error('Compression error:', err);
      setError('Failed to process image: ' + (err.message || 'Unknown error'));
    } finally {
      setUploading(false);
    }
  };

  const handleUpload = async () => {
    if (!preview) return;

    try {
      setUploading(true);
      setError('');
      
      console.log('Uploading avatar...');
      console.log('Preview length:', preview.length);
      console.log('Preview starts with:', preview.substring(0, 50));
      
      const response = await profileService.uploadAvatar(preview);
      
      console.log('Upload response:', response);
      
      setSuccess('Profile photo updated successfully!');
      onUploadSuccess(response.avatar);
      setPreview(null);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
      
    } catch (err: any) {
      console.error('Upload error:', err);
      const errorMessage = err.message || 'Failed to upload photo';
      setError(errorMessage);
      
      // Show more detailed error for debugging
      if (err.message.includes('Failed to fetch')) {
        setError('Network error: Cannot connect to server. Please check your connection.');
      } else if (err.message.includes('401')) {
        setError('Authentication error: Please login again.');
      } else if (err.message.includes('413')) {
        setError('Image too large: Please use a smaller image (max 2MB).');
      } else {
        setError(`Upload failed: ${errorMessage}`);
      }
    } finally {
      setUploading(false);
    }
  };

  const handleCancel = () => {
    setPreview(null);
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-4">
      {/* Avatar Display */}
      <div className="flex flex-col items-center">
        <div className="relative group">
          <div className="h-32 w-32 rounded-full overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-2xl border-4 border-slate-700">
            {displayAvatar && displayAvatar.startsWith('data:image') ? (
              <img 
                src={displayAvatar} 
                alt="Profile" 
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="text-white font-bold text-4xl">
                {initials}
              </span>
            )}
          </div>
          
          {/* Upload Overlay */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <div className="text-center">
              <svg className="h-8 w-8 text-white mx-auto mb-1" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
              </svg>
              <span className="text-white text-xs font-medium">Change Photo</span>
            </div>
          </button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />

        <p className="text-slate-400 text-sm mt-3 text-center">
          Click on photo to change • Max 5MB • JPG, PNG
        </p>
      </div>

      {/* Upload Progress */}
      {uploading && !preview && (
        <div className="p-4 bg-blue-900/20 border border-blue-700/50 rounded-lg">
          <div className="flex items-center space-x-3">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-400"></div>
            <p className="text-blue-400 text-sm">Compressing image...</p>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="p-3 bg-red-900/20 border border-red-700/50 rounded-lg">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className="p-3 bg-green-900/20 border border-green-700/50 rounded-lg">
          <p className="text-green-400 text-sm">{success}</p>
        </div>
      )}

      {/* Preview Actions */}
      {preview && (
        <div className="flex gap-3">
          <button
            onClick={handleCancel}
            className="flex-1 bg-slate-700 text-white px-4 py-2 rounded-lg hover:bg-slate-600 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={uploading}
            className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {uploading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Uploading...</span>
              </>
            ) : (
              <>
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                </svg>
                <span>Upload Photo</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
