 "use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { DashboardShell, StatCard, Icon, type NavItem } from "@/components/dashboard";
import type { TourStep } from "@/lib/tour";
import StudentQRDisplay from "@/components/qr/StudentQRDisplay";
import AttendanceHistory from "@/components/qr/AttendanceHistory";
import StudentProfilePage from "@/components/profile/StudentProfilePage";
import ProfileCompletionBanner from "@/components/profile/ProfileCompletionBanner";
import PaymentsSection from "@/components/wallet/PaymentsSection";
import QuizTaker from "@/components/quiz/QuizTaker";
import RichTextEditor from "@/components/editor/RichTextEditor";
import { getApiUrl } from "@/lib/config";
import { enforceRole } from "@/lib/session";
import { profileService } from "@/lib/profileService";

// Types for API responses
interface StudentProfile {
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
    avatar: string;
    universityName: string;
  };
  institutionId: string;
}

interface Course {
  id: string;
  name: string;
  code: string;
  time: string;
  room: string;
  instructor: string;
  credits: number;
}

// Compact "x ago" formatter for the activity feed.
function timeAgo(date: string | number | Date): string {
  const then = new Date(date).getTime();
  if (!Number.isFinite(then)) return '';
  const diff = Date.now() - then;
  const min = Math.floor(diff / 60000);
  if (min < 1) return 'just now';
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.floor(hr / 24);
  if (day < 7) return `${day}d ago`;
  return new Date(date).toLocaleDateString();
}

export default function TestDashboard() {
  const router = useRouter();
  const [activeSection, setActiveSection] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [studentData, setStudentData] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [walletBalance, setWalletBalance] = useState<number>(0);

  // Schedule states
  const [scheduleEntries, setScheduleEntries] = useState<any[]>([]);
  const [scheduleGrouped, setScheduleGrouped] = useState<Record<string, any[]>>({});
  const [todayClasses, setTodayClasses] = useState<any[]>([]);
  const [loadingSchedule, setLoadingSchedule] = useState(false);
  const [scheduleLoaded, setScheduleLoaded] = useState(false);
  const [scheduleDept, setScheduleDept] = useState('');
  const [scheduleLevel, setScheduleLevel] = useState('');
  const [scheduleView, setScheduleView] = useState<'week' | 'month'>('week');
  const [scheduleDate, setScheduleDate] = useState(new Date().toISOString().split('T')[0]);
  const [scheduleStartDate, setScheduleStartDate] = useState('');
  const [scheduleEndDate, setScheduleEndDate] = useState('');
  const [scheduleFilter, setScheduleFilter] = useState<string>('all');
  const [scheduleError, setScheduleError] = useState<string>('');
  const [dashboardTodayClasses, setDashboardTodayClasses] = useState<any[]>([]);
  const [loadingDashboardClasses, setLoadingDashboardClasses] = useState(false);
  const [overviewAssignments, setOverviewAssignments] = useState<any[]>([]);
  const [loadingOverviewAssignments, setLoadingOverviewAssignments] = useState(false);
  const [gpaData, setGpaData] = useState<any>(null);
  const [loadingGpa, setLoadingGpa] = useState(false);
  const [activityFeed, setActivityFeed] = useState<any[]>([]);
  const [loadingFeed, setLoadingFeed] = useState(false);
  const [feedLastSeen, setFeedLastSeen] = useState<number>(0);
  // When opening a course from the activity feed, remember which tab to land on
  // (the selectedCourse effect otherwise resets it to "materials").
  const pendingCourseTabRef = useRef<'materials' | 'announcements' | 'assignments' | 'quizzes' | null>(null);

  // Course states
  const [courses, setCourses] = useState<any[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const [courseMaterials, setCourseMaterials] = useState<any[]>([]);
  const [loadingMaterials, setLoadingMaterials] = useState(false);
  const [materialCategory, setMaterialCategory] = useState('all');
  const [previewMaterial, setPreviewMaterial] = useState<any>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewData, setPreviewData] = useState<string>('');
  const [studentCourseTab, setStudentCourseTab] = useState<'materials' | 'announcements' | 'assignments' | 'quizzes'>('materials');
  const [studentAnnouncements, setStudentAnnouncements] = useState<any[]>([]);
  const [studentAssignments, setStudentAssignments] = useState<any[]>([]);
  const [studentQuizzes, setStudentQuizzes] = useState<any[]>([]);
  const [takingQuiz, setTakingQuiz] = useState<string | null>(null);
  const [submittingAssignment, setSubmittingAssignment] = useState<any>(null);
  const [submitFile, setSubmitFile] = useState({ fileName: '', fileData: '', fileType: '', fileSize: 0, comment: '' });
  const [submitting, setSubmitting] = useState(false);
  const [fileLoadProgress, setFileLoadProgress] = useState(0);
  const [fileLoading, setFileLoading] = useState(false);
  const [submissionReceipt, setSubmissionReceipt] = useState<any>(null);
  const [submitMode, setSubmitMode] = useState<'file' | 'write'>('file');
  const [richTextContent, setRichTextContent] = useState('');

  // Check for section query parameter
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const section = params.get('section');
      if (section) {
        setActiveSection(section);
        // Clean up URL
        window.history.replaceState({}, '', '/test-dashboard');
      }
    }
  }, []);

  // Fetch student profile data
  useEffect(() => {
    fetchStudentProfile();
    fetchWalletBalance();
  }, [router]);

  const fetchWalletBalance = async () => {
    try {
      const { paymentService } = await import('@/lib/paymentService');
      const response = await paymentService.getWalletBalance();
      setWalletBalance(response.wallet.balance || 0);
    } catch (err) {
      console.error('Wallet fetch error:', err);
      // Keep balance at 0 if wallet not found or error
      setWalletBalance(0);
    }
  };

  const fetchStudentProfile = async () => {
    try {
      // Guard: the token in this tab must belong to a student. If a tab
      // inherited a different user's session (e.g. opened from another tab),
      // bounce to login instead of rendering the wrong account.
      if (!enforceRole('student', router)) return;

      const token = sessionStorage.getItem('accessToken');

      console.log('Fetching student profile...');

      const response = await fetch(getApiUrl('/api/users/profile'), {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout(10000),
      });

      console.log('Profile response status:', response.status);

      if (response.status === 401) {
        sessionStorage.removeItem('accessToken');
        sessionStorage.removeItem('refreshToken');
        sessionStorage.removeItem('user');
        router.push('/login');
        return;
      }

      if (response.ok) {
        const profileData: StudentProfile = await response.json();
        console.log('Profile data received:', {
          hasAvatar: !!profileData.profile.avatar,
          avatarLength: profileData.profile.avatar?.length,
          avatarStart: profileData.profile.avatar?.substring(0, 50),
          firstName: profileData.profile.firstName,
          studentId: profileData.profile.studentId
        });
        setStudentData(profileData);
      } else {
        throw new Error('Failed to load profile data');
      }

    } catch (err: any) {
      setError(err.message || 'Failed to load student data');
      console.error('Student profile fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Static data (would normally come from APIs)
  const todaysClasses: Course[] = [
    {
      id: '1',
      name: 'Data Structures',
      code: 'CS 201',
      time: '10:00 AM',
      room: 'Room 301',
      instructor: 'Dr. Smith',
      credits: 3
    },
    {
      id: '2',
      name: 'Calculus II',
      code: 'MTH 202',
      time: '2:00 PM',
      room: 'Room 105',
      instructor: 'Prof. Johnson',
      credits: 4
    },
    {
      id: '3',
      name: 'Physics Lab',
      code: 'PHY 201L',
      time: '4:00 PM',
      room: 'Lab 2',
      instructor: 'Dr. Wilson',
      credits: 1
    }
  ];

  // Course functions
  const fetchCourses = async () => {
    setLoadingCourses(true);
    try {
      const token = sessionStorage.getItem('accessToken');
      if (!token) return;
      const response = await fetch(getApiUrl('/api/course'), {
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
      if (response.ok) {
        const data = await response.json();
        setCourses(data.courses || []);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoadingCourses(false);
    }
  };

  const fetchCourseMaterials = async (courseId: string) => {
    setLoadingMaterials(true);
    try {
      const token = sessionStorage.getItem('accessToken');
      if (!token) return;
      const response = await fetch(getApiUrl(`/api/course/${courseId}/materials`), {
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
      if (response.ok) {
        const data = await response.json();
        setCourseMaterials(data.materials || []);
      }
    } catch (error) {
      console.error('Error fetching materials:', error);
    } finally {
      setLoadingMaterials(false);
    }
  };

  const downloadMaterial = async (materialId: string, fileName: string) => {
    try {
      const token = sessionStorage.getItem('accessToken');
      if (!token) return;
      const response = await fetch(getApiUrl(`/api/course/material/${materialId}/download`), {
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
      if (response.ok) {
        const data = await response.json();
        const link = document.createElement('a');
        link.href = `data:${data.fileType};base64,${data.fileData}`;
        link.download = data.fileName || fileName;
        link.click();
      }
    } catch (error) {
      console.error('Error downloading material:', error);
    }
  };

  const openPreview = async (material: any) => {
    if (!material.fileType?.includes('pdf')) {
      downloadMaterial(material._id, material.fileName);
      return;
    }
    setPreviewMaterial(material);
    setPreviewLoading(true);
    setPreviewData('');
    try {
      const token = sessionStorage.getItem('accessToken');
      if (!token) return;
      const response = await fetch(getApiUrl(`/api/course/material/${material._id}/download`), {
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
      if (response.ok) {
        const data = await response.json();
        // Convert base64 to Blob URL (no size limit unlike data URIs)
        const byteChars = atob(data.fileData);
        const byteNumbers = new Array(byteChars.length);
        for (let i = 0; i < byteChars.length; i++) {
          byteNumbers[i] = byteChars.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'application/pdf' });
        const blobUrl = URL.createObjectURL(blob);
        setPreviewData(blobUrl);
      }
    } catch (error) {
      console.error('Error loading preview:', error);
    } finally {
      setPreviewLoading(false);
    }
  };

  useEffect(() => {
    if (activeSection === 'courses') fetchCourses();
  }, [activeSection]);

  // Poll for course updates (every 15s) with notifications
  useEffect(() => {
    const token = sessionStorage.getItem('accessToken');
    if (!token) return;
    let lastCourseTimestamp = 0;
    const pollCourses = async () => {
      try {
        const response = await fetch(getApiUrl('/api/course/updates?since=' + lastCourseTimestamp), {
          headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        });
        if (response.ok) {
          const data = await response.json();
          if (data.updated && lastCourseTimestamp > 0) {
            if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
              new Notification('📚 Course Update', {
                body: 'New course materials or announcements available. Check your courses.',
                icon: '/favicon.ico'
              });
            }
            lastCourseTimestamp = data.timestamp;
            fetchCourses();
            if (selectedCourse) {
              fetchCourseMaterials(selectedCourse._id);
              fetchStudentAnnouncements(selectedCourse._id);
              fetchStudentAssignments(selectedCourse._id);
              fetchStudentQuizzes(selectedCourse._id);
            }
          } else if (data.updated) {
            lastCourseTimestamp = data.timestamp;
            fetchCourses();
            if (selectedCourse) {
              fetchCourseMaterials(selectedCourse._id);
              fetchStudentAnnouncements(selectedCourse._id);
              fetchStudentAssignments(selectedCourse._id);
              fetchStudentQuizzes(selectedCourse._id);
            }
          }
        }
      } catch {}
    };
    const interval = setInterval(pollCourses, 10000);
    return () => clearInterval(interval);
  }, [selectedCourse]);

  // Poll for quiz updates (every 10s)
  useEffect(() => {
    const token = sessionStorage.getItem('accessToken');
    if (!token || !selectedCourse) return;
    let lastQuizTimestamp = 0;
    const pollQuizzes = async () => {
      try {
        const currentToken = sessionStorage.getItem('accessToken');
        if (!currentToken) return;
        const res = await fetch(getApiUrl('/api/quiz/updates?since=' + lastQuizTimestamp), {
          headers: { 'Authorization': `Bearer ${currentToken}` },
        });
        if (res.ok) {
          const data = await res.json();
          if (data.updated) {
            lastQuizTimestamp = data.timestamp;
            fetchStudentQuizzes(selectedCourse._id);
          }
        }
      } catch {}
    };
    const interval = setInterval(pollQuizzes, 10000);
    return () => clearInterval(interval);
  }, [selectedCourse]);

  // Fetch student announcements and assignments
  const fetchStudentAnnouncements = async (courseId: string) => {
    try {
      const token = sessionStorage.getItem('accessToken');
      if (!token) return;
      const res = await fetch(getApiUrl(`/api/course/${courseId}/announcements`), { headers: { 'Authorization': `Bearer ${token}` } });
      if (res.ok) { const data = await res.json(); setStudentAnnouncements(data.announcements || []); }
    } catch {}
  };

  const fetchStudentAssignments = async (courseId: string) => {
    try {
      const token = sessionStorage.getItem('accessToken');
      if (!token) return;
      const res = await fetch(getApiUrl(`/api/course/${courseId}/assignments`), { headers: { 'Authorization': `Bearer ${token}` } });
      if (res.ok) { const data = await res.json(); setStudentAssignments(data.assignments || []); }
    } catch {}
  };

  const fetchStudentQuizzes = async (courseId: string) => {
    try {
      const token = sessionStorage.getItem('accessToken');
      if (!token) return;
      const res = await fetch(getApiUrl(`/api/quiz/course/${courseId}`), { headers: { 'Authorization': `Bearer ${token}` } });
      if (res.ok) { const data = await res.json(); setStudentQuizzes(data.quizzes || []); }
    } catch {}
  };

  const handleSubmitAssignment = async () => {
    if (!submittingAssignment) return;
    if (submitMode === 'file' && !submitFile.fileData) return;
    if (submitMode === 'write' && (!richTextContent || richTextContent === '<p><br></p>')) return;
    setSubmitting(true);
    try {
      const token = sessionStorage.getItem('accessToken');
      if (!token) return;

      let payload: any;
      if (submitMode === 'write') {
        const htmlContent = richTextContent;
        const base64 = btoa(unescape(encodeURIComponent(htmlContent)));
        payload = { fileName: 'written-answer.html', fileData: base64, fileType: 'text/html', fileSize: new Blob([htmlContent]).size, comment: submitFile.comment, submissionType: 'written' };
      } else {
        payload = { ...submitFile, submissionType: 'file' };
      }

      const res = await fetch(getApiUrl(`/api/course/assignment/${submittingAssignment._id}/submit`), {
        method: 'POST', headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setSubmissionReceipt({
          assignmentTitle: submittingAssignment.title,
          courseCode: selectedCourse?.courseCode || '',
          courseName: selectedCourse?.courseName || '',
          fileName: submitMode === 'write' ? 'Written Answer' : submitFile.fileName,
          fileSize: submitMode === 'write' ? new Blob([richTextContent]).size : submitFile.fileSize,
          submittedAt: new Date().toISOString(),
          receiptId: `RCP-${Date.now().toString(36).toUpperCase()}`,
        });
        setSubmittingAssignment(null);
        setSubmitFile({ fileName: '', fileData: '', fileType: '', fileSize: 0, comment: '' });
        setRichTextContent('');
        setSubmitMode('file');
        setFileLoading(false);
        setFileLoadProgress(0);
        if (selectedCourse) fetchStudentAssignments(selectedCourse._id);
      }
    } catch {}
    finally { setSubmitting(false); }
  };

  const handleSubmitFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileLoading(true);
    setFileLoadProgress(0);
    setSubmitFile(prev => ({ ...prev, fileName: file.name, fileData: '', fileType: file.type, fileSize: file.size }));
    const reader = new FileReader();
    reader.onprogress = (event) => {
      if (event.lengthComputable) {
        setFileLoadProgress(Math.round((event.loaded / event.total) * 100));
      }
    };
    reader.onload = () => {
      const base64 = (reader.result as string).split(',')[1] || '';
      setSubmitFile(prev => ({ ...prev, fileName: file.name, fileData: base64, fileType: file.type, fileSize: file.size }));
      setFileLoadProgress(100);
      setTimeout(() => setFileLoading(false), 400);
    };
    reader.onerror = () => {
      setFileLoading(false);
      setFileLoadProgress(0);
      setSubmitFile(prev => ({ ...prev, fileName: '', fileData: '' }));
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    if (selectedCourse) {
      setStudentAssignments([]);
      setStudentAnnouncements([]);
      setCourseMaterials([]);
      setStudentQuizzes([]);
      fetchCourseMaterials(selectedCourse._id);
      fetchStudentAnnouncements(selectedCourse._id);
      fetchStudentAssignments(selectedCourse._id);
      fetchStudentQuizzes(selectedCourse._id);
      setMaterialCategory('all');
      setStudentCourseTab(pendingCourseTabRef.current || 'materials');
      pendingCourseTabRef.current = null;
    }
  }, [selectedCourse]);

  // Schedule functions
  const fetchSchedule = async (view?: string, date?: string) => {
    if (!scheduleLoaded) setLoadingSchedule(true);
    try {
      const token = sessionStorage.getItem('accessToken');
      if (!token) return;
      const v = view || scheduleView;
      const d = date || scheduleDate;
      const url = getApiUrl(`/api/schedule/student?view=${v}&date=${d}`);
      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        let detail = `${response.status} ${response.statusText || ''}`.trim();
        try {
          const errBody = await response.json();
          if (errBody?.error) detail = errBody.error;
        } catch {
          // non-JSON response
        }
        console.error(`[schedule] GET ${url} failed: ${detail}`);
        setScheduleError(`Could not load schedule: ${detail}`);
        return;
      }

      const data = await response.json();
      setScheduleEntries(data.schedule || []);
      setScheduleGrouped(data.groupedByDate || {});
      setTodayClasses(data.todayClasses || []);
      setScheduleDept(data.department || '');
      setScheduleLevel(data.level || '');
      setScheduleStartDate(data.startDate || '');
      setScheduleEndDate(data.endDate || '');
      setScheduleLoaded(true);
      setScheduleError('');
    } catch (error) {
      console.error('Error fetching schedule:', error);
      setScheduleError(error instanceof Error ? error.message : 'Could not load schedule');
    } finally {
      setLoadingSchedule(false);
    }
  };

  useEffect(() => {
    if (activeSection === 'schedule') {
      fetchSchedule();
    }
  }, [activeSection, scheduleView, scheduleDate]);

  // Reusable function to fetch today's classes for the dashboard overview
  const fetchDashboardTodayClasses = async () => {
    const token = sessionStorage.getItem('accessToken');
    if (!token) return;
    setLoadingDashboardClasses(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      const response = await fetch(getApiUrl(`/api/schedule/student?view=week&date=${today}`), {
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
      if (response.ok) {
        const data = await response.json();
        setDashboardTodayClasses(data.todayClasses || []);
      }
    } catch (error) {
      console.error('Error fetching today classes:', error);
    } finally {
      setLoadingDashboardClasses(false);
    }
  };

  // Fetch all assignments across the student's courses for the overview card
  const fetchOverviewAssignments = async () => {
    const token = sessionStorage.getItem('accessToken');
    if (!token) return;
    setLoadingOverviewAssignments(true);
    try {
      const response = await fetch(getApiUrl('/api/course/student/assignments'), {
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
      if (response.ok) {
        const data = await response.json();
        setOverviewAssignments(data.assignments || []);
      }
    } catch (error) {
      console.error('Error fetching overview assignments:', error);
    } finally {
      setLoadingOverviewAssignments(false);
    }
  };

  const fetchGpa = async () => {
    const token = sessionStorage.getItem('accessToken');
    if (!token) return;
    try {
      const response = await fetch(getApiUrl('/api/course/student/gpa'), {
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
      if (response.ok) {
        const data = await response.json();
        setGpaData(data);
      } else {
        console.error('GPA fetch failed:', response.status, await response.text());
      }
    } catch (error) {
      console.error('Error fetching GPA:', error);
    } finally {
      setLoadingGpa(false);
    }
  };

  // Unified "what's new" feed: new materials, assignments and announcements
  // posted by lecturers across the student's courses.
  const fetchActivityFeed = async () => {
    const token = sessionStorage.getItem('accessToken');
    if (!token) return;
    if (activityFeed.length === 0) setLoadingFeed(true);
    try {
      const response = await fetch(getApiUrl('/api/course/student/feed?limit=20'), {
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
      if (response.ok) {
        const data = await response.json();
        const feed = data.feed || [];
        setActivityFeed(feed);
        // Advance the stored "last seen" baseline to the newest item so this
        // student won't be re-alerted about the same items next login. The
        // in-session baseline (feedLastSeen) stays put so NEW badges remain
        // visible until they navigate away / refresh.
        if (feed.length > 0) {
          const newest = Math.max(...feed.map((f: any) => new Date(f.createdAt).getTime()));
          if (typeof window !== 'undefined') {
            localStorage.setItem('studentFeedLastSeen', String(newest));
          }
        }
      }
    } catch (error) {
      console.error('Error fetching activity feed:', error);
    } finally {
      setLoadingFeed(false);
    }
  };

  // Jump straight to the relevant course + tab when a student taps a feed item.
  const openFeedItem = (item: any) => {
    const tab =
      item.type === 'assignment' ? 'assignments'
      : item.type === 'announcement' ? 'announcements'
      : 'materials';
    pendingCourseTabRef.current = tab;
    const course =
      courses.find((c: any) => c._id === item.courseId) || {
        _id: item.courseId,
        courseCode: item.courseCode,
        courseName: item.courseName,
      };
    setActiveSection('courses');
    setSelectedCourse(course);
  };

  // Request notification permission on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // Poll for real-time schedule updates from lecturers (every 10s)
  useEffect(() => {
    const token = sessionStorage.getItem('accessToken');
    if (!token) return;

    let lastTimestamp = 0;

    const showNotification = (data: any) => {
      if (typeof window === 'undefined' || !('Notification' in window) || Notification.permission !== 'granted') return;

      let title = 'Schedule Update';
      let body = 'Your class schedule has been updated';

      const course = data.courseCode ? `${data.courseCode} - ${data.courseName}` : 'A class';

      switch (data.action) {
        case 'created':
          title = '📚 New Class Added';
          body = data.count > 1
            ? `${data.count} new ${course} classes have been scheduled`
            : `${course} has been added to your schedule`;
          break;
        case 'cancelled':
          title = '🚫 Class Cancelled';
          body = data.reason
            ? `${course} has been cancelled — ${data.reason}`
            : `${course} has been cancelled`;
          break;
        case 'restored':
          title = '✅ Class Restored';
          body = `${course} is back on the schedule`;
          break;
        case 'updated':
          title = '📝 Schedule Changed';
          body = `${course} has been updated`;
          break;
        case 'deleted':
          title = '🗑️ Class Removed';
          body = `${course} has been removed from the schedule`;
          break;
        case 'announcement':
          title = '📢 Class Announcement';
          body = `New announcement for ${course}`;
          break;
      }

      new Notification(title, { body, icon: '/favicon.ico' });
      console.log('[Schedule Notification]', title, body);
    };

    const poll = async () => {
      try {
        const currentToken = sessionStorage.getItem('accessToken');
        if (!currentToken) return;
        const response = await fetch(getApiUrl(`/api/schedule/student/updates?since=${lastTimestamp}`), {
          headers: { 'Authorization': `Bearer ${currentToken}`, 'Content-Type': 'application/json' },
        });
        if (response.status === 401) {
          // Try to refresh the token
          const rt = sessionStorage.getItem('refreshToken');
          if (!rt) return;
          const refreshRes = await fetch(getApiUrl('/api/auth/refresh-token'), {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken: rt }),
          });
          if (refreshRes.ok) {
            const data = await refreshRes.json();
            if (data.accessToken) sessionStorage.setItem('accessToken', data.accessToken);
            if (data.refreshToken) sessionStorage.setItem('refreshToken', data.refreshToken);
          }
          return;
        }
        if (response.ok) {
          const data = await response.json();
          if (data.updated) {
            lastTimestamp = data.timestamp;
            if (activeSection === 'schedule') {
              fetchSchedule();
            }
            fetchDashboardTodayClasses();
            showNotification(data);
          }
        }
      } catch (error) {
        // Silently ignore polling errors
      }
    };

    const interval = setInterval(poll, 10000);
    return () => clearInterval(interval);
  }, [activeSection, scheduleView, scheduleDate]);

  // Fetch today's classes on mount
  useEffect(() => {
    fetchDashboardTodayClasses();
  }, []);

  // Read the stored "feed last seen" baseline once on mount so we can flag
  // items posted since the student last checked their overview.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const stored = parseInt(localStorage.getItem('studentFeedLastSeen') || '0');
    setFeedLastSeen(Number.isFinite(stored) ? stored : 0);
  }, []);

  // Refresh overview assignments whenever the overview is opened
  useEffect(() => {
    if (activeSection === 'dashboard') {
      fetchOverviewAssignments();
    }
  }, [activeSection]);

  // Keep the activity feed fresh on the overview + poll so new uploads from
  // lecturers appear in near real time (every 30s).
  useEffect(() => {
    if (activeSection !== 'dashboard') return;
    fetchActivityFeed();
    const interval = setInterval(fetchActivityFeed, 30000);
    return () => clearInterval(interval);
  }, [activeSection]);

  // Keep the CGPA live: fetch on the overview/grades sections + poll so it
  // reflects new grading in near real time. Recomputed server-side each call.
  useEffect(() => {
    if (activeSection !== 'dashboard' && activeSection !== 'grades') return;
    if (!gpaData) setLoadingGpa(true);
    fetchGpa();
    const interval = setInterval(fetchGpa, 30000);
    return () => clearInterval(interval);
  }, [activeSection]);

  // Class reminder notifications — checks every 60s
  useEffect(() => {
    if (typeof window === 'undefined' || !('Notification' in window) || Notification.permission !== 'granted') return;
    if (!dashboardTodayClasses || dashboardTodayClasses.length === 0) return;

    const checkReminders = () => {
      const now = new Date();
      const currentMinutes = now.getHours() * 60 + now.getMinutes();

      // Get already-notified IDs from sessionStorage so they persist across re-renders
      const notifiedRaw = sessionStorage.getItem('_scheduleNotified') || '{}';
      const notified: Record<string, boolean> = JSON.parse(notifiedRaw);

      for (const entry of dashboardTodayClasses) {
        if (entry.status === 'cancelled') continue;
        const [h, m] = entry.startTime.split(':').map(Number);
        const startMinutes = h * 60 + m;
        const diff = startMinutes - currentMinutes;

        // Skip classes that have already started or passed
        if (diff <= 0) continue;

        // 30 min reminder
        if (diff <= 30 && !notified[`${entry._id}-30`]) {
          notified[`${entry._id}-30`] = true;
          new Notification(`⏰ ${entry.courseCode} starts in ${diff} min`, {
            body: `${entry.courseName} • ${entry.venue} • ${entry.startTime}`,
            icon: '/favicon.ico'
          });
        }
        // 5 min reminder
        if (diff <= 5 && !notified[`${entry._id}-5`]) {
          notified[`${entry._id}-5`] = true;
          new Notification(`🔔 ${entry.courseCode} starts in ${diff} min!`, {
            body: `${entry.courseName} • ${entry.venue} • Get ready!`,
            icon: '/favicon.ico'
          });
        }
      }

      sessionStorage.setItem('_scheduleNotified', JSON.stringify(notified));
    };

    checkReminders();
    const interval = setInterval(checkReminders, 60000);
    return () => clearInterval(interval);
  }, [dashboardTodayClasses]);

  // Auto-refresh expired access token
  useEffect(() => {
    const refreshAccessToken = async () => {
      const refreshToken = sessionStorage.getItem('refreshToken');
      if (!refreshToken) return;
      try {
        const response = await fetch(getApiUrl('/api/auth/refresh-token'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken }),
        });
        if (response.ok) {
          const data = await response.json();
          if (data.accessToken) sessionStorage.setItem('accessToken', data.accessToken);
          if (data.refreshToken) sessionStorage.setItem('refreshToken', data.refreshToken);
        } else {
          // Refresh token also expired — force re-login
          sessionStorage.removeItem('accessToken');
          sessionStorage.removeItem('refreshToken');
          sessionStorage.removeItem('user');
          router.push('/login');
        }
      } catch (error) {
        console.error('Token refresh error:', error);
      }
    };

    // Refresh token 10 minutes before expiry (access token is 4h, so refresh at 3h50m)
    const interval = setInterval(refreshAccessToken, 230 * 60 * 1000);
    return () => clearInterval(interval);
  }, [router]);

  const navigateSchedule = (direction: number) => {
    const d = new Date(scheduleDate);
    if (scheduleView === 'week') d.setDate(d.getDate() + direction * 7);
    else d.setMonth(d.getMonth() + direction);
    setScheduleDate(d.toISOString().split('T')[0]);
  };

  const formatScheduleDateLabel = (dateStr: string) => {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const getStudentWeekDates = () => {
    const d = new Date(scheduleDate);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(d);
    monday.setDate(diff);
    const dates: string[] = [];
    for (let i = 0; i < 7; i++) {
      const cur = new Date(monday);
      cur.setDate(monday.getDate() + i);
      dates.push(cur.toISOString().split('T')[0]);
    }
    return dates;
  };

  const scheduleColors = ['bg-blue-900/30 border-blue-700/50', 'bg-purple-900/30 border-purple-700/50', 'bg-green-900/30 border-green-700/50', 'bg-orange-900/30 border-orange-700/50', 'bg-pink-900/30 border-pink-700/50', 'bg-teal-900/30 border-teal-700/50'];
  const getScheduleColor = (code: string) => {
    let hash = 0;
    for (let i = 0; i < code.length; i++) hash = code.charCodeAt(i) + ((hash << 5) - hash);
    return scheduleColors[Math.abs(hash) % scheduleColors.length];
  };

  // Calendar export helpers
  const toICSDate = (dateStr: string, time: string) => {
    const [y, mo, d] = dateStr.split('-');
    const [h, m] = time.split(':');
    return `${y}${mo}${d}T${h}${m}00`;
  };

  const exportSingleICS = (entry: any) => {
    const lines = [
      'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//CampusID//Schedule//EN',
      'BEGIN:VEVENT',
      `DTSTART:${toICSDate(entry.date, entry.startTime)}`,
      `DTEND:${toICSDate(entry.date, entry.endTime)}`,
      `SUMMARY:${entry.courseCode} - ${entry.courseName}`,
      `LOCATION:${entry.venue}`,
      `DESCRIPTION:Lecturer: ${entry.lecturerName || ''}${entry.announcement ? '\\nNote: ' + entry.announcement : ''}`,
      `UID:${entry._id}@campusid`,
      'END:VEVENT', 'END:VCALENDAR'
    ];
    const blob = new Blob([lines.join('\r\n')], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${entry.courseCode}-${entry.date}.ics`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportAllICS = () => {
    const activeEntries = scheduleEntries.filter((e: any) => e.status !== 'cancelled');
    if (activeEntries.length === 0) return;
    const events = activeEntries.map((entry: any) => [
      'BEGIN:VEVENT',
      `DTSTART:${toICSDate(entry.date, entry.startTime)}`,
      `DTEND:${toICSDate(entry.date, entry.endTime)}`,
      `SUMMARY:${entry.courseCode} - ${entry.courseName}`,
      `LOCATION:${entry.venue}`,
      `DESCRIPTION:Lecturer: ${entry.lecturerName || ''}${entry.announcement ? '\\nNote: ' + entry.announcement : ''}`,
      `UID:${entry._id}@campusid`,
      'END:VEVENT'
    ].join('\r\n')).join('\r\n');
    const ics = `BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//CampusID//Schedule//EN\r\n${events}\r\nEND:VCALENDAR`;
    const blob = new Blob([ics], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `schedule-${scheduleDate}.ics`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const openGoogleCalendar = (entry: any) => {
    const start = toICSDate(entry.date, entry.startTime);
    const end = toICSDate(entry.date, entry.endTime);
    const title = encodeURIComponent(`${entry.courseCode} - ${entry.courseName}`);
    const location = encodeURIComponent(entry.venue);
    const details = encodeURIComponent(`Lecturer: ${entry.lecturerName || ''}${entry.announcement ? '\nNote: ' + entry.announcement : ''}`);
    window.open(`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${start}/${end}&location=${location}&details=${details}`, '_blank');
  };

  // Get unique course codes for filter dropdown
  const uniqueCourses = Array.from(new Set(scheduleEntries.map((e: any) => e.courseCode))).sort();

  // Apply course filter to schedule data
  const filterEntries = (entries: any[]) => scheduleFilter === 'all' ? entries : entries.filter((e: any) => e.courseCode === scheduleFilter);
  const filteredEntries = filterEntries(scheduleEntries);
  const filteredGrouped: Record<string, any[]> = {};
  for (const [date, entries] of Object.entries(scheduleGrouped)) {
    const filtered = filterEntries(entries as any[]);
    if (filtered.length > 0) filteredGrouped[date] = filtered;
  }
  const filteredTodayClasses = filterEntries(todayClasses);

  // Detect schedule conflicts (overlapping classes on the same date)
  const scheduleConflicts: { date: string; a: any; b: any }[] = [];
  const conflictIds = new Set<string>();
  for (const [date, entries] of Object.entries(scheduleGrouped)) {
    const active = (entries as any[]).filter((e: any) => e.status !== 'cancelled');
    for (let i = 0; i < active.length; i++) {
      for (let j = i + 1; j < active.length; j++) {
        const a = active[i], b = active[j];
        const aStart = parseInt(a.startTime.replace(':', ''));
        const aEnd = parseInt(a.endTime.replace(':', ''));
        const bStart = parseInt(b.startTime.replace(':', ''));
        const bEnd = parseInt(b.endTime.replace(':', ''));
        if (bStart < aEnd && bEnd > aStart) {
          scheduleConflicts.push({ date, a, b });
          conflictIds.add(a._id);
          conflictIds.add(b._id);
        }
      }
    }
  }

  // Compute next upcoming class from today's classes
  const getNextClass = () => {
    if (!dashboardTodayClasses || dashboardTodayClasses.length === 0) return null;
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    const upcoming = dashboardTodayClasses
      .filter((c: any) => c.status !== 'cancelled')
      .map((c: any) => {
        const [h, m] = c.startTime.split(':').map(Number);
        return { ...c, startMinutes: h * 60 + m };
      })
      .filter((c: any) => c.startMinutes > currentMinutes)
      .sort((a: any, b: any) => a.startMinutes - b.startMinutes);

    if (upcoming.length === 0) return null;

    const next = upcoming[0];
    const diffMinutes = next.startMinutes - currentMinutes;
    let timeLabel: string;
    if (diffMinutes < 60) {
      timeLabel = `in ${diffMinutes} min`;
    } else {
      const hours = Math.floor(diffMinutes / 60);
      const mins = diffMinutes % 60;
      timeLabel = mins > 0 ? `in ${hours}h ${mins}m` : `in ${hours}h`;
    }

    return { ...next, timeLabel };
  };

  const nextClass = getNextClass();

  const menuItems: NavItem[] = [
    { id: 'dashboard', name: 'Overview', icon: 'dashboard' },
    { id: 'qr-code', name: 'My QR Code', icon: 'qrCode' },
    { id: 'attendance', name: 'My Attendance', icon: 'clipboardCheck' },
    { id: 'profile', name: 'My Profile', icon: 'user' },
    { id: 'courses', name: 'My Courses', icon: 'bookOpen' },
    { id: 'grades', name: 'Grades', icon: 'award' },
    { id: 'schedule', name: 'Schedule', icon: 'calendar' },
    { id: 'payments', name: 'Payments', icon: 'creditCard' },
  ];

  const pageTitleMap: Record<string, string> = {
    dashboard: 'Overview',
    'qr-code': 'My QR Code',
    attendance: 'My Attendance',
    profile: 'My Profile',
    courses: 'My Courses',
    grades: 'Grades',
    schedule: 'Schedule',
    payments: 'Payments',
  };

  const studentTourSteps: TourStep[] = [
    {
      title: 'Welcome to UniSmart 👋',
      description:
        "Let's take a quick 60-second tour of your student dashboard so you know where everything lives. You can skip anytime.",
    },
    {
      selector: '[data-tour="profile-card"]',
      title: 'This is you',
      description: 'Your name, photo and student ID appear here so you always know you are signed into the right account.',
      side: 'right',
    },
    {
      selector: '[data-tour="nav-dashboard"]',
      title: 'Your Overview',
      description: 'Your home base — GPA, attendance, wallet balance and a feed of what is new across your courses.',
      side: 'right',
    },
    {
      selector: '[data-tour="nav-qr-code"]',
      title: 'My QR Code',
      description: 'Show this code to your lecturer to mark attendance instantly. It refreshes for security.',
      side: 'right',
    },
    {
      selector: '[data-tour="nav-attendance"]',
      title: 'My Attendance',
      description: 'Track every class you have attended and spot any sessions you missed.',
      side: 'right',
    },
    {
      selector: '[data-tour="nav-courses"]',
      title: 'My Courses',
      description: 'See enrolled courses, assignments, announcements and learning materials from your lecturers.',
      side: 'right',
    },
    {
      selector: '[data-tour="nav-grades"]',
      title: 'Grades',
      description: 'View your scores and live CGPA as lecturers publish results.',
      side: 'right',
    },
    {
      selector: '[data-tour="nav-payments"]',
      title: 'Payments & Wallet',
      description: 'Fund your wallet and settle fees securely without leaving the dashboard.',
      side: 'right',
    },
    {
      selector: '[data-tour="nav-profile"]',
      title: 'Manage your account',
      description: 'Update your photo, contact details and personal information here.',
      side: 'right',
    },
    {
      selector: '[data-tour="help"]',
      title: "You're all set! 🎉",
      description: 'Need a refresher later? Click this help button anytime to replay the tour.',
      side: 'bottom',
      align: 'end',
    },
  ];

  // Calculate academic stats
  const academicStats = studentData ? {
    gpa: gpaData?.cgpa ?? null,
    scaleMax: gpaData?.scaleMax ?? 5.0,
    gpaLabel: gpaData?.label ?? '',
    creditsEarned: gpaData?.creditsEarned ?? 0,
    totalCredits: gpaData?.totalCredits ?? 0,
    attendance: 96,
    walletBalance: walletBalance
  } : {
    gpa: null,
    scaleMax: 5.0,
    gpaLabel: '',
    creditsEarned: 0,
    totalCredits: 0,
    attendance: 0,
    walletBalance: 0
  };

  const displayName = studentData 
    ? `${studentData.profile.firstName} ${studentData.profile.lastName}`
    : 'Student';

  const initials = studentData 
    ? profileService.getInitials(studentData.profile.firstName, studentData.profile.lastName)
    : 'ST';

  const displayData = {
    name: displayName,
    studentId: studentData?.profile.studentId || 'Loading...',
    year: studentData?.profile.year || 'Loading...',
    university: studentData?.profile.universityName || 'Loading...',
    avatar: studentData?.profile.avatar || '',
    initials: initials
  };

  if (loading) {
    return (
      <div className="app-shell flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[var(--accent)] mx-auto mb-4" />
          <p className="text-[var(--text-secondary)] text-sm">Loading dashboard…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="app-shell flex items-center justify-center p-4">
        <div className="section-card max-w-md w-full text-center">
          <div className="h-12 w-12 rounded-full mx-auto mb-4 flex items-center justify-center"
               style={{ background: 'rgba(239,68,68,0.12)', color: 'var(--danger)' }}>
            <Icon name="alert" size={22} />
          </div>
          <h3 className="text-[var(--text-primary)] text-lg font-semibold mb-2">Unable to load dashboard</h3>
          <p className="text-[var(--text-muted)] text-sm mb-5">{error}</p>
          <button type="button" onClick={() => window.location.reload()} className="btn btn-primary">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <DashboardShell
      role="student"
      navItems={menuItems}
      activeSection={activeSection}
      onSelectSection={setActiveSection}
      pageTitle={pageTitleMap[activeSection] ?? activeSection.replace('-', ' ')}
      pageSubtitle={studentData?.profile?.department}
      user={{
        name: displayData.name,
        subtitle: displayData.studentId,
        secondary: studentData?.profile?.department,
        avatar: displayData.avatar,
        initials: displayData.initials,
      }}
      tourSteps={studentTourSteps}
    >
      <>
          {activeSection === 'dashboard' && (
            <div className="space-y-6">
              <ProfileCompletionBanner onNavigateToProfile={() => setActiveSection('profile')} />

              <div>
                <p className="text-[var(--text-muted)] text-sm">Welcome back,</p>
                <h2 className="text-[var(--text-primary)] text-2xl sm:text-[28px] font-semibold tracking-tight mt-0.5">
                  {displayData.name}
                </h2>
                <p className="text-[var(--text-muted)] text-sm mt-1">
                  {displayData.university} · {displayData.year}
                </p>
              </div>

              {nextClass && (
                <div className="section-card flex items-center gap-4">
                  <div className="h-10 w-10 rounded-lg flex items-center justify-center shrink-0"
                       style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}>
                    <Icon name="clock" size={20} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="metric-label">Next class {nextClass.timeLabel}</p>
                    <p className="text-[var(--text-primary)] font-medium text-sm truncate mt-1">
                      {nextClass.courseCode} — {nextClass.courseName}
                    </p>
                    <p className="text-[var(--text-muted)] text-xs truncate">
                      {nextClass.startTime} – {nextClass.endTime} · {nextClass.venue} · {nextClass.lecturerName}
                    </p>
                    {nextClass.announcement && (
                      <p className="text-[var(--warning)] text-xs mt-1.5">{nextClass.announcement}</p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveSection('schedule')}
                    className="btn btn-ghost text-xs"
                  >
                    View schedule
                    <Icon name="arrowRight" size={14} />
                  </button>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                  label="Current GPA"
                  value={loadingGpa && academicStats.gpa == null ? '…' : (academicStats.gpa != null ? academicStats.gpa.toFixed(2) : '—')}
                  helper={`of ${academicStats.scaleMax.toFixed(1)}`}
                  icon="trendingUp"
                  accent="success"
                  trend={academicStats.gpa != null && academicStats.gpaLabel ? { direction: 'up', label: academicStats.gpaLabel } : undefined}
                />
                <StatCard
                  label="Credits Earned"
                  value={academicStats.creditsEarned}
                  helper={academicStats.totalCredits ? `of ${academicStats.totalCredits} total` : 'graded so far'}
                  icon="bookOpen"
                  accent="info"
                />
                <StatCard
                  label="Attendance"
                  value={`${academicStats.attendance}%`}
                  helper="this semester"
                  icon="clipboardCheck"
                  accent="neutral"
                />
                <StatCard
                  label="Wallet Balance"
                  value={`₦${academicStats.walletBalance.toLocaleString()}`}
                  helper="available"
                  icon="creditCard"
                  accent="warning"
                />
              </div>

              {/* What's new — materials, assignments & announcements from lecturers */}
              {(() => {
                const newCount = activityFeed.filter(
                  (f: any) => new Date(f.createdAt).getTime() > feedLastSeen
                ).length;
                return (
                  <div className="section-card">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <h3 className="section-title">What's new</h3>
                        {newCount > 0 && (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                                style={{ background: 'var(--accent)', color: 'white' }}>
                            {newCount} new
                          </span>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => setActiveSection('courses')}
                        className="btn btn-ghost text-xs shrink-0"
                      >
                        My courses
                        <Icon name="arrowRight" size={14} />
                      </button>
                    </div>

                    {loadingFeed && activityFeed.length === 0 ? (
                      <div className="text-center py-6">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
                        <p className="text-[var(--text-muted)] text-sm">Loading updates…</p>
                      </div>
                    ) : activityFeed.length === 0 ? (
                      <div className="text-center py-8">
                        <Icon name="bell" size={28} />
                        <p className="text-[var(--text-secondary)] text-sm mt-2">You're all caught up</p>
                        <p className="text-[var(--text-muted)] text-xs mt-1">
                          New materials, assignments and announcements will show up here.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
                        {activityFeed.map((item: any) => {
                          const isNew = new Date(item.createdAt).getTime() > feedLastSeen;
                          const meta =
                            item.type === 'assignment'
                              ? { icon: 'edit' as const, label: 'Assignment', color: 'var(--warning)' }
                              : item.type === 'announcement'
                              ? { icon: 'megaphone' as const, label: 'Announcement', color: 'var(--accent)' }
                              : { icon: 'bookOpen' as const, label: 'Material', color: 'var(--info, #3b82f6)' };
                          const overdue =
                            item.type === 'assignment' && item.deadline
                              ? new Date(item.deadline).getTime() < Date.now()
                              : false;
                          return (
                            <button
                              key={`${item.type}-${item.id}`}
                              type="button"
                              onClick={() => openFeedItem(item)}
                              className="w-full text-left flex items-start gap-3 p-3 rounded-lg transition-colors"
                              style={{
                                background: isNew ? 'var(--accent-soft)' : 'var(--surface-1)',
                                border: '1px solid var(--border-subtle)',
                              }}
                            >
                              <div className="h-9 w-9 rounded-lg flex items-center justify-center shrink-0"
                                   style={{ background: 'var(--surface-0)', color: meta.color }}>
                                <Icon name={meta.icon} size={18} />
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="text-[10px] font-semibold uppercase tracking-wide"
                                        style={{ color: meta.color }}>
                                    {meta.label}
                                  </span>
                                  <span className="text-[var(--text-muted)] text-xs">·</span>
                                  <span className="text-[var(--text-secondary)] text-xs font-medium">
                                    {item.courseCode}
                                  </span>
                                  {isNew && (
                                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded"
                                          style={{ background: 'var(--accent)', color: 'white' }}>
                                      NEW
                                    </span>
                                  )}
                                </div>
                                <p className="text-[var(--text-primary)] text-sm font-medium truncate mt-0.5">
                                  {item.title}
                                </p>
                                {item.detail && (
                                  <p className="text-[var(--text-muted)] text-xs truncate">
                                    {item.detail}
                                  </p>
                                )}
                                <div className="flex items-center gap-2 mt-1 flex-wrap">
                                  <span className="text-[var(--text-muted)] text-[11px]">
                                    {item.lecturerName ? `${item.lecturerName} · ` : ''}{timeAgo(item.createdAt)}
                                  </span>
                                  {item.type === 'assignment' && item.deadline && (
                                    <span className="text-[11px] font-medium"
                                          style={{ color: overdue ? 'var(--danger, #ef4444)' : 'var(--warning)' }}>
                                      {overdue ? 'Deadline passed' : `Due ${new Date(item.deadline).toLocaleDateString()}`}
                                    </span>
                                  )}
                                  {item.type === 'assignment' && item.submitted && (
                                    <span className="text-[11px] font-medium" style={{ color: 'var(--success)' }}>
                                      ✓ Submitted
                                    </span>
                                  )}
                                </div>
                              </div>
                              <Icon name="arrowRight" size={14} />
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })()}

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
                <div className="section-card">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="section-title">Today's classes</h3>
                      <p className="section-subtitle">Live schedule for the day</p>
                    </div>
                  </div>
                  {loadingDashboardClasses ? (
                    <div className="text-center py-6">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
                      <p className="text-slate-400 text-sm">Loading...</p>
                    </div>
                  ) : dashboardTodayClasses.length === 0 ? (
                    <div className="text-center py-6">
                      <p className="text-slate-400 text-sm">No classes scheduled for today</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {dashboardTodayClasses.map((entry: any) => (
                        <div key={entry._id} className={`flex items-center justify-between p-3 sm:p-4 rounded-lg gap-3 ${entry.status === 'cancelled' ? 'bg-red-900/20 border border-red-600/30' : 'bg-slate-700/30'}`}>
                          <div className="flex items-center space-x-3 min-w-0 flex-1">
                            <div className={`h-8 w-8 sm:h-10 sm:w-10 rounded-lg flex items-center justify-center flex-shrink-0 ${entry.status === 'cancelled' ? 'bg-gradient-to-br from-red-500 to-red-700' : 'bg-gradient-to-br from-orange-500 to-red-600'}`}>
                              <span className="text-white font-bold text-[11px] sm:text-xs leading-none text-center">{(entry.courseCode.match(/^[A-Za-z]+/)?.[0] || entry.courseCode).slice(0, 3).toUpperCase()}</span>
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className={`font-medium text-sm sm:text-base truncate ${entry.status === 'cancelled' ? 'text-red-300 line-through' : 'text-white'}`}>{entry.courseName}</p>
                              <p className={`text-xs sm:text-sm truncate ${entry.status === 'cancelled' ? 'text-red-400/60' : 'text-slate-400'}`}>{entry.courseCode} • {entry.venue}</p>
                              {entry.status === 'cancelled' && entry.cancelReason && (
                                <p className="text-xs text-red-400 italic mt-0.5">🚫 {entry.cancelReason}</p>
                              )}
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0">
                            {entry.status === 'cancelled' ? (
                              <span className="text-xs bg-red-600/30 text-red-300 px-2 py-1 rounded">Cancelled</span>
                            ) : (
                              <>
                                <p className="text-white font-semibold text-xs sm:text-sm whitespace-nowrap">{entry.startTime} - {entry.endTime}</p>
                                <p className="text-slate-400 text-xs">{entry.lecturerName}</p>
                              </>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="section-card">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="section-title">Recent grades</h3>
                      <p className="section-subtitle">Latest assessments</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveSection('grades')}
                      className="btn btn-ghost text-xs shrink-0"
                    >
                      View all
                      <Icon name="arrowRight" size={14} />
                    </button>
                  </div>
                  {(() => {
                    const graded = overviewAssignments
                      .filter((a: any) => a.mySubmission && a.mySubmission.score !== undefined && a.mySubmission.score !== null)
                      .sort((a: any, b: any) => {
                        const ta = new Date(a.mySubmission.gradedAt || a.mySubmission.submittedAt || 0).getTime();
                        const tb = new Date(b.mySubmission.gradedAt || b.mySubmission.submittedAt || 0).getTime();
                        return tb - ta;
                      })
                      .slice(0, 4);

                    if (loadingOverviewAssignments && graded.length === 0) {
                      return (
                        <div className="text-center py-6">
                          <div className="animate-spin rounded-full h-6 w-6 border-2 border-[var(--accent)] border-t-transparent mx-auto mb-2" />
                          <p className="text-[var(--text-muted)] text-xs">Loading…</p>
                        </div>
                      );
                    }

                    if (graded.length === 0) {
                      return (
                        <div className="text-center py-8">
                          <div className="h-12 w-12 rounded-full mx-auto mb-3 flex items-center justify-center"
                               style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}>
                            <Icon name="award" size={22} />
                          </div>
                          <p className="text-[var(--text-primary)] font-medium">No grades yet</p>
                          <p className="text-[var(--text-muted)] text-sm mt-1">Graded coursework will show up here.</p>
                        </div>
                      );
                    }

                    return (
                      <div className="space-y-3">
                        {graded.map((a: any) => {
                          const max = a.mySubmission.maxScore || a.maxScore || 100;
                          const pct = max > 0 ? (a.mySubmission.score / max) * 100 : 0;
                          const accent = pct >= 70 ? 'var(--success)' : pct >= 50 ? 'var(--info)' : 'var(--warning)';
                          return (
                            <div key={a._id} className="flex items-center justify-between gap-3 p-3 sm:p-4 rounded-lg"
                                 style={{ background: 'var(--surface-2, rgba(148,163,184,0.06))' }}>
                              <div className="min-w-0 flex-1">
                                <p className="text-[var(--text-primary)] font-medium text-sm sm:text-base truncate">{a.courseCode || a.courseName}</p>
                                <p className="text-[var(--text-muted)] text-xs sm:text-sm truncate">{a.title}</p>
                              </div>
                              <div className="text-right flex-shrink-0">
                                <span className="px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap"
                                      style={{ background: `color-mix(in srgb, ${accent} 16%, transparent)`, color: accent }}>
                                  {Math.round(pct)}%
                                </span>
                                <p className="text-[var(--text-muted)] text-xs mt-1">{a.mySubmission.score}/{max}</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })()}
                </div>
              </div>

              {/* Upcoming assignments */}
              <div className="section-card">
                <div className="flex items-center justify-between gap-3 mb-4">
                  <div className="min-w-0">
                    <h3 className="section-title">Upcoming assignments</h3>
                    <p className="section-subtitle">Coursework due across your courses</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveSection('courses')}
                    className="btn btn-ghost text-xs shrink-0"
                  >
                    View all
                    <Icon name="arrowRight" size={14} />
                  </button>
                </div>

                {loadingOverviewAssignments ? (
                  <div className="text-center py-6">
                    <div className="animate-spin rounded-full h-8 w-8 border-2 border-[var(--accent)] border-t-transparent mx-auto mb-2" />
                    <p className="text-[var(--text-muted)] text-sm">Loading…</p>
                  </div>
                ) : (() => {
                  const now = Date.now();
                  const upcoming = [...overviewAssignments]
                    .filter((a: any) => new Date(a.deadline).getTime() > now)
                    .sort((a: any, b: any) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());
                  const display = upcoming.slice(0, 5);

                  if (display.length === 0) {
                    return (
                      <div className="text-center py-8">
                        <div className="h-12 w-12 rounded-full mx-auto mb-3 flex items-center justify-center"
                             style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}>
                          <Icon name="edit" size={22} />
                        </div>
                        <p className="text-[var(--text-primary)] font-medium">You're all caught up</p>
                        <p className="text-[var(--text-muted)] text-sm mt-1">No upcoming assignments right now.</p>
                      </div>
                    );
                  }

                  return (
                    <div className="space-y-2">
                      {display.map((a: any) => {
                        const d = new Date(a.deadline);
                        const days = Math.ceil((d.getTime() - now) / 86400000);
                        const dueLabel = days <= 0 ? 'Due today' : days === 1 ? 'Due tomorrow' : `Due in ${days} days`;
                        const sub = a.mySubmission;
                        const graded = sub && sub.score !== undefined && sub.score !== null;
                        return (
                          <button
                            key={a._id}
                            type="button"
                            onClick={() => setActiveSection('courses')}
                            className="w-full text-left rounded-xl p-3 flex items-center gap-3 transition-colors"
                            style={{ background: 'var(--surface-0)', border: '1px solid var(--border-subtle)' }}
                          >
                            <div className="h-9 w-9 rounded-lg flex items-center justify-center shrink-0"
                                 style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}>
                              <Icon name="edit" size={16} />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <p className="text-[var(--text-primary)] font-medium text-sm truncate">{a.title}</p>
                                {a.courseCode && <span className="pill">{a.courseCode}</span>}
                              </div>
                              <p className="text-[var(--text-muted)] text-xs mt-0.5 flex items-center gap-1.5">
                                <Icon name="clock" size={11} />
                                {dueLabel} · {d.toLocaleString([], { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                              </p>
                            </div>
                            {graded ? (
                              <span className="pill pill-success shrink-0">{sub.score}/{sub.maxScore || a.maxScore || 100}</span>
                            ) : sub ? (
                              <span className="pill pill-info shrink-0">Submitted</span>
                            ) : days <= 2 ? (
                              <span className="pill pill-danger shrink-0">Due soon</span>
                            ) : (
                              <span className="pill pill-warning shrink-0">Pending</span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>
            </div>
          )}

          {/* Schedule Section */}
          {activeSection === 'schedule' && (
            <div className="space-y-5">
              <div className="section-card">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                  <div className="min-w-0">
                    <h2 className="section-title text-base sm:text-lg">My Schedule</h2>
                    {scheduleDept ? (
                      <p className="section-subtitle truncate">{scheduleDept} · {scheduleLevel}</p>
                    ) : (
                      <p className="section-subtitle">Plan your week, week by week.</p>
                    )}
                  </div>
                  <div className="flex items-stretch sm:items-center gap-2 w-full sm:w-auto">
                    <div className="flex items-center p-0.5 rounded-lg flex-1 sm:flex-initial" style={{ background: 'var(--surface-2)', border: '1px solid var(--border-default)' }}>
                      <button
                        type="button"
                        onClick={() => setScheduleView('week')}
                        className={`flex-1 sm:flex-initial px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                          scheduleView === 'week'
                            ? 'text-[var(--text-primary)]'
                            : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                        }`}
                        style={scheduleView === 'week' ? { background: 'var(--accent)' } : undefined}
                      >
                        Week
                      </button>
                      <button
                        type="button"
                        onClick={() => setScheduleView('month')}
                        className={`flex-1 sm:flex-initial px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                          scheduleView === 'month'
                            ? 'text-[var(--text-primary)]'
                            : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                        }`}
                        style={scheduleView === 'month' ? { background: 'var(--accent)' } : undefined}
                      >
                        Month
                      </button>
                    </div>
                    {scheduleEntries.length > 0 && (
                      <button type="button" onClick={exportAllICS} className="btn btn-ghost text-xs shrink-0">
                        <Icon name="download" size={14} />
                        <span className="hidden min-[380px]:inline">Export</span>
                      </button>
                    )}
                  </div>
                </div>

                {uniqueCourses.length > 1 && (
                  <div className="flex items-center gap-1.5 mt-4 flex-wrap">
                    <button
                      type="button"
                      onClick={() => setScheduleFilter('all')}
                      className={scheduleFilter === 'all' ? 'pill pill-info' : 'pill'}
                    >
                      All
                    </button>
                    {uniqueCourses.map((code: string) => (
                      <button
                        type="button"
                        key={code}
                        onClick={() => setScheduleFilter(code)}
                        className={scheduleFilter === code ? 'pill pill-info' : 'pill'}
                      >
                        {code}
                      </button>
                    ))}
                  </div>
                )}

                <div className="mt-5 mb-6 rounded-lg p-2"
                     style={{ background: 'var(--surface-0)', border: '1px solid var(--border-subtle)' }}>
                  <div className="flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => navigateSchedule(-1)}
                      className="btn btn-ghost p-1.5 shrink-0"
                      aria-label="Previous"
                    >
                      <Icon name="chevronLeft" size={18} />
                    </button>
                    <p className="text-[var(--text-primary)] font-medium text-xs sm:text-sm tabular-nums text-center truncate flex-1 min-w-0">
                      {scheduleStartDate && scheduleEndDate
                        ? `${formatScheduleDateLabel(scheduleStartDate)} – ${formatScheduleDateLabel(scheduleEndDate)}`
                        : formatScheduleDateLabel(scheduleDate)}
                    </p>
                    <button
                      type="button"
                      onClick={() => setScheduleDate(new Date().toISOString().split('T')[0])}
                      className="btn btn-secondary text-xs shrink-0 hidden sm:inline-flex"
                    >
                      Today
                    </button>
                    <button
                      type="button"
                      onClick={() => navigateSchedule(1)}
                      className="btn btn-ghost p-1.5 shrink-0"
                      aria-label="Next"
                    >
                      <Icon name="chevronRight" size={18} />
                    </button>
                  </div>
                  <div className="mt-2 flex justify-center sm:hidden">
                    <button
                      type="button"
                      onClick={() => setScheduleDate(new Date().toISOString().split('T')[0])}
                      className="btn btn-secondary text-xs"
                    >
                      Today
                    </button>
                  </div>
                </div>

                {scheduleConflicts.length > 0 && (
                  <div className="rounded-xl p-4 mb-5"
                       style={{
                         background: 'rgba(245, 158, 11, 0.08)',
                         border: '1px solid rgba(245, 158, 11, 0.25)',
                       }}>
                    <div className="flex items-center gap-2 mb-2">
                      <Icon name="alert" size={16} className="text-[var(--warning)]" />
                      <h3 className="text-sm font-semibold text-[var(--warning)]">
                        {scheduleConflicts.length} schedule conflict{scheduleConflicts.length !== 1 ? 's' : ''}
                      </h3>
                    </div>
                    <div className="space-y-1.5">
                      {scheduleConflicts.map((c, i) => (
                        <div key={i} className="rounded-lg px-3 py-2 text-xs"
                             style={{ background: 'rgba(245, 158, 11, 0.05)' }}>
                          <p className="text-[var(--text-secondary)]">
                            <span className="font-semibold text-[var(--text-primary)]">{c.a.courseCode}</span>{' '}
                            <span className="text-[var(--text-muted)]">({c.a.startTime}–{c.a.endTime})</span>
                            <span className="text-[var(--warning)] mx-1.5">overlaps with</span>
                            <span className="font-semibold text-[var(--text-primary)]">{c.b.courseCode}</span>{' '}
                            <span className="text-[var(--text-muted)]">({c.b.startTime}–{c.b.endTime})</span>
                          </p>
                          <p className="text-[var(--text-muted)] mt-0.5">
                            {new Date(c.date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {loadingSchedule ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[var(--accent)] mx-auto mb-3" />
                    <p className="text-[var(--text-muted)] text-sm">Loading schedule…</p>
                  </div>
                ) : scheduleError ? (
                  <div className="rounded-xl p-4 flex items-start gap-3"
                       style={{
                         background: 'rgba(239, 68, 68, 0.08)',
                         border: '1px solid color-mix(in srgb, var(--danger, #ef4444) 25%, transparent)',
                       }}>
                    <Icon name="alert" size={16} style={{ color: 'var(--danger, #ef4444)', marginTop: 2 }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-[var(--text-primary)] font-medium text-sm">Couldn't load your schedule</p>
                      <p className="text-[var(--text-muted)] text-xs mt-1 break-words">{scheduleError}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => fetchSchedule()}
                      className="btn btn-secondary text-xs"
                    >
                      Retry
                    </button>
                  </div>
                ) : filteredEntries.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="h-12 w-12 rounded-full mx-auto mb-4 flex items-center justify-center"
                         style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}>
                      <Icon name="calendar" size={22} />
                    </div>
                    <p className="text-[var(--text-primary)] font-medium">No classes scheduled</p>
                    <p className="text-[var(--text-muted)] text-sm mt-1">
                      Your lecturers haven't added classes for this {scheduleView} yet.
                    </p>
                  </div>
                ) : (
                  <>
                    {filteredTodayClasses.length > 0 && (
                      <div className="mb-5 sm:mb-6 rounded-xl p-3 sm:p-4"
                           style={{
                             background: 'var(--accent-soft)',
                             border: '1px solid color-mix(in srgb, var(--accent) 25%, transparent)',
                           }}>
                        <div className="flex items-center gap-2 mb-3">
                          <Icon name="clock" size={14} style={{ color: 'var(--accent)' }} className="shrink-0" />
                          <h3 className="text-sm font-semibold truncate" style={{ color: 'var(--accent)' }}>
                            Today · {filteredTodayClasses.length} class{filteredTodayClasses.length !== 1 ? 'es' : ''}
                          </h3>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {filteredTodayClasses.map((entry: any) => (
                            <div
                              key={entry._id}
                              className="rounded-lg p-3"
                              style={{
                                background: entry.status === 'cancelled' ? 'rgba(239,68,68,0.08)' : 'var(--surface-1)',
                                border: '1px solid ' + (entry.status === 'cancelled' ? 'rgba(239,68,68,0.25)' : 'var(--border-default)'),
                                opacity: entry.status === 'cancelled' ? 0.7 : 1,
                              }}
                            >
                              <div className="flex items-center gap-2 flex-wrap">
                                <h4 className={`font-medium text-sm ${entry.status === 'cancelled' ? 'line-through text-[var(--text-muted)]' : 'text-[var(--text-primary)]'}`}>
                                  {entry.courseCode}
                                </h4>
                                {entry.status === 'cancelled' && <span className="pill pill-danger">Cancelled</span>}
                                {conflictIds.has(entry._id) && entry.status !== 'cancelled' && (
                                  <span className="pill pill-warning">Conflict</span>
                                )}
                              </div>
                              <p className="text-xs mt-0.5 text-[var(--text-secondary)] truncate">{entry.courseName}</p>
                              <p className="text-xs mt-1 text-[var(--text-muted)] tabular-nums">
                                {entry.startTime} – {entry.endTime} · {entry.venue}
                              </p>
                              <p className="text-xs text-[var(--text-muted)]">{entry.lecturerName}</p>
                              {entry.status === 'cancelled' && entry.cancelReason && (
                                <p className="text-xs text-[var(--danger)] mt-1 italic">{entry.cancelReason}</p>
                              )}
                              {entry.announcement && entry.status !== 'cancelled' && (
                                <p className="text-xs mt-1 rounded px-2 py-1"
                                   style={{
                                     background: 'rgba(245,158,11,0.08)',
                                     color: 'var(--warning)',
                                   }}>
                                  {entry.announcement}
                                </p>
                              )}
                              {entry.status !== 'cancelled' && (
                                <div className="flex gap-1.5 mt-2">
                                  <button type="button" onClick={() => exportSingleICS(entry)} className="btn btn-ghost text-[10px] py-0.5 px-2">iCal</button>
                                  <button type="button" onClick={() => openGoogleCalendar(entry)} className="btn btn-ghost text-[10px] py-0.5 px-2">Google</button>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {scheduleView === 'week' ? (
                      <div className="space-y-3">
                        {getStudentWeekDates().map(dateStr => {
                          const dateEntries = filteredGrouped[dateStr] || [];
                          const isToday = dateStr === new Date().toISOString().split('T')[0];
                          return (
                            <div
                              key={dateStr}
                              className="rounded-lg p-3 sm:p-4"
                              style={{
                                background: isToday ? 'var(--accent-soft)' : 'var(--surface-0)',
                                border: '1px solid ' + (isToday ? 'color-mix(in srgb, var(--accent) 30%, transparent)' : 'var(--border-subtle)'),
                              }}
                            >
                              <div className="flex items-center gap-2 mb-3 flex-wrap">
                                <h4 className="font-medium text-sm text-[var(--text-primary)] truncate">
                                  {formatScheduleDateLabel(dateStr)}
                                </h4>
                                {isToday && <span className="pill pill-info shrink-0">Today</span>}
                                <span className="text-[var(--text-muted)] text-xs ml-auto shrink-0">
                                  {dateEntries.length} class{dateEntries.length !== 1 ? 'es' : ''}
                                </span>
                              </div>
                              {dateEntries.length === 0 ? (
                                <p className="text-[var(--text-muted)] text-sm">No classes.</p>
                              ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                                  {dateEntries.map((entry: any) => (
                                    <div
                                      key={entry._id}
                                      className="rounded-lg p-3"
                                      style={{
                                        background: 'var(--surface-1)',
                                        border: '1px solid ' + (entry.status === 'cancelled' ? 'rgba(239,68,68,0.25)' : 'var(--border-default)'),
                                        opacity: entry.status === 'cancelled' ? 0.7 : 1,
                                      }}
                                    >
                                      <div className="flex items-center gap-2 flex-wrap">
                                        <h5 className={`font-medium text-sm ${entry.status === 'cancelled' ? 'line-through text-[var(--text-muted)]' : 'text-[var(--text-primary)]'}`}>
                                          {entry.courseCode}
                                        </h5>
                                        {entry.status === 'cancelled' && <span className="pill pill-danger">Cancelled</span>}
                                        {conflictIds.has(entry._id) && entry.status !== 'cancelled' && <span className="pill pill-warning">Conflict</span>}
                                      </div>
                                      <p className="text-xs text-[var(--text-secondary)] truncate mt-0.5">{entry.courseName}</p>
                                      <p className="text-xs text-[var(--text-muted)] mt-1 tabular-nums">{entry.startTime} – {entry.endTime}</p>
                                      <p className="text-xs text-[var(--text-muted)]">{entry.venue}</p>
                                      <p className="text-xs text-[var(--text-muted)] mt-0.5">{entry.lecturerName}</p>
                                      {entry.status === 'cancelled' && entry.cancelReason && (
                                        <p className="text-xs text-[var(--danger)] mt-1 italic">{entry.cancelReason}</p>
                                      )}
                                      {entry.announcement && entry.status !== 'cancelled' && (
                                        <p className="text-xs mt-1 rounded px-2 py-0.5"
                                           style={{ background: 'rgba(245,158,11,0.08)', color: 'var(--warning)' }}>
                                          {entry.announcement}
                                        </p>
                                      )}
                                      {entry.status !== 'cancelled' && (
                                        <div className="flex gap-1.5 mt-2">
                                          <button type="button" onClick={() => exportSingleICS(entry)} className="btn btn-ghost text-[10px] py-0.5 px-2">iCal</button>
                                          <button type="button" onClick={() => openGoogleCalendar(entry)} className="btn btn-ghost text-[10px] py-0.5 px-2">Google</button>
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {Object.entries(filteredGrouped).sort(([a], [b]) => a.localeCompare(b)).map(([dateStr, entries]) => (
                          <div
                            key={dateStr}
                            className="rounded-lg p-3"
                            style={{
                              background: dateStr === new Date().toISOString().split('T')[0] ? 'var(--accent-soft)' : 'var(--surface-0)',
                              border: '1px solid ' + (dateStr === new Date().toISOString().split('T')[0] ? 'color-mix(in srgb, var(--accent) 30%, transparent)' : 'var(--border-subtle)'),
                            }}
                          >
                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                              <span className="text-[var(--text-primary)] font-medium text-sm">{formatScheduleDateLabel(dateStr)}</span>
                              {dateStr === new Date().toISOString().split('T')[0] && <span className="pill pill-info">Today</span>}
                            </div>
                            <div className="grid grid-cols-1 sm:flex sm:flex-wrap gap-2">
                              {(entries as any[]).map((entry: any) => (
                                <div
                                  key={entry._id}
                                  className="rounded-md px-3 py-2 sm:py-1.5 text-xs flex flex-wrap items-center gap-x-2 gap-y-1 min-w-0"
                                  style={{
                                    background: 'var(--surface-1)',
                                    border: '1px solid ' + (entry.status === 'cancelled' ? 'rgba(239,68,68,0.25)' : 'var(--border-default)'),
                                    opacity: entry.status === 'cancelled' ? 0.7 : 1,
                                  }}
                                >
                                  <span className={`font-medium ${entry.status === 'cancelled' ? 'line-through text-[var(--text-muted)]' : 'text-[var(--text-primary)]'}`}>{entry.courseCode}</span>
                                  <span className="text-[var(--text-muted)] tabular-nums">{entry.startTime}–{entry.endTime}</span>
                                  <span className="text-[var(--text-muted)] truncate max-w-[140px] sm:max-w-none">{entry.venue}</span>
                                  <span className="text-[var(--text-muted)] truncate max-w-[140px] sm:max-w-none hidden sm:inline">{entry.lecturerName}</span>
                                  {entry.status === 'cancelled' && <span className="pill pill-danger">Cancelled</span>}
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          )}

          {/* My Courses Section */}
          {activeSection === 'courses' && (
            <div className="space-y-5">
              {!selectedCourse ? (
                <>
                  <div className="section-card">
                    <h2 className="section-title text-base sm:text-lg">My Courses</h2>
                    <p className="section-subtitle">
                      {courses.length} course{courses.length !== 1 ? 's' : ''} available
                    </p>
                  </div>

                  {loadingCourses ? (
                    <div className="text-center py-16">
                      <div className="animate-spin rounded-full h-10 w-10 border-2 border-[var(--accent)] border-t-transparent mx-auto mb-3" />
                      <p className="text-[var(--text-muted)] text-sm">Loading courses…</p>
                    </div>
                  ) : courses.length === 0 ? (
                    <div className="section-card text-center py-16">
                      <div className="h-12 w-12 rounded-full mx-auto mb-3 flex items-center justify-center"
                           style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}>
                        <Icon name="bookOpen" size={22} />
                      </div>
                      <p className="text-[var(--text-primary)] font-medium">No courses yet</p>
                      <p className="text-[var(--text-muted)] text-sm mt-1">
                        Courses for your department will appear here once added.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {courses.map((c: any) => (
                        <button
                          key={c._id}
                          type="button"
                          onClick={() => setSelectedCourse(c)}
                          className="section-card surface-hover text-left group"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="h-9 w-9 rounded-lg flex items-center justify-center shrink-0"
                                 style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}>
                              <span className="font-semibold text-[11px] tracking-wide">{c.courseCode.slice(0, 3).toUpperCase()}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              {c.pendingAssignments > 0 && (
                                <span className="pill pill-warning">{c.pendingAssignments} due</span>
                              )}
                              <span className="pill">{c.level}</span>
                            </div>
                          </div>
                          <h3 className="text-[var(--text-primary)] font-medium text-sm tracking-tight">{c.courseCode}</h3>
                          <p className="text-[var(--text-secondary)] text-xs mt-0.5 truncate">{c.courseName}</p>
                          {c.description && (
                            <p className="text-[var(--text-muted)] text-xs mt-2 line-clamp-2">{c.description}</p>
                          )}
                          <div className="flex items-center gap-3 mt-3 pt-3 border-t border-[var(--border-subtle)]">
                            {c.credits > 0 && (
                              <span className="text-[var(--text-muted)] text-[11px]">{c.credits} credits</span>
                            )}
                            {c.semester && (
                              <span className="text-[var(--text-muted)] text-[11px]">{c.semester} semester</span>
                            )}
                            <span className="ml-auto flex items-center gap-1 text-[var(--accent)] text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                              View
                              <Icon name="chevronRight" size={12} />
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div className="section-card">
                    <div className="flex items-start gap-3 mb-4">
                      <button
                        type="button"
                        onClick={() => { setSelectedCourse(null); setCourseMaterials([]); }}
                        className="btn btn-ghost p-2 shrink-0 -ml-2"
                        aria-label="Back"
                      >
                        <Icon name="chevronLeft" size={18} />
                      </button>
                      <div className="min-w-0 flex-1">
                        <h2 className="text-[var(--text-primary)] text-lg font-semibold tracking-tight">
                          {selectedCourse.courseCode}
                          <span className="text-[var(--text-muted)] font-normal ml-1.5">· {selectedCourse.courseName}</span>
                        </h2>
                        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                          <span className="pill">{selectedCourse.department}</span>
                          <span className="pill">{selectedCourse.level}</span>
                          {selectedCourse.credits > 0 && <span className="pill">{selectedCourse.credits} credits</span>}
                        </div>
                      </div>
                    </div>
                    {selectedCourse.description && (
                      <p className="text-[var(--text-secondary)] text-sm mb-4">{selectedCourse.description}</p>
                    )}

                    {(() => {
                      const totalMaterials = courseMaterials.length;
                      const totalAssignments = studentAssignments.length;
                      const submittedAssignments = studentAssignments.filter((a: any) => !!a.mySubmission).length;
                      const gradedAssignments = studentAssignments.filter((a: any) => a.mySubmission?.score !== undefined && a.mySubmission?.score !== null).length;
                      const totalItems = totalMaterials + totalAssignments;
                      const weightedTotal = totalMaterials + totalAssignments * 2;
                      const weightedDone = totalMaterials + submittedAssignments + gradedAssignments;
                      const pct = weightedTotal > 0 ? Math.min(100, Math.round((weightedDone / weightedTotal) * 100)) : 0;
                      const trackColor = pct >= 80 ? 'var(--success)' : pct >= 50 ? 'var(--accent)' : 'var(--text-muted)';

                      return totalItems > 0 ? (
                        <div className="mb-4 rounded-xl p-4"
                             style={{ background: 'var(--surface-0)', border: '1px solid var(--border-subtle)' }}>
                          <div className="flex items-center justify-between mb-2">
                            <span className="metric-label">Course progress</span>
                            <span className="text-sm font-semibold tabular-nums" style={{ color: trackColor }}>{pct}%</span>
                          </div>
                          <div className="w-full rounded-full h-1.5 mb-4 overflow-hidden"
                               style={{ background: 'var(--surface-2)' }}>
                            <div className="h-full rounded-full transition-all duration-500"
                                 style={{ width: `${pct}%`, background: trackColor }} />
                          </div>
                          <div className="grid grid-cols-3 gap-2">
                            <div className="rounded-lg py-2 px-3"
                                 style={{ background: 'var(--surface-1)', border: '1px solid var(--border-subtle)' }}>
                              <p className="metric-label">Materials</p>
                              <p className="text-[var(--text-primary)] text-base font-semibold tabular-nums mt-0.5">{totalMaterials}</p>
                            </div>
                            <div className="rounded-lg py-2 px-3"
                                 style={{ background: 'var(--surface-1)', border: '1px solid var(--border-subtle)' }}>
                              <p className="metric-label">Submitted</p>
                              <p className="text-[var(--text-primary)] text-base font-semibold tabular-nums mt-0.5">{submittedAssignments}<span className="text-[var(--text-muted)] text-sm">/{totalAssignments}</span></p>
                            </div>
                            <div className="rounded-lg py-2 px-3"
                                 style={{ background: 'var(--surface-1)', border: '1px solid var(--border-subtle)' }}>
                              <p className="metric-label">Graded</p>
                              <p className="text-[var(--text-primary)] text-base font-semibold tabular-nums mt-0.5">{gradedAssignments}<span className="text-[var(--text-muted)] text-sm">/{totalAssignments}</span></p>
                            </div>
                          </div>
                        </div>
                      ) : null;
                    })()}

                    <div className="flex items-center gap-1 p-1 rounded-lg overflow-x-auto"
                         style={{ background: 'var(--surface-0)', border: '1px solid var(--border-subtle)' }}>
                      {([
                        { id: 'materials', label: 'Materials', icon: 'bookOpen' as const, count: courseMaterials.length },
                        { id: 'announcements', label: 'Announcements', icon: 'megaphone' as const, count: studentAnnouncements.length },
                        { id: 'assignments', label: 'Assignments', icon: 'edit' as const, count: studentAssignments.length },
                        { id: 'quizzes', label: 'Quizzes', icon: 'award' as const, count: studentQuizzes.length },
                      ] as const).map(tab => {
                        const active = studentCourseTab === tab.id;
                        return (
                          <button
                            key={tab.id}
                            type="button"
                            onClick={() => setStudentCourseTab(tab.id)}
                            className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${
                              active ? 'text-[var(--text-primary)]' : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
                            }`}
                            style={active ? { background: 'var(--accent)', color: 'white' } : undefined}
                          >
                            <Icon name={tab.icon} size={14} />
                            <span>{tab.label}</span>
                            {tab.count > 0 && (
                              <span className={`text-[10px] tabular-nums ${active ? 'text-white/80' : 'text-[var(--text-muted)]'}`}>
                                {tab.count}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {studentCourseTab === 'materials' && (
                    <>
                      {courseMaterials.length > 0 && (
                        <div className="section-card py-3">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <button
                              type="button"
                              onClick={() => setMaterialCategory('all')}
                              className={materialCategory === 'all' ? 'pill pill-info' : 'pill'}
                            >
                              All
                            </button>
                            {Array.from(new Set(courseMaterials.map((m: any) => m.category))).map((cat: string) => (
                              <button
                                key={cat}
                                type="button"
                                onClick={() => setMaterialCategory(cat)}
                                className={materialCategory === cat ? 'pill pill-info' : 'pill'}
                              >
                                {cat}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {loadingMaterials ? (
                        <div className="text-center py-12">
                          <div className="animate-spin rounded-full h-10 w-10 border-2 border-[var(--accent)] border-t-transparent mx-auto mb-3" />
                          <p className="text-[var(--text-muted)] text-sm">Loading materials…</p>
                        </div>
                      ) : courseMaterials.length === 0 ? (
                        <div className="section-card text-center py-12">
                          <div className="h-12 w-12 rounded-full mx-auto mb-3 flex items-center justify-center"
                               style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}>
                            <Icon name="bookOpen" size={22} />
                          </div>
                          <p className="text-[var(--text-primary)] font-medium">No materials yet</p>
                          <p className="text-[var(--text-muted)] text-sm mt-1">
                            Your lecturer hasn't uploaded any materials yet.
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {courseMaterials
                            .filter((m: any) => materialCategory === 'all' || m.category === materialCategory)
                            .map((m: any) => {
                              const isNew = (Date.now() - new Date(m.createdAt).getTime()) < 3 * 24 * 60 * 60 * 1000;
                              const ext = m.fileType?.includes('pdf')
                                ? 'PDF'
                                : m.fileType?.includes('image')
                                ? 'IMG'
                                : m.fileType?.includes('word') || m.fileType?.includes('document')
                                ? 'DOC'
                                : m.fileType?.includes('presentation') || m.fileType?.includes('powerpoint')
                                ? 'PPT'
                                : 'FILE';
                              return (
                                <div
                                  key={m._id}
                                  className="surface surface-hover p-4 flex items-center gap-4"
                                >
                                  <div className="h-10 w-10 rounded-lg flex items-center justify-center shrink-0 text-[10px] font-bold tracking-wider"
                                       style={{ background: 'var(--surface-2)', color: 'var(--text-secondary)' }}>
                                    {ext}
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <h4 className="text-[var(--text-primary)] font-medium text-sm truncate">{m.title}</h4>
                                      {isNew && <span className="pill pill-success">New</span>}
                                    </div>
                                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                                      <span className="pill pill-info">{m.category}</span>
                                      <span className="text-[var(--text-muted)] text-[11px]">{m.fileName}</span>
                                      {m.fileSize > 0 && (
                                        <span className="text-[var(--text-muted)] text-[11px]">
                                          {m.fileSize > 1048576
                                            ? `${(m.fileSize / 1048576).toFixed(1)} MB`
                                            : `${Math.round(m.fileSize / 1024)} KB`}
                                        </span>
                                      )}
                                      <span className="text-[var(--text-muted)] text-[11px]">
                                        {m.downloads} download{m.downloads !== 1 ? 's' : ''}
                                      </span>
                                    </div>
                                    {m.description && (
                                      <p className="text-xs text-[var(--text-muted)] mt-1 truncate">{m.description}</p>
                                    )}
                                    <p className="text-[10px] text-[var(--text-faint)] mt-1">
                                      Uploaded by {m.lecturerName} · {new Date(m.createdAt).toLocaleDateString()}
                                    </p>
                                  </div>
                                  <div className="flex gap-1 shrink-0">
                                    {m.fileType?.includes('pdf') && (
                                      <button
                                        type="button"
                                        onClick={() => openPreview(m)}
                                        className="btn btn-ghost p-2"
                                        title="Preview PDF"
                                      >
                                        <Icon name="search" size={16} />
                                      </button>
                                    )}
                                    <button
                                      type="button"
                                      onClick={() => downloadMaterial(m._id, m.fileName)}
                                      className="btn btn-secondary p-2"
                                      title="Download"
                                    >
                                      <Icon name="download" size={16} />
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                        </div>
                      )}
                    </>
                  )}

                  {studentCourseTab === 'announcements' && (
                    <div className="space-y-2">
                      {studentAnnouncements.length === 0 ? (
                        <div className="section-card text-center py-12">
                          <div className="h-12 w-12 rounded-full mx-auto mb-3 flex items-center justify-center"
                               style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}>
                            <Icon name="megaphone" size={22} />
                          </div>
                          <p className="text-[var(--text-primary)] font-medium">No announcements</p>
                          <p className="text-[var(--text-muted)] text-sm mt-1">No updates posted for this course yet.</p>
                        </div>
                      ) : (
                        studentAnnouncements.map((a: any) => (
                          <div key={a._id} className="surface p-4">
                            <p className="text-[var(--text-primary)] text-sm">{a.message}</p>
                            <p className="text-[10px] text-[var(--text-muted)] mt-2">
                              {a.lecturerName} · {new Date(a.createdAt).toLocaleString()}
                            </p>
                          </div>
                        ))
                      )}
                    </div>
                  )}

                  {/* Assignments Tab */}
                  {studentCourseTab === 'assignments' && (
                    <div className="space-y-3">
                      {/* Submit Modal */}
                      {submittingAssignment && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                          <div className={`bg-slate-800 rounded-2xl p-6 w-full border border-slate-700/80 shadow-2xl ${submitMode === 'write' ? 'max-w-2xl max-h-[90vh] overflow-y-auto' : 'max-w-md'}`}>
                            <div className="flex items-center justify-between mb-4">
                              <div>
                                <h3 className="text-lg font-bold text-white flex items-center gap-2">📤 Submit Assignment</h3>
                                <p className="text-slate-400 text-xs mt-0.5">{submittingAssignment.title}</p>
                              </div>
                              <button onClick={() => { setSubmittingAssignment(null); setSubmitFile({ fileName: '', fileData: '', fileType: '', fileSize: 0, comment: '' }); setRichTextContent(''); setSubmitMode('file'); setFileLoading(false); setFileLoadProgress(0); }} className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-700/50">
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                              </button>
                            </div>

                            {/* Mode Toggle */}
                            <div className="flex bg-slate-700/50 rounded-lg p-1 mb-4">
                              <button onClick={() => setSubmitMode('file')} className={`flex-1 py-2 rounded-md text-xs font-medium transition-all flex items-center justify-center gap-1.5 ${submitMode === 'file' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}>
                                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" /></svg>
                                Upload File
                              </button>
                              <button onClick={() => setSubmitMode('write')} className={`flex-1 py-2 rounded-md text-xs font-medium transition-all flex items-center justify-center gap-1.5 ${submitMode === 'write' ? 'bg-purple-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}>
                                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" /></svg>
                                Write Answer
                              </button>
                            </div>

                            <div className="space-y-4">
                              {submitMode === 'file' ? (
                                <>
                                  {/* File Upload Area */}
                                  <div>
                                    <label className="block text-xs font-medium text-slate-400 mb-2 uppercase tracking-wider">File</label>
                                    {!submitFile.fileData && !fileLoading ? (
                                      <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-600/50 rounded-xl cursor-pointer hover:border-blue-500/50 hover:bg-slate-700/20 transition-all group">
                                        <div className="flex flex-col items-center justify-center py-4">
                                          <svg className="h-8 w-8 text-slate-500 group-hover:text-blue-400 transition-colors mb-2" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" /></svg>
                                          <p className="text-sm text-slate-400 group-hover:text-slate-300">Click to choose a file</p>
                                          <p className="text-[10px] text-slate-500 mt-1">PDF, DOCX, TXT, or any document</p>
                                        </div>
                                        <input type="file" onChange={handleSubmitFileSelect} className="hidden" />
                                      </label>
                                    ) : fileLoading ? (
                                      <div className="bg-slate-700/30 rounded-xl border border-slate-600/30 p-4">
                                        <div className="flex items-center gap-3 mb-3">
                                          <div className="h-10 w-10 bg-blue-600/20 rounded-lg flex items-center justify-center flex-shrink-0">
                                            <svg className="h-5 w-5 text-blue-400 animate-pulse" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>
                                          </div>
                                          <div className="min-w-0 flex-1">
                                            <p className="text-white text-sm font-medium truncate">{submitFile.fileName}</p>
                                            <p className="text-slate-500 text-xs">Loading file...</p>
                                          </div>
                                          <span className="text-blue-400 text-xs font-bold">{fileLoadProgress}%</span>
                                        </div>
                                        <div className="w-full bg-slate-600/40 rounded-full h-2 overflow-hidden">
                                          <div className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300 ease-out" style={{ width: `${fileLoadProgress}%` }}></div>
                                        </div>
                                      </div>
                                    ) : (
                                      <div className="bg-green-900/10 rounded-xl border border-green-600/20 p-4">
                                        <div className="flex items-center gap-3">
                                          <div className="h-10 w-10 bg-green-600/20 rounded-lg flex items-center justify-center flex-shrink-0">
                                            <svg className="h-5 w-5 text-green-400" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                          </div>
                                          <div className="min-w-0 flex-1">
                                            <p className="text-white text-sm font-medium truncate">{submitFile.fileName}</p>
                                            <p className="text-slate-500 text-xs">{(submitFile.fileSize / 1024).toFixed(1)} KB • Ready to submit</p>
                                          </div>
                                          <button onClick={() => { setSubmitFile(prev => ({ ...prev, fileName: '', fileData: '', fileType: '', fileSize: 0 })); setFileLoadProgress(0); }} className="text-slate-400 hover:text-red-400 p-1.5 rounded-lg hover:bg-red-500/10 transition-colors" title="Remove file">
                                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>
                                          </button>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </>
                              ) : (
                                <>
                                  {/* Rich Text Editor */}
                                  <div>
                                    <label className="block text-xs font-medium text-slate-400 mb-2 uppercase tracking-wider">Your Answer</label>
                                    <p className="text-[10px] text-slate-500 mb-2">Use the toolbar to format text, add images, diagrams, code blocks, and more.</p>
                                    <RichTextEditor value={richTextContent} onChange={setRichTextContent} placeholder="Type your assignment answer here... You can add images, format text, and more." />
                                  </div>
                                </>
                              )}

                              <div>
                                <label className="block text-xs font-medium text-slate-400 mb-2 uppercase tracking-wider">Comment (optional)</label>
                                <textarea value={submitFile.comment} onChange={(e) => setSubmitFile(p => ({...p, comment: e.target.value}))} placeholder="Any notes about your submission..." className="w-full px-3 py-2.5 bg-slate-700/70 border border-slate-600/50 rounded-lg text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none transition-all" rows={2} />
                              </div>
                              <div className="flex gap-3 pt-1">
                                <button onClick={() => { setSubmittingAssignment(null); setSubmitFile({ fileName: '', fileData: '', fileType: '', fileSize: 0, comment: '' }); setRichTextContent(''); setSubmitMode('file'); setFileLoading(false); setFileLoadProgress(0); }} className="flex-1 border border-slate-600/50 text-slate-300 py-2.5 rounded-lg hover:bg-slate-700/50 text-sm transition-colors">Cancel</button>
                                <button onClick={handleSubmitAssignment} disabled={(submitMode === 'file' ? (!submitFile.fileData || fileLoading) : (!richTextContent || richTextContent === '<p><br></p>')) || submitting} className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2.5 rounded-lg text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all shadow-lg hover:from-blue-500 hover:to-purple-500">
                                  {submitting ? <><svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>Submitting...</> : <><svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" /></svg>Submit</>}
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Submission Receipt Modal */}
                      {submissionReceipt && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                          <div className="bg-slate-800 rounded-2xl p-6 max-w-sm w-full border border-slate-700/80 shadow-2xl">
                            <div className="text-center mb-5">
                              <div className="h-14 w-14 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                                <svg className="h-7 w-7 text-green-400" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                              </div>
                              <h3 className="text-lg font-bold text-white">Assignment Submitted!</h3>
                              <p className="text-slate-400 text-xs mt-1">Your submission has been recorded</p>
                            </div>
                            <div className="bg-slate-700/30 rounded-xl border border-slate-600/20 p-4 space-y-3">
                              <div className="flex justify-between items-start">
                                <span className="text-[11px] text-slate-500 uppercase tracking-wider">Receipt ID</span>
                                <span className="text-xs text-white font-mono">{submissionReceipt.receiptId}</span>
                              </div>
                              <div className="border-t border-slate-600/20"></div>
                              <div className="flex justify-between items-start">
                                <span className="text-[11px] text-slate-500 uppercase tracking-wider">Course</span>
                                <span className="text-xs text-white text-right">{submissionReceipt.courseCode}</span>
                              </div>
                              <div className="flex justify-between items-start">
                                <span className="text-[11px] text-slate-500 uppercase tracking-wider">Assignment</span>
                                <span className="text-xs text-white text-right max-w-[180px] truncate">{submissionReceipt.assignmentTitle}</span>
                              </div>
                              <div className="flex justify-between items-start">
                                <span className="text-[11px] text-slate-500 uppercase tracking-wider">File</span>
                                <span className="text-xs text-slate-300 text-right max-w-[180px] truncate">{submissionReceipt.fileName}</span>
                              </div>
                              <div className="flex justify-between items-start">
                                <span className="text-[11px] text-slate-500 uppercase tracking-wider">Size</span>
                                <span className="text-xs text-slate-300">{(submissionReceipt.fileSize / 1024).toFixed(1)} KB</span>
                              </div>
                              <div className="border-t border-slate-600/20"></div>
                              <div className="flex justify-between items-start">
                                <span className="text-[11px] text-slate-500 uppercase tracking-wider">Submitted</span>
                                <span className="text-xs text-green-400 font-medium">{new Date(submissionReceipt.submittedAt).toLocaleString()}</span>
                              </div>
                            </div>
                            <p className="text-[10px] text-slate-500 text-center mt-3">Save this receipt as proof of submission</p>
                            <button onClick={() => setSubmissionReceipt(null)} className="w-full mt-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2.5 rounded-lg text-sm font-medium hover:from-blue-500 hover:to-purple-500 transition-all">Done</button>
                          </div>
                        </div>
                      )}

                      {studentAssignments.length === 0 ? (
                        <div className="bg-slate-800/30 rounded-2xl border border-slate-700/30 text-center py-10 px-6">
                          <span className="text-3xl">📝</span>
                          <p className="text-slate-400 text-sm mt-2">No assignments for this course</p>
                        </div>
                      ) : (
                        studentAssignments.map((a: any) => {
                          const isPast = new Date() > new Date(a.deadline);
                          const totalMs = new Date(a.deadline).getTime() - Date.now();
                          const daysLeft = Math.ceil(totalMs / (1000 * 60 * 60 * 24));
                          const hoursLeft = Math.floor(totalMs / (1000 * 60 * 60));
                          const minsLeft = Math.floor(totalMs / (1000 * 60));
                          const hasSubmitted = !!a.mySubmission;

                          // Time remaining label
                          const timeLabel = isPast ? 'Closed' : minsLeft < 60 ? `${minsLeft}m left` : hoursLeft < 24 ? `${hoursLeft}h left` : `${daysLeft}d left`;
                          // Urgency level
                          const urgency = isPast ? 'past' : hoursLeft < 6 ? 'critical' : hoursLeft < 24 ? 'urgent' : daysLeft <= 3 ? 'soon' : 'normal';
                          // Progress: how much time has passed since creation (approximate with 14 days total)
                          const createdMs = a.createdAt ? new Date(a.createdAt).getTime() : Date.now() - 14 * 86400000;
                          const totalDuration = new Date(a.deadline).getTime() - createdMs;
                          const elapsed = Date.now() - createdMs;
                          const progressPct = isPast ? 100 : Math.min(100, Math.max(0, Math.round((elapsed / totalDuration) * 100)));

                          return (
                            <div key={a._id} className={`bg-slate-800/40 rounded-xl border p-4 transition-all ${hasSubmitted ? 'border-green-500/25' : isPast ? 'border-red-500/20 opacity-70' : urgency === 'critical' ? 'border-red-500/40' : urgency === 'urgent' ? 'border-orange-500/30' : 'border-slate-700/30'}`}>
                              <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <h4 className="text-white font-medium text-sm">{a.title}</h4>
                                    {hasSubmitted ? (
                                      <span className="text-[10px] bg-green-600/25 text-green-300 px-2 py-0.5 rounded-full">✓ Submitted</span>
                                    ) : isPast ? (
                                      <span className="text-[10px] bg-red-600/25 text-red-300 px-2 py-0.5 rounded-full">Missed</span>
                                    ) : null}
                                  </div>
                                  {a.description && <p className="text-slate-400 text-xs mt-1">{a.description}</p>}

                                  {/* Countdown Bar */}
                                  {!hasSubmitted && !isPast && (
                                    <div className="mt-2.5">
                                      <div className="flex items-center justify-between mb-1">
                                        <span className={`text-[11px] font-semibold flex items-center gap-1 ${urgency === 'critical' ? 'text-red-400' : urgency === 'urgent' ? 'text-orange-400' : urgency === 'soon' ? 'text-yellow-400' : 'text-blue-400'}`}>
                                          {urgency === 'critical' && <span className="inline-block h-1.5 w-1.5 rounded-full bg-red-400 animate-ping"></span>}
                                          {urgency === 'urgent' && <span className="inline-block h-1.5 w-1.5 rounded-full bg-orange-400 animate-pulse"></span>}
                                          ⏳ {timeLabel}
                                        </span>
                                        <span className="text-[10px] text-slate-500">{progressPct}% elapsed</span>
                                      </div>
                                      <div className="w-full bg-slate-700/50 rounded-full h-1.5 overflow-hidden">
                                        <div className={`h-1.5 rounded-full transition-all duration-500 ${urgency === 'critical' ? 'bg-red-500' : urgency === 'urgent' ? 'bg-orange-500' : urgency === 'soon' ? 'bg-yellow-500' : 'bg-blue-500'}`} style={{ width: `${progressPct}%` }}></div>
                                      </div>
                                    </div>
                                  )}

                                  <p className="text-[11px] text-slate-500 mt-2">Deadline: {new Date(a.deadline).toLocaleString()} • {a.lecturerName}</p>
                                  {hasSubmitted && (
                                    <div className="mt-2 bg-green-900/10 rounded-lg p-2 border border-green-600/15">
                                      <div className="flex items-center gap-2">
                                        <svg className="h-3.5 w-3.5 text-green-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                        <span className="text-[10px] text-green-400/80">{a.mySubmission.fileName} • {new Date(a.mySubmission.submittedAt).toLocaleString()}</span>
                                      </div>
                                    </div>
                                  )}
                                  {hasSubmitted && a.mySubmission.score !== undefined && a.mySubmission.score !== null && (
                                    <div className="mt-2 bg-slate-700/30 rounded-lg p-2.5 border border-slate-600/20">
                                      <div className="flex items-center gap-2">
                                        <span className="text-xs text-slate-400">Grade:</span>
                                        <span className={`text-sm font-bold ${(a.mySubmission.score / (a.mySubmission.maxScore || 100)) >= 0.7 ? 'text-green-400' : (a.mySubmission.score / (a.mySubmission.maxScore || 100)) >= 0.5 ? 'text-yellow-400' : 'text-red-400'}`}>{a.mySubmission.score}/{a.mySubmission.maxScore || 100}</span>
                                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${(a.mySubmission.score / (a.mySubmission.maxScore || 100)) >= 0.7 ? 'bg-green-600/20 text-green-300' : (a.mySubmission.score / (a.mySubmission.maxScore || 100)) >= 0.5 ? 'bg-yellow-600/20 text-yellow-300' : 'bg-red-600/20 text-red-300'}`}>{Math.round((a.mySubmission.score / (a.mySubmission.maxScore || 100)) * 100)}%</span>
                                      </div>
                                      {a.mySubmission.feedback && <p className="text-xs text-slate-400 mt-1.5 italic">💬 {a.mySubmission.feedback}</p>}
                                    </div>
                                  )}
                                </div>
                                {!isPast && (
                                  <button onClick={() => setSubmittingAssignment(a)} className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${hasSubmitted ? 'bg-slate-700/50 text-slate-300 hover:bg-slate-600/50' : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'}`}>
                                    {hasSubmitted ? 'Resubmit' : 'Submit'}
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  )}

                  {/* Quizzes Tab */}
                  {studentCourseTab === 'quizzes' && (
                    <div className="space-y-3">
                      {studentQuizzes.length === 0 ? (
                        <div className="bg-slate-800/30 rounded-2xl border border-slate-700/30 text-center py-10 px-6">
                          <span className="text-3xl">🧠</span>
                          <p className="text-slate-400 text-sm mt-2">No quizzes for this course</p>
                        </div>
                      ) : (
                        studentQuizzes.map((q: any) => {
                          const isAvailable = (!q.startDate || new Date() >= new Date(q.startDate)) && (!q.endDate || new Date() <= new Date(q.endDate));
                          const hasAttempted = !!q.myAttempt?.submittedAt;
                          const isInProgress = q.myAttempt && !q.myAttempt.submittedAt;
                          return (
                            <div key={q._id} className={`bg-slate-800/40 rounded-xl border p-4 transition-all ${hasAttempted ? 'border-green-500/25' : !isAvailable ? 'border-slate-700/20 opacity-60' : 'border-purple-500/25'}`}>
                              <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <h4 className="text-white font-medium text-sm">{q.title}</h4>
                                    {hasAttempted ? (
                                      <span className="text-[10px] bg-green-600/25 text-green-300 px-2 py-0.5 rounded-full">✓ Completed</span>
                                    ) : isInProgress ? (
                                      <span className="text-[10px] bg-yellow-600/25 text-yellow-300 px-2 py-0.5 rounded-full animate-pulse">In Progress</span>
                                    ) : !isAvailable ? (
                                      <span className="text-[10px] bg-slate-600/25 text-slate-400 px-2 py-0.5 rounded-full">Closed</span>
                                    ) : (
                                      <span className="text-[10px] bg-purple-600/25 text-purple-300 px-2 py-0.5 rounded-full">Available</span>
                                    )}
                                    <span className="text-[10px] bg-slate-600/20 text-slate-400 px-2 py-0.5 rounded-full">{q.questionCount} Q • ⏱ {q.timeLimit}min</span>
                                  </div>
                                  {q.description && <p className="text-slate-400 text-xs mt-1">{q.description}</p>}
                                  {q.endDate && <p className="text-[11px] text-slate-500 mt-1">Ends: {new Date(q.endDate).toLocaleString()}</p>}
                                  {hasAttempted && q.myAttempt && q.settings?.releaseResults && (
                                    <div className="mt-2 bg-slate-700/30 rounded-lg p-2.5 border border-slate-600/20">
                                      <div className="flex items-center gap-2">
                                        <span className="text-xs text-slate-400">Score:</span>
                                        <span className={`text-sm font-bold ${(q.myAttempt.percentage || 0) >= 70 ? 'text-green-400' : (q.myAttempt.percentage || 0) >= 50 ? 'text-yellow-400' : 'text-red-400'}`}>{q.myAttempt.score}/{q.myAttempt.totalPoints} ({q.myAttempt.percentage}%)</span>
                                      </div>
                                    </div>
                                  )}
                                  {hasAttempted && !q.settings?.releaseResults && (
                                    <p className="text-[10px] text-slate-500 mt-2 italic">Results not yet released by lecturer</p>
                                  )}
                                </div>
                                {(isAvailable && !hasAttempted) && (
                                  <button onClick={() => setTakingQuiz(q._id)} className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-lg text-xs font-medium hover:from-purple-500 hover:to-pink-500 transition-all flex-shrink-0">
                                    {isInProgress ? 'Continue' : 'Start Quiz'}
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* Quiz Taker Overlay */}
          {takingQuiz && (
            <QuizTaker quizId={takingQuiz} onComplete={() => { if (selectedCourse) fetchStudentQuizzes(selectedCourse._id); }} onExit={() => setTakingQuiz(null)} />
          )}

          {/* PDF Preview Modal */}
          {previewMaterial && (
            <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 bg-slate-900/90 border-b border-slate-700/50">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <span className="text-xl">📕</span>
                  <div className="min-w-0">
                    <h3 className="text-white font-semibold text-sm truncate">{previewMaterial.title}</h3>
                    <p className="text-slate-400 text-xs truncate">{previewMaterial.fileName} • {previewMaterial.courseCode}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button onClick={() => downloadMaterial(previewMaterial._id, previewMaterial.fileName)} className="text-blue-400 hover:text-blue-300 px-3 py-1.5 rounded-lg hover:bg-blue-500/10 transition-colors text-xs flex items-center gap-1.5">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" /></svg>
                    Download
                  </button>
                  <button onClick={() => { if (previewData.startsWith('blob:')) URL.revokeObjectURL(previewData); setPreviewMaterial(null); setPreviewData(''); }} className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-700/50 transition-colors">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>
              </div>
              {/* PDF Content */}
              <div className="flex-1 overflow-hidden">
                {previewLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-10 w-10 border-2 border-purple-500 border-t-transparent mx-auto mb-4"></div>
                      <p className="text-slate-400 text-sm">Loading preview...</p>
                    </div>
                  </div>
                ) : previewData ? (
                  <iframe src={previewData} className="w-full h-full border-0" title="PDF Preview" />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-slate-400 text-sm">Failed to load preview</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Other sections placeholder */}
          {activeSection !== 'dashboard' && activeSection !== 'qr-code' && activeSection !== 'attendance' && activeSection !== 'profile' && activeSection !== 'payments' && activeSection !== 'schedule' && activeSection !== 'courses' && activeSection !== 'grades' && (
            <div className="section-card text-center py-12">
              <div className="h-12 w-12 rounded-full mx-auto mb-4 flex items-center justify-center"
                   style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}>
                <Icon name={menuItems.find(item => item.id === activeSection)?.icon ?? 'dashboard'} size={22} />
              </div>
              <h2 className="text-[var(--text-primary)] text-lg font-semibold capitalize">
                {activeSection.replace('-', ' ')}
              </h2>
              <p className="text-[var(--text-muted)] text-sm mt-1">Coming soon.</p>
            </div>
          )}

          {/* QR Code Section */}
          {activeSection === 'qr-code' && (
            <StudentQRDisplay className="max-w-2xl mx-auto" />
          )}

          {/* Attendance Section */}
          {activeSection === 'attendance' && (
            <AttendanceHistory />
          )}

          {/* Profile Section */}
          {activeSection === 'profile' && (
            <StudentProfilePage onProfileUpdate={fetchStudentProfile} />
          )}

          {/* Grades Section */}
          {activeSection === 'grades' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-[var(--text-primary)] text-2xl font-semibold tracking-tight">My Grades</h2>
                <p className="text-[var(--text-muted)] text-sm mt-1">
                  Auto-calculated from your graded coursework. Updates as lecturers post results.
                </p>
              </div>

              {/* CGPA summary */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="section-card">
                  <p className="metric-label">Cumulative GPA</p>
                  <p className="metric-value mt-2">
                    {loadingGpa && !gpaData ? '…' : (gpaData?.cgpa != null ? gpaData.cgpa.toFixed(2) : '—')}
                  </p>
                  <div className="mt-1.5 flex items-center gap-2 text-xs">
                    {gpaData?.cgpa != null && gpaData?.label && (
                      <span className="metric-delta metric-delta-up">
                        <Icon name="trendingUp" size={12} />
                        {gpaData.label}
                      </span>
                    )}
                    <span className="text-[var(--text-muted)]">of {(gpaData?.scaleMax ?? 5).toFixed(1)}</span>
                  </div>
                </div>
                <div className="section-card">
                  <p className="metric-label">Credits Earned</p>
                  <p className="metric-value mt-2">{gpaData?.creditsEarned ?? 0}</p>
                  <p className="mt-1.5 text-xs text-[var(--text-muted)]">
                    {gpaData?.totalCredits ? `of ${gpaData.totalCredits} total` : 'graded so far'}
                  </p>
                </div>
                <div className="section-card">
                  <p className="metric-label">Courses Completed</p>
                  <p className="metric-value mt-2">{gpaData?.completed?.length ?? 0}</p>
                  <p className="mt-1.5 text-xs text-[var(--text-muted)]">
                    {gpaData?.inProgress?.length ? `${gpaData.inProgress.length} in progress` : 'all caught up'}
                  </p>
                </div>
              </div>

              {/* Completed courses */}
              <div className="section-card">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="section-title">Graded courses</h3>
                    <p className="section-subtitle">Courses where every assessment is graded</p>
                  </div>
                  <span className="flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
                    <span className="h-1.5 w-1.5 rounded-full bg-[var(--success)] animate-pulse"></span>
                    Live
                  </span>
                </div>

                {loadingGpa && !gpaData ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-2 border-[var(--accent)] border-t-transparent mx-auto mb-2"></div>
                    <p className="text-[var(--text-muted)] text-xs">Loading grades…</p>
                  </div>
                ) : !gpaData?.completed?.length ? (
                  <div className="text-center py-8">
                    <div className="h-12 w-12 rounded-full mx-auto mb-3 flex items-center justify-center"
                         style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}>
                      <Icon name="award" size={22} />
                    </div>
                    <p className="text-[var(--text-primary)] text-sm font-medium">No graded courses yet</p>
                    <p className="text-[var(--text-muted)] text-xs mt-1">
                      Your GPA appears here once a course has all its assessments graded.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {gpaData.completed.map((co: any, idx: number) => {
                      const ratio = (gpaData?.scaleMax ?? 5) > 0 ? co.point / (gpaData.scaleMax ?? 5) : 0;
                      const accent = ratio >= 0.8 ? 'var(--success)' : ratio >= 0.5 ? 'var(--info)' : 'var(--warning)';
                      return (
                        <div key={idx} className="flex items-center justify-between gap-3 p-3 sm:p-4 rounded-lg"
                             style={{ background: 'var(--surface-2, rgba(148,163,184,0.06))' }}>
                          <div className="min-w-0 flex-1">
                            <p className="text-[var(--text-primary)] font-medium text-sm sm:text-base truncate">
                              {co.courseCode} — {co.courseName}
                            </p>
                            <p className="text-[var(--text-muted)] text-xs sm:text-sm">
                              {co.credits} credit{co.credits === 1 ? '' : 's'} · {co.percentage}% · {co.point} grade point{co.point === 1 ? '' : 's'}
                            </p>
                          </div>
                          <span className="px-3 py-1 rounded-full text-sm font-semibold whitespace-nowrap"
                                style={{ background: `color-mix(in srgb, ${accent} 16%, transparent)`, color: accent }}>
                            {co.letter}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* In-progress courses */}
              {gpaData?.inProgress?.length > 0 && (
                <div className="section-card">
                  <div className="mb-4">
                    <h3 className="section-title">In progress</h3>
                    <p className="section-subtitle">Not counted in your GPA until fully graded</p>
                  </div>
                  <div className="space-y-3">
                    {gpaData.inProgress.map((co: any, idx: number) => (
                      <div key={idx} className="flex items-center justify-between gap-3 p-3 sm:p-4 rounded-lg"
                           style={{ background: 'var(--surface-2, rgba(148,163,184,0.06))' }}>
                        <div className="min-w-0 flex-1">
                          <p className="text-[var(--text-primary)] font-medium text-sm sm:text-base truncate">
                            {co.courseCode} — {co.courseName}
                          </p>
                          <p className="text-[var(--text-muted)] text-xs sm:text-sm">
                            {co.total > 0 ? `${co.graded} of ${co.total} graded` : co.reason} · {co.credits} credit{co.credits === 1 ? '' : 's'}
                          </p>
                        </div>
                        <span className="px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap"
                              style={{ background: 'color-mix(in srgb, var(--warning) 16%, transparent)', color: 'var(--warning)' }}>
                          {co.reason}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <p className="text-[var(--text-muted)] text-xs text-center">
                GPA is computed automatically — no one uploads it. It uses your institution&apos;s grading scale and course credit units.
              </p>
            </div>
          )}

          {/* Payments Section */}
          {activeSection === 'payments' && (
            <PaymentsSection
              onBalanceChange={setWalletBalance}
              profile={
                studentData
                  ? {
                      firstName: studentData.profile.firstName,
                      lastName: studentData.profile.lastName,
                      phone: (studentData.profile as { phone?: string }).phone,
                    }
                  : undefined
              }
            />
          )}
      </>
    </DashboardShell>
  );
}
