// QR Code API Service Layer

const API_BASE_URL = 'http://localhost:8000';

// Helper function to get auth token
const getAuthToken = (): string | null => {
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

// Student QR Code APIs
export const qrService = {
  // Generate QR code for student
  generateQRCode: async (): Promise<{
    qrData: string;
    expiresIn: string;
    userInfo: {
      name: string;
      userType: string;
      id: string;
      avatar?: string;
    };
  }> => {
    const token = getAuthToken();
    if (!token) throw new Error('No authentication token found');

    const response = await fetch(`${API_BASE_URL}/api/qr/generate`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    return handleApiError(response);
  },

  // Get student's attendance history
  getMyAttendanceHistory: async (page: number = 1, limit: number = 20): Promise<{
    attendance: Array<{
      id: string;
      scannedAt: string;
      scannedBy: {
        name: string;
        userType: string;
      };
      purpose?: string;
      location?: string;
    }>;
    pagination: {
      currentPage: number;
      totalPages: number;
      totalRecords: number;
      limit: number;
    };
  }> => {
    const token = getAuthToken();
    if (!token) throw new Error('No authentication token found');

    const response = await fetch(
      `${API_BASE_URL}/api/qr/attendance/my-history?page=${page}&limit=${limit}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return handleApiError(response);
  },

  // Verify QR code only (no attendance marking)
  verifyQRCode: async (qrData: string): Promise<{
    valid: boolean;
    student: {
      studentId: string;
      name: string;
      department: string;
      year: string;
      universityName: string;
    };
  }> => {
    const token = getAuthToken();
    if (!token) throw new Error('No authentication token found');

    const response = await fetch(`${API_BASE_URL}/api/qr/verify`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ qrData }),
    });

    return handleApiError(response);
  },

  // Scan QR code and mark attendance
  scanAndMarkAttendance: async (
    qrData: string,
    purpose?: string,
    location?: string
  ): Promise<{
    message: string;
    student: {
      studentId: string;
      name: string;
      department: string;
      year: string;
    };
    scannedBy: {
      name: string;
      userType: string;
    };
    scannedAt: string;
  }> => {
    const token = getAuthToken();
    if (!token) throw new Error('No authentication token found');

    const response = await fetch(`${API_BASE_URL}/api/qr/scan-attendance`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ qrData, purpose, location }),
    });

    return handleApiError(response);
  },

  // Get student attendance history by student ID (for lecturers/admins)
  getStudentAttendanceHistory: async (
    studentId: string,
    page: number = 1,
    limit: number = 20
  ): Promise<{
    student: {
      studentId: string;
      name: string;
      department: string;
      year: string;
    };
    attendance: Array<{
      id: string;
      scannedAt: string;
      scannedBy: {
        name: string;
        userType: string;
      };
      purpose?: string;
      location?: string;
    }>;
    pagination: {
      currentPage: number;
      totalPages: number;
      totalRecords: number;
      limit: number;
    };
  }> => {
    const token = getAuthToken();
    if (!token) throw new Error('No authentication token found');

    const response = await fetch(
      `${API_BASE_URL}/api/qr/attendance/student/${studentId}?page=${page}&limit=${limit}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return handleApiError(response);
  },
};
