// Profile API Service Layer
import { getApiUrl } from './config';

// Helper function to get auth token
const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return sessionStorage.getItem('accessToken');
};

// Helper function to handle API errors
const handleApiError = async (response: Response) => {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'An error occurred' }));
    throw new Error(error.message || `HTTP ${response.status}: ${response.statusText}`);
  }
  return response.json();
};

export interface ProfileCompletion {
  isComplete: boolean;
  completionPercentage: number;
  missingFields: string[];
  message: string;
}

export interface StudentProfile {
  id: string;
  email: string;
  userType: string;
  status: string;
  profile: {
    firstName: string;
    lastName: string;
    studentId: string;
    department: string;
    year: string;
    phone?: string;
    address?: string;
    dateOfBirth?: string;
    avatar: string;
    universityName: string;
  };
  institutionId: string;
}

export interface UpdateProfileData {
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
  dateOfBirth: string;
  department: string;
  year: string;
}

export const profileService = {
  // Check profile completion
  checkCompletion: async (): Promise<ProfileCompletion> => {
    const token = getAuthToken();
    if (!token) throw new Error('No authentication token found');

    const response = await fetch(getApiUrl('/api/users/profile/completion'), {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    return handleApiError(response);
  },

  // Get user profile
  getProfile: async (): Promise<StudentProfile> => {
    const token = getAuthToken();
    if (!token) throw new Error('No authentication token found');

    const response = await fetch(getApiUrl('/api/users/profile'), {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    return handleApiError(response);
  },

  // Update profile
  updateProfile: async (data: UpdateProfileData): Promise<{ message: string; profile: any }> => {
    const token = getAuthToken();
    if (!token) throw new Error('No authentication token found');

    const response = await fetch(getApiUrl('/api/users/profile'), {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    return handleApiError(response);
  },

  // Upload avatar
  uploadAvatar: async (avatarBase64: string): Promise<{ message: string; avatar: string }> => {
    const token = getAuthToken();
    if (!token) throw new Error('No authentication token found');

    try {
      console.log('Sending avatar upload request...');
      console.log('API URL:', getApiUrl('/api/users/avatar'));
      console.log('Token present:', !!token);
      console.log('Avatar data length:', avatarBase64.length);

      const response = await fetch(getApiUrl('/api/users/avatar'), {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ avatar: avatarBase64 }),
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        
        try {
          const errorJson = JSON.parse(errorText);
          throw new Error(errorJson.message || `HTTP ${response.status}: ${response.statusText}`);
        } catch (parseError) {
          throw new Error(`HTTP ${response.status}: ${errorText || response.statusText}`);
        }
      }

      const result = await response.json();
      console.log('Upload successful:', result);
      return result;
      
    } catch (err: any) {
      console.error('Upload avatar error:', err);
      
      if (err.message === 'Failed to fetch') {
        throw new Error('Network error: Cannot connect to server. Check if backend is running.');
      }
      
      throw err;
    }
  },

  // Compress and convert image to base64
  compressImage: (file: File, maxWidth: number = 800, maxHeight: number = 800, quality: number = 0.8): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        const img = new Image();
        
        img.onload = () => {
          // Create canvas
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          // Calculate new dimensions
          if (width > height) {
            if (width > maxWidth) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width = Math.round((width * maxHeight) / height);
              height = maxHeight;
            }
          }

          canvas.width = width;
          canvas.height = height;

          // Draw and compress
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Failed to get canvas context'));
            return;
          }

          ctx.drawImage(img, 0, 0, width, height);

          // Convert to base64 with compression
          const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
          resolve(compressedBase64);
        };

        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = e.target?.result as string;
      };

      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  },

  // Convert file to base64 (without compression)
  fileToBase64: (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  },

  // Validate image file
  validateImage: (file: File): { valid: boolean; error?: string } => {
    // Check file type
    if (!file.type.startsWith('image/')) {
      return { valid: false, error: 'Please select an image file' };
    }

    // Check file size (5MB max before compression)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      return { valid: false, error: 'Image size must be less than 5MB' };
    }

    return { valid: true };
  },

  // Get initials from name
  getInitials: (firstName?: string, lastName?: string): string => {
    const first = firstName?.[0] || '';
    const last = lastName?.[0] || '';
    return `${first}${last}`.toUpperCase() || 'ST';
  },
};
