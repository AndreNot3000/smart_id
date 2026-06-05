import { API_BASE_URL, getApiUrl } from './config';

const getAuthToken = (): string | null => sessionStorage.getItem('accessToken');

const authHeaders = (): HeadersInit => {
  const token = getAuthToken();
  if (!token) throw new Error('Not signed in');
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
};

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: response.statusText }));
    throw new Error(err.error || err.message || `Request failed (${response.status})`);
  }
  return response.json();
}

export type SessionType = 'class' | 'test' | 'exam';
export type SessionStatus = 'scheduled' | 'active' | 'closed' | 'cancelled';
export type Presence = 'present' | 'absent' | 'late' | 'excused';

export interface AttendanceSessionSummary {
  _id: string;
  courseId: string;
  courseCode: string;
  courseName: string;
  type: SessionType;
  title: string;
  location?: string;
  scheduledAt: string;
  startedAt?: string;
  endedAt?: string;
  status: SessionStatus;
  expectedCount: number;
  presentCount: number;
  department?: string;
  lecturerName?: string;
}

export interface RosterStudent {
  studentId: string;
  studentNumber: string;
  name: string;
  firstName?: string;
  lastName?: string;
  email: string;
  department: string;
  year: string;
  avatar: string | null;
  enrolledAt?: string | null;
}

export interface SessionRosterEntry extends RosterStudent {
  presence: Presence;
  source: string | null;
  markedAt: string | null;
}

export const attendanceService = {
  getLocations: async (): Promise<string[]> => {
    const res = await fetch(getApiUrl('/api/attendance/locations'), {
      headers: authHeaders(),
    });
    const data = await handleResponse<{ locations: string[] }>(res);
    return data.locations;
  },

  getSessions: async (params?: {
    courseId?: string;
    status?: SessionStatus;
    type?: SessionType;
    limit?: number;
  }): Promise<AttendanceSessionSummary[]> => {
    const q = new URLSearchParams();
    if (params?.courseId) q.set('courseId', params.courseId);
    if (params?.status) q.set('status', params.status);
    if (params?.type) q.set('type', params.type);
    if (params?.limit) q.set('limit', String(params.limit));
    const res = await fetch(getApiUrl(`/api/attendance/sessions?${q}`), {
      headers: authHeaders(),
    });
    const data = await handleResponse<{ sessions: AttendanceSessionSummary[] }>(res);
    return data.sessions;
  },

  getSession: async (sessionId: string) => {
    const res = await fetch(getApiUrl(`/api/attendance/sessions/${sessionId}`), {
      headers: authHeaders(),
    });
    return handleResponse<{
      session: AttendanceSessionSummary & { notes?: string };
      roster: SessionRosterEntry[];
      stats: {
        expected: number;
        present: number;
        late: number;
        absent: number;
        excused: number;
      };
    }>(res);
  },

  createSession: async (body: {
    courseId: string;
    type: SessionType;
    title: string;
    location: string;
    scheduledAt?: string;
    durationMinutes?: number;
    notes?: string;
    autoStart?: boolean;
  }) => {
    const res = await fetch(getApiUrl('/api/attendance/sessions'), {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(body),
    });
    return handleResponse<{ message: string; session: AttendanceSessionSummary }>(res);
  },

  startSession: async (sessionId: string) => {
    const res = await fetch(getApiUrl(`/api/attendance/sessions/${sessionId}/start`), {
      method: 'POST',
      headers: authHeaders(),
    });
    return handleResponse<{ message: string; expectedCount: number }>(res);
  },

  closeSession: async (sessionId: string) => {
    const res = await fetch(getApiUrl(`/api/attendance/sessions/${sessionId}/close`), {
      method: 'POST',
      headers: authHeaders(),
    });
    return handleResponse<{ message: string; presentCount: number }>(res);
  },

  deleteSession: async (sessionId: string) => {
    const res = await fetch(getApiUrl(`/api/attendance/sessions/${sessionId}`), {
      method: 'DELETE',
      headers: authHeaders(),
    });
    return handleResponse<{ message: string }>(res);
  },

  markStudent: async (
    sessionId: string,
    studentId: string,
    presence: Presence
  ) => {
    const res = await fetch(getApiUrl(`/api/attendance/sessions/${sessionId}/mark`), {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ studentId, presence }),
    });
    return handleResponse<{ message: string; presentCount: number }>(res);
  },

  markAbsentRest: async (sessionId: string) => {
    const res = await fetch(
      getApiUrl(`/api/attendance/sessions/${sessionId}/mark-absent-rest`),
      { method: 'POST', headers: authHeaders() }
    );
    return handleResponse<{ message: string; markedAbsent: number }>(res);
  },

  exportSessionCsv: async (sessionId: string) => {
    const token = getAuthToken();
    if (!token) throw new Error('Not signed in');
    const res = await fetch(getApiUrl(`/api/attendance/sessions/${sessionId}/export`), {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('Export failed');
    return res.blob();
  },

  getAnalytics: async (params?: { days?: number; courseId?: string }) => {
    const q = new URLSearchParams();
    if (params?.days) q.set('days', String(params.days));
    if (params?.courseId) q.set('courseId', params.courseId);
    const res = await fetch(getApiUrl(`/api/attendance/analytics?${q}`), {
      headers: authHeaders(),
    });
    return handleResponse<{
      window: { days: number; from: string };
      totals: { sessions: number; expected: number; present: number; rate: number };
      daily: Array<{ date: string; sessions: number; expected: number; present: number; rate: number }>;
      courses: Array<{
        courseId: string;
        courseCode: string;
        courseName: string;
        rate: number;
        sessions: number;
        expected: number;
        present: number;
      }>;
      types: Array<{ type: string; rate: number; sessions: number; expected: number; present: number }>;
    }>(res);
  },

  getAtRisk: async (params?: { days?: number; threshold?: number; courseId?: string }) => {
    const q = new URLSearchParams();
    if (params?.days) q.set('days', String(params.days));
    if (params?.threshold != null) q.set('threshold', String(params.threshold));
    const res = await fetch(getApiUrl(`/api/attendance/at-risk?${q}`), {
      headers: authHeaders(),
    });
    const data = await handleResponse<{
      atRisk: Array<{
        studentId: string;
        name: string;
        studentNumber: string;
        email: string;
        department: string;
        year: string;
        avatar: string | null;
        expected: number;
        present: number;
        rate: number;
      }>;
      threshold: number;
      days: number;
      totalSessions: number;
    }>(res);
    return data;
  },

  getRoster: async (courseId: string) => {
    const res = await fetch(getApiUrl(`/api/course/${courseId}/roster`), {
      headers: authHeaders(),
    });
    return handleResponse<{
      course: { _id: string; courseCode: string; courseName: string };
      roster: RosterStudent[];
      total: number;
    }>(res);
  },

  getRosterCandidates: async (courseId: string, search?: string) => {
    const q = new URLSearchParams();
    if (search) q.set('search', search);
    const res = await fetch(getApiUrl(`/api/course/${courseId}/roster/candidates?${q}`), {
      headers: authHeaders(),
    });
    return handleResponse<{ candidates: RosterStudent[]; total: number }>(res);
  },

  enrollStudents: async (courseId: string, studentIds: string[]) => {
    const res = await fetch(getApiUrl(`/api/course/${courseId}/roster`), {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ studentIds }),
    });
    return handleResponse<{ added: number; alreadyEnrolled: number; notFound: number }>(res);
  },

  bulkEnrollByCriteria: async (courseId: string) => {
    const res = await fetch(getApiUrl(`/api/course/${courseId}/roster/bulk-by-criteria`), {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({}),
    });
    return handleResponse<{ added: number; alreadyEnrolled: number; candidates: number }>(res);
  },

  withdrawStudent: async (courseId: string, studentId: string) => {
    const res = await fetch(getApiUrl(`/api/course/${courseId}/roster/${studentId}`), {
      method: 'DELETE',
      headers: authHeaders(),
    });
    return handleResponse<{ message: string }>(res);
  },

  getCourses: async (opts?: { assignedOnly?: boolean }) => {
    const url = opts?.assignedOnly ? '/api/course?assignedOnly=true' : '/api/course';
    const res = await fetch(getApiUrl(url), { headers: authHeaders() });
    const data = await handleResponse<{ courses: Array<Record<string, unknown>> }>(res);
    return data.courses;
  },

  /** Download helper — uses API_BASE_URL for blob export */
  downloadExport: async (sessionId: string, filename: string) => {
    const blob = await attendanceService.exportSessionCsv(sessionId);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  },

  /** Combined CSV of every session of a course (matrix: students x sessions). */
  exportCourseCsv: async (courseId: string) => {
    const token = getAuthToken();
    if (!token) throw new Error('Not signed in');
    const res = await fetch(getApiUrl(`/api/attendance/courses/${courseId}/export`), {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      let msg = 'Export failed';
      try {
        const j = await res.json();
        if (j?.error) msg = j.error;
      } catch {
        /* non-JSON response */
      }
      throw new Error(msg);
    }
    return res.blob();
  },

  /** Download every session of a course as one organized CSV file. */
  downloadCourseExport: async (courseId: string, filename: string) => {
    const blob = await attendanceService.exportCourseCsv(courseId);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  },
};

export { API_BASE_URL };
