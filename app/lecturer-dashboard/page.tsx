"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { DashboardShell, Icon, StatCard, type NavItem } from "@/components/dashboard";
import QRScannerNew from "@/components/qr/QRScannerNew";
import AttendanceHistory from "@/components/qr/AttendanceHistory";
import { AttendanceManagement } from "@/components/attendance";
import { LecturerGradebook } from "@/components/grades";
import { LecturerReports } from "@/components/reports";
import { getApiUrl } from "@/lib/config";
import { validateScheduleNotInPast, validateScheduleTimeRange } from "@/lib/scheduleTime";

// API Response Types
interface LecturerProfile {
  id: string;
  email: string;
  userType: string;
  status: string;
  profile: {
    firstName: string;
    lastName: string;
    lecturerId: string;
    department: string;
    role: string;
    specialization: string;
    avatar: string;
    universityName: string;
  };
}

interface Course {
  id: number;
  name: string;
  code: string;
  semester: string;
  students: number;
  schedule: string;
  room: string;
  nextClass: string;
  attendance: number;
  assignments: number;
  weeklySchedule: {
    day: string;
    time: string;
    topic: string;
  }[];
  description: string;
}

interface ScannedStudent {
  id: number;
  name: string;
  studentId: string;
  time: string;
}

interface Student {
  id: string;
  email: string;
  status: string;
  emailVerified: boolean;
  profile: {
    firstName: string;
    lastName: string;
    studentId: string;
    department: string;
    year: string;
    avatar?: string;
    phone?: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface StudentsData {
  department: string;
  totalStudents: number;
  students?: Student[];
  groupedByLevel?: Record<string, Student[]>;
  levels: string[];
}

export default function LecturerDashboard() {
  const router = useRouter();
  const [activeSection, setActiveSection] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [selectedClass, setSelectedClass] = useState<Course | null>(null);
  const [showQRCode, setShowQRCode] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scannedStudents, setScannedStudents] = useState<ScannedStudent[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [searchStudentId, setSearchStudentId] = useState<string>('');
  
  // Student records states
  const [studentsData, setStudentsData] = useState<StudentsData | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<string>('');
  const [studentSearch, setStudentSearch] = useState<string>('');
  const [loadingStudents, setLoadingStudents] = useState(false);

  // Schedule states
  const [scheduleEntries, setScheduleEntries] = useState<any[]>([]);
  const [scheduleGrouped, setScheduleGrouped] = useState<Record<string, any[]>>({});
  const [scheduleTodayClasses, setScheduleTodayClasses] = useState<any[]>([]);
  const [loadingSchedule, setLoadingSchedule] = useState(false);
  const [scheduleLoaded, setScheduleLoaded] = useState(false);
  const [showAddSchedule, setShowAddSchedule] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<any>(null);
  const [scheduleView, setScheduleView] = useState<'week' | 'month'>('week');
  const [scheduleDate, setScheduleDate] = useState(new Date().toISOString().split('T')[0]);
  const [scheduleMode, setScheduleMode] = useState<'single' | 'recurring'>('single');
  const [scheduleForm, setScheduleForm] = useState({
    courseId: '', courseCode: '', courseName: '', date: new Date().toISOString().split('T')[0], startTime: '', endTime: '', venue: '', level: '100L',
    recurringDay: 'Monday', recurringStart: '', recurringEnd: ''
  });
  // Courses assigned to this lecturer — the only ones they may schedule.
  const [assignedCourses, setAssignedCourses] = useState<any[]>([]);
  const [loadingAssignedCourses, setLoadingAssignedCourses] = useState(false);
  const [scheduleError, setScheduleError] = useState('');
  const [scheduleSuccess, setScheduleSuccess] = useState('');
  const [cancellingSchedule, setCancellingSchedule] = useState<any>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [scheduleStartDate, setScheduleStartDate] = useState('');
  const [scheduleEndDate, setScheduleEndDate] = useState('');

  // Course states
  const [lecCourses, setLecCourses] = useState<any[]>([]);
  const [loadingLecCourses, setLoadingLecCourses] = useState(false);
  const [selectedLecCourse, setSelectedLecCourse] = useState<any>(null);
  const [selectedLecCourseLevel, setSelectedLecCourseLevel] = useState('100L');
  const [lecMaterials, setLecMaterials] = useState<any[]>([]);
  const [loadingLecMaterials, setLoadingLecMaterials] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadForm, setUploadForm] = useState({ title: '', category: 'Lecture Notes', description: '', fileName: '', fileData: '', fileType: '', fileSize: 0 });
  const [uploadError, setUploadError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState('');
  const [uploading, setUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [courseTab, setCourseTab] = useState<'materials' | 'announcements' | 'assignments' | 'quizzes'>('materials');
  const [lecAnnouncements, setLecAnnouncements] = useState<any[]>([]);
  const [lecAssignments, setLecAssignments] = useState<any[]>([]);
  const [lecQuizzes, setLecQuizzes] = useState<any[]>([]);
  const [showCreateQuiz, setShowCreateQuiz] = useState(false);
  const [quizForm, setQuizForm] = useState({ title: '', description: '', timeLimit: 30, startDate: '', endDate: '', randomizeQuestions: true, randomizeOptions: true, showOneAtATime: false });
  const [quizQuestions, setQuizQuestions] = useState<any[]>([]);
  const [quizError, setQuizError] = useState('');
  const [viewingQuizAttempts, setViewingQuizAttempts] = useState<any>(null);
  const [quizAttempts, setQuizAttempts] = useState<any[]>([]);
  const [gradingAttempt, setGradingAttempt] = useState<any>(null);
  const [attemptDetails, setAttemptDetails] = useState<any[]>([]);
  const [gradingQuizLoading, setGradingQuizLoading] = useState(false);
  const [announcementMsg, setAnnouncementMsg] = useState('');
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [assignmentForm, setAssignmentForm] = useState({ title: '', description: '', deadline: '' });
  const [assignmentError, setAssignmentError] = useState('');
  const [viewingSubmissions, setViewingSubmissions] = useState<any>(null);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [plagiarismResults, setPlagiarismResults] = useState<any[]>([]);
  const [checkingPlagiarism, setCheckingPlagiarism] = useState(false);
  const [showPlagiarism, setShowPlagiarism] = useState(false);
  const [gradingSubmission, setGradingSubmission] = useState<any>(null);
  const [gradeForm, setGradeForm] = useState({ score: '', feedback: '' });
  const [gradingLoading, setGradingLoading] = useState(false);
  const [assignmentMaxScore, setAssignmentMaxScore] = useState(100);
  const [savingMaxScore, setSavingMaxScore] = useState(false);
  const [previewingSubmission, setPreviewingSubmission] = useState<any>(null);
  const [previewData, setPreviewData] = useState<string>('');
  const [previewLoading, setPreviewLoading] = useState(false);
  
  // Data states
  const [lecturerData, setLecturerData] = useState({
    name: '',
    id: '',
    email: '',
    university: '',
    department: '',
    title: '',
    role: '',
    specialization: '',
    officeHours: 'Mon-Wed 2:00-4:00 PM',
    avatar: '',
    qrCode: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjgwIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iODAiIGZpbGw9IndoaXRlIi8+PHJlY3QgeD0iMCIgeT0iMCIgd2lkdGg9IjMiIGhlaWdodD0iNjAiIGZpbGw9ImJsYWNrIi8+PHJlY3QgeD0iOCIgeT0iMCIgd2lkdGg9IjIiIGhlaWdodD0iNjAiIGZpbGw9ImJsYWNrIi8+PHJlY3QgeD0iMTYiIHk9IjAiIHdpZHRoPSI0IiBoZWlnaHQ9IjYwIiBmaWxsPSJibGFjayIvPjx0ZXh0IHg9IjEwMCIgeT0iNzUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtZmFtaWx5PSJtb25vc3BhY2UiIGZvbnQtc2l6ZT0iOCIgZmlsbD0iYmxhY2siPkZBQzEyMzQ1Njc4OTwvdGV4dD48L3N2Zz4='
  });
  
  // UI states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lecturerStats, setLecturerStats] = useState<any>(null);

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
          sessionStorage.removeItem('accessToken');
          sessionStorage.removeItem('refreshToken');
          sessionStorage.removeItem('user');
          router.push('/login');
        }
      } catch (error) {
        console.error('Token refresh error:', error);
      }
    };

    const interval = setInterval(refreshAccessToken, 230 * 60 * 1000);
    return () => clearInterval(interval);
  }, [router]);

  // Fetch lecturer profile data
  useEffect(() => {
    const fetchLecturerData = async () => {
      try {
        const token = sessionStorage.getItem('accessToken');
        const userData = sessionStorage.getItem('user');
        
        console.log('Lecturer Dashboard - Token:', token ? 'Present' : 'Missing');
        console.log('Lecturer Dashboard - User Data:', userData);
        
        if (!token) {
          router.push('/login');
          return;
        }

        const response = await fetch(getApiUrl('/api/users/profile'), {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.status === 401) {
          sessionStorage.removeItem('accessToken');
          sessionStorage.removeItem('refreshToken');
          sessionStorage.removeItem('user');
          router.push('/login');
          return;
        }

        if (response.ok) {
          const profileData: LecturerProfile = await response.json();
          
          setLecturerData({
            name: `${profileData.profile.firstName} ${profileData.profile.lastName}`,
            id: profileData.profile.lecturerId,
            email: profileData.email,
            university: profileData.profile.universityName,
            department: profileData.profile.department,
            title: `${profileData.profile.role}. ${profileData.profile.firstName} ${profileData.profile.lastName}`,
            role: profileData.profile.role,
            specialization: profileData.profile.specialization,
            officeHours: 'Mon-Wed 2:00-4:00 PM',
            avatar: profileData.profile.avatar,
            qrCode: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjgwIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iODAiIGZpbGw9IndoaXRlIi8+PHJlY3QgeD0iMCIgeT0iMCIgd2lkdGg9IjMiIGhlaWdodD0iNjAiIGZpbGw9ImJsYWNrIi8+PHJlY3QgeD0iOCIgeT0iMCIgd2lkdGg9IjIiIGhlaWdodD0iNjAiIGZpbGw9ImJsYWNrIi8+PHJlY3QgeD0iMTYiIHk9IjAiIHdpZHRoPSI0IiBoZWlnaHQ9IjYwIiBmaWxsPSJibGFjayIvPjx0ZXh0IHg9IjEwMCIgeT0iNzUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtZmFtaWx5PSJtb25vc3BhY2UiIGZvbnQtc2l6ZT0iOCIgZmlsbD0iYmxhY2siPkZBQzEyMzQ1Njc4OTwvdGV4dD48L3N2Zz4='
          });
        } else {
          throw new Error('Failed to load profile data');
        }

      } catch (err: any) {
        setError(err.message || 'Failed to load lecturer data');
        console.error('Lecturer dashboard fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchLecturerData();
  }, [router]);

  // Fetch real-time stats
  const fetchLecturerStats = async () => {
    try {
      const token = sessionStorage.getItem('accessToken');
      if (!token) return;
      const res = await fetch(getApiUrl('/api/lecturers/stats'), { headers: { 'Authorization': `Bearer ${token}` } });
      if (res.ok) {
        const data = await res.json();
        setLecturerStats(data.stats);
      }
    } catch {}
  };

  useEffect(() => {
    if (!loading && activeSection === 'overview') {
      fetchLecturerStats();
      const interval = setInterval(fetchLecturerStats, 30000); // Refresh every 30s
      return () => clearInterval(interval);
    }
  }, [loading, activeSection]);

  // Static data arrays (these would normally come from APIs)
  const classes: Course[] = [
    {
      id: 1,
      name: 'Data Structures & Algorithms',
      code: 'CS201',
      semester: 'Fall 2024',
      students: 45,
      schedule: 'Mon, Wed, Fri 10:00-11:00 AM',
      room: 'Room 301',
      nextClass: 'Today 10:00 AM',
      attendance: 89,
      assignments: 3,
      weeklySchedule: [
        { day: 'Monday', time: '10:00-11:00 AM', topic: 'Arrays and Linked Lists' },
        { day: 'Wednesday', time: '10:00-11:00 AM', topic: 'Stacks and Queues' },
        { day: 'Friday', time: '10:00-11:00 AM', topic: 'Trees and Graphs' }
      ],
      description: 'Introduction to fundamental data structures and algorithms including arrays, linked lists, stacks, queues, trees, and sorting algorithms.'
    },
    {
      id: 2,
      name: 'Machine Learning Fundamentals',
      code: 'CS401',
      semester: 'Fall 2024',
      students: 32,
      schedule: 'Tue, Thu 2:00-3:30 PM',
      room: 'Lab 205',
      nextClass: 'Tomorrow 2:00 PM',
      attendance: 92,
      assignments: 2,
      weeklySchedule: [
        { day: 'Tuesday', time: '2:00-3:30 PM', topic: 'Supervised Learning' },
        { day: 'Thursday', time: '2:00-3:30 PM', topic: 'Neural Networks' }
      ],
      description: 'Comprehensive introduction to machine learning concepts, supervised and unsupervised learning, neural networks, and practical applications.'
    },
    {
      id: 3,
      name: 'Database Systems',
      code: 'CS301',
      semester: 'Fall 2024',
      students: 38,
      schedule: 'Mon, Wed 2:00-3:00 PM',
      room: 'Room 205',
      nextClass: 'Monday 2:00 PM',
      attendance: 85,
      assignments: 4,
      weeklySchedule: [
        { day: 'Monday', time: '2:00-3:00 PM', topic: 'SQL Queries and Joins' },
        { day: 'Wednesday', time: '2:00-3:00 PM', topic: 'Database Normalization' }
      ],
      description: 'Database design principles, SQL, normalization, transactions, and modern database technologies including NoSQL systems.'
    }
  ];

  const attendanceRecords = [
    {
      id: 1,
      courseCode: 'CS201',
      courseName: 'Data Structures & Algorithms',
      date: '2024-01-15',
      totalStudents: 45,
      present: 42,
      absent: 3,
      percentage: 93.3,
      status: 'completed'
    },
    {
      id: 2,
      courseCode: 'CS401',
      courseName: 'Machine Learning Fundamentals',
      date: '2024-01-14',
      totalStudents: 32,
      present: 30,
      absent: 2,
      percentage: 93.8,
      status: 'completed'
    },
    {
      id: 3,
      courseCode: 'CS301',
      courseName: 'Database Systems',
      date: '2024-01-13',
      totalStudents: 38,
      present: 35,
      absent: 3,
      percentage: 92.1,
      status: 'completed'
    }
  ];

  const todaysClasses = [
    {
      id: 1,
      course: 'CS201 - Data Structures',
      time: '10:00-11:00 AM',
      room: 'Room 301',
      students: 45,
      status: 'upcoming'
    },
    {
      id: 2,
      course: 'CS301 - Database Systems',
      time: '2:00-3:00 PM',
      room: 'Room 205',
      students: 38,
      status: 'upcoming'
    }
  ];

  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [loadingActivities, setLoadingActivities] = useState(false);

  const fetchActivities = async () => {
    setLoadingActivities(true);
    try {
      const token = sessionStorage.getItem('accessToken');
      if (!token) return;
      const res = await fetch(getApiUrl('/api/course/activities'), { headers: { 'Authorization': `Bearer ${token}` } });
      if (res.ok) {
        const data = await res.json();
        setRecentActivities(data.activities || []);
      } else {
        console.error('Activities fetch failed:', res.status, await res.text());
      }
    } catch (err) {
      console.error('Activities fetch error:', err);
    }
    setLoadingActivities(false);
  };

  const formatTimeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    if (days < 7) return `${days}d ago`;
    return new Date(dateStr).toLocaleDateString();
  };

  const [upcomingTasks, setUpcomingTasks] = useState<any[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(false);

  const fetchUpcomingTasks = async () => {
    try {
      const token = sessionStorage.getItem('accessToken');
      if (!token) return;
      const res = await fetch(getApiUrl('/api/course/lecturer/tasks'), { headers: { 'Authorization': `Bearer ${token}` } });
      if (res.ok) {
        const data = await res.json();
        setUpcomingTasks(data.tasks || []);
      } else {
        console.error('Tasks fetch failed:', res.status, await res.text());
      }
    } catch (err) {
      console.error('Tasks fetch error:', err);
    }
    setLoadingTasks(false);
  };

  const quickActions = [
    { id: 'start-scanner', name: 'Start QR Scanner', icon: '📱', color: 'from-blue-600 to-indigo-600' },
    { id: 'take-attendance', name: 'Take Attendance', icon: '✅', color: 'from-green-600 to-emerald-600' },
    { id: 'view-schedule', name: 'Today\'s Classes', icon: '📅', color: 'from-purple-600 to-pink-600' },
    { id: 'post-grades', name: 'Post Grades', icon: '📊', color: 'from-orange-600 to-red-600' },
    { id: 'send-announcement', name: 'Send Announcement', icon: '📢', color: 'from-cyan-600 to-blue-600' },
    { id: 'view-reports', name: 'View Reports', icon: '📈', color: 'from-yellow-600 to-orange-600' }
  ];

  const menuItems: NavItem[] = [
    { id: 'overview', name: 'Overview', icon: 'dashboard' },
    { id: 'qr-scanner', name: 'QR Scanner', icon: 'scan' },
    { id: 'student-history', name: 'Student History', icon: 'history' },
    { id: 'attendance', name: 'Attendance Management', icon: 'clipboardCheck' },
    { id: 'courses', name: 'My Courses', icon: 'bookOpen' },
    { id: 'grades', name: 'Grades & Assessment', icon: 'award' },
    { id: 'student-records', name: 'Student Records', icon: 'users' },
    { id: 'schedule', name: 'Class Schedule', icon: 'calendar' },
    { id: 'announcements', name: 'Announcements', icon: 'megaphone' },
    { id: 'office-hours', name: 'Office Hours', icon: 'clock' },
    { id: 'reports', name: 'Reports & Analytics', icon: 'trendingUp' },
    { id: 'qr-code', name: 'My QR Code', icon: 'qrCode' },
    { id: 'settings', name: 'Settings', icon: 'settings' },
  ];

  // Fetch students by department
  const fetchStudents = async (level?: string, search?: string) => {
    setLoadingStudents(true);
    try {
      const token = sessionStorage.getItem('accessToken');
      if (!token) return;

      const params = new URLSearchParams();
      if (level) params.append('level', level);
      if (search) params.append('search', search);

      const response = await fetch(
        getApiUrl(`/api/lecturers/students?${params.toString()}`),
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.ok) {
        const data: StudentsData = await response.json();
        setStudentsData(data);
      } else {
        console.error('Failed to fetch students');
      }
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setLoadingStudents(false);
    }
  };

  // Fetch students when student-records section is active
  useEffect(() => {
    if (activeSection === 'student-records') {
      fetchStudents(selectedLevel, studentSearch);
    }
  }, [activeSection, selectedLevel, studentSearch]);

  // Schedule functions
  const fetchSchedule = async (view?: string, date?: string) => {
    if (!scheduleLoaded) setLoadingSchedule(true);
    try {
      const token = sessionStorage.getItem('accessToken');
      if (!token) return;
      const v = view || scheduleView;
      const d = date || scheduleDate;
      const url = getApiUrl(`/api/schedule?view=${v}&date=${d}`);
      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        let detail = `${response.status} ${response.statusText || ''}`.trim();
        try {
          const errBody = await response.json();
          if (errBody?.error) detail = `${errBody.error}${errBody.details ? ` (${errBody.details})` : ''}`;
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
      setScheduleTodayClasses(data.todayClasses || []);
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
    if (activeSection === 'overview' && !loading) {
      fetchActivities();
      setLoadingTasks(true);
      fetchUpcomingTasks();
      // Poll for near real-time updates while viewing the overview
      const interval = setInterval(() => {
        fetchActivities();
        fetchUpcomingTasks();
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [activeSection, loading]);

  useEffect(() => {
    if (activeSection === 'schedule') {
      fetchSchedule();
    }
  }, [activeSection, scheduleView, scheduleDate]);

  const navigateSchedule = (direction: number) => {
    const d = new Date(scheduleDate);
    if (scheduleView === 'week') d.setDate(d.getDate() + direction * 7);
    else d.setMonth(d.getMonth() + direction);
    setScheduleDate(d.toISOString().split('T')[0]);
  };

  const handleScheduleSubmit = async () => {
    setScheduleError('');
    setScheduleSuccess('');

    // Frontend validation
    if (!scheduleForm.courseId && !scheduleForm.courseCode) {
      setScheduleError('Please select a course you are assigned to');
      return;
    }
    if (!scheduleForm.startTime || !scheduleForm.endTime || !scheduleForm.venue) {
      setScheduleError('Please fill in all fields');
      return;
    }

    const rangeError = validateScheduleTimeRange(scheduleForm.startTime, scheduleForm.endTime);
    if (rangeError) {
      setScheduleError(rangeError);
      return;
    }

    const dateToValidate =
      scheduleMode === 'single' || editingSchedule ? scheduleForm.date : null;
    if (dateToValidate) {
      const pastError = validateScheduleNotInPast(dateToValidate, scheduleForm.startTime);
      if (pastError) {
        setScheduleError(pastError);
        return;
      }
    }

    try {
      const token = sessionStorage.getItem('accessToken');
      if (!token) return;

      if (editingSchedule) {
        const response = await fetch(getApiUrl(`/api/schedule/${editingSchedule._id}`), {
          method: 'PUT',
          headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            courseId: scheduleForm.courseId, courseCode: scheduleForm.courseCode, courseName: scheduleForm.courseName,
            date: scheduleForm.date, startTime: scheduleForm.startTime, endTime: scheduleForm.endTime,
            venue: scheduleForm.venue, level: scheduleForm.level
          }),
        });
        const data = await response.json();
        if (!response.ok) { setScheduleError(data.error || 'Failed to update'); return; }
        setScheduleSuccess('Schedule updated!');
      } else {
        const payload: any = {
          courseId: scheduleForm.courseId, courseCode: scheduleForm.courseCode, courseName: scheduleForm.courseName,
          startTime: scheduleForm.startTime, endTime: scheduleForm.endTime,
          venue: scheduleForm.venue, level: scheduleForm.level
        };
        if (scheduleMode === 'recurring') {
          payload.recurring = { dayOfWeek: scheduleForm.recurringDay, startDate: scheduleForm.recurringStart, endDate: scheduleForm.recurringEnd };
        } else {
          payload.date = scheduleForm.date;
        }
        const response = await fetch(getApiUrl('/api/schedule'), {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = await response.json();
        if (!response.ok) { setScheduleError(data.error || 'Failed to create'); return; }
        setScheduleSuccess(data.message || 'Schedule created!');

        // Jump the calendar view to the first created class so the lecturer
        // actually sees it (otherwise the view may still be on a different week).
        const firstCreated = Array.isArray(data.created) && data.created[0]?.date;
        if (firstCreated && firstCreated !== scheduleDate) {
          setScheduleDate(firstCreated);
        }
      }
      setShowAddSchedule(false);
      setEditingSchedule(null);
      setScheduleForm({ courseId: '', courseCode: '', courseName: '', date: new Date().toISOString().split('T')[0], startTime: '', endTime: '', venue: '', level: '100L', recurringDay: 'Monday', recurringStart: '', recurringEnd: '' });
      setScheduleMode('single');
      fetchSchedule();
      setTimeout(() => setScheduleSuccess(''), 3000);
    } catch (error: any) {
      setScheduleError(error.message || 'Failed to save');
    }
  };

  const handleDeleteSchedule = async (id: string) => {
    if (!confirm('Delete this schedule entry?')) return;
    try {
      const token = sessionStorage.getItem('accessToken');
      if (!token) return;
      const response = await fetch(getApiUrl(`/api/schedule/${id}`), {
        method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.ok) {
        setScheduleSuccess('Deleted');
        fetchSchedule();
        setTimeout(() => setScheduleSuccess(''), 3000);
      }
    } catch (error) { console.error('Error deleting schedule:', error); }
  };

  const handleCancelSchedule = async () => {
    if (!cancellingSchedule || !cancelReason.trim()) return;
    try {
      const token = sessionStorage.getItem('accessToken');
      if (!token) return;
      const response = await fetch(getApiUrl(`/api/schedule/${cancellingSchedule._id}/cancel`), {
        method: 'PUT', headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: cancelReason.trim() }),
      });
      if (response.ok) {
        setScheduleSuccess('Class cancelled');
        setCancellingSchedule(null);
        setCancelReason('');
        fetchSchedule();
        setTimeout(() => setScheduleSuccess(''), 3000);
      } else {
        const data = await response.json();
        setScheduleError(data.error || 'Failed to cancel class');
        setTimeout(() => setScheduleError(''), 3000);
      }
    } catch (error) { console.error('Error cancelling schedule:', error); }
  };

  const handleRestoreSchedule = async (id: string) => {
    try {
      const token = sessionStorage.getItem('accessToken');
      if (!token) return;
      const response = await fetch(getApiUrl(`/api/schedule/${id}/restore`), {
        method: 'PUT', headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.ok) {
        setScheduleSuccess('Class restored');
        fetchSchedule();
        setTimeout(() => setScheduleSuccess(''), 3000);
      }
    } catch (error) { console.error('Error restoring schedule:', error); }
  };

  const openEditSchedule = (entry: any) => {
    setEditingSchedule(entry);
    // Resolve the assigned course for this entry: prefer a stored courseId,
    // otherwise match by normalized course code so the picker preselects it.
    const norm = (s: string) => (s || '').replace(/\s+/g, '').toUpperCase();
    const matched =
      assignedCourses.find((c: any) => c._id === entry.courseId) ||
      assignedCourses.find((c: any) => norm(c.courseCode) === norm(entry.courseCode));
    setScheduleForm({
      courseId: matched?._id || entry.courseId || '',
      courseCode: entry.courseCode, courseName: entry.courseName, date: entry.date,
      startTime: entry.startTime, endTime: entry.endTime, venue: entry.venue, level: entry.level,
      recurringDay: 'Monday', recurringStart: '', recurringEnd: ''
    });
    setScheduleMode('single');
    setShowAddSchedule(true);
    setScheduleError('');
  };

  // Announcement state and handler
  const [announcementEntry, setAnnouncementEntry] = useState<any>(null);
  const [announcementText, setAnnouncementText] = useState('');

  const handleSaveAnnouncement = async () => {
    if (!announcementEntry) return;
    try {
      const token = sessionStorage.getItem('accessToken');
      if (!token) return;
      const response = await fetch(getApiUrl(`/api/schedule/${announcementEntry._id}/announcement`), {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ announcement: announcementText.trim() }),
      });
      if (response.ok) {
        setScheduleSuccess(announcementText.trim() ? 'Announcement added' : 'Announcement removed');
        setAnnouncementEntry(null);
        setAnnouncementText('');
        fetchSchedule();
        setTimeout(() => setScheduleSuccess(''), 3000);
      }
    } catch (error) { console.error('Error saving announcement:', error); }
  };

  // Course functions
  const fetchLecCourses = async () => {
    setLoadingLecCourses(true);
    try {
      const token = sessionStorage.getItem('accessToken');
      if (!token) return;
      const response = await fetch(getApiUrl('/api/course'), {
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
      if (response.ok) {
        const data = await response.json();
        setLecCourses(data.courses || []);
      }
    } catch (error) { console.error('Error fetching courses:', error); }
    finally { setLoadingLecCourses(false); }
  };

  // Only courses explicitly assigned to this lecturer — used to populate the
  // schedule course picker (backend also enforces this).
  const fetchAssignedCourses = async () => {
    setLoadingAssignedCourses(true);
    try {
      const token = sessionStorage.getItem('accessToken');
      if (!token) return;
      const response = await fetch(getApiUrl('/api/course?assignedOnly=true'), {
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
      if (response.ok) {
        const data = await response.json();
        setAssignedCourses(data.courses || []);
      }
    } catch (error) { console.error('Error fetching assigned courses:', error); }
    finally { setLoadingAssignedCourses(false); }
  };

  const fetchLecMaterials = async (courseId: string) => {
    setLoadingLecMaterials(true);
    try {
      const token = sessionStorage.getItem('accessToken');
      if (!token) return;
      const response = await fetch(getApiUrl(`/api/course/${courseId}/materials`), {
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
      if (response.ok) {
        const data = await response.json();
        setLecMaterials(data.materials || []);
      }
    } catch (error) { console.error('Error fetching materials:', error); }
    finally { setLoadingLecMaterials(false); }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = (reader.result as string).split(',')[1] || '';
      setUploadForm(prev => ({ ...prev, fileName: file.name, fileData: base64, fileType: file.type, fileSize: file.size }));
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = (reader.result as string).split(',')[1] || '';
      setUploadForm(prev => ({ ...prev, title: prev.title || file.name.replace(/\.[^/.]+$/, ''), fileName: file.name, fileData: base64, fileType: file.type, fileSize: file.size }));
      setShowUploadModal(true);
      setUploadError('');
    };
    reader.readAsDataURL(file);
  };

  const handleUploadMaterial = async () => {
    setUploadError('');
    if (!uploadForm.title || !uploadForm.fileData || !selectedLecCourse) {
      setUploadError('Please provide a title and select a file');
      return;
    }
    setUploading(true);
    try {
      const token = sessionStorage.getItem('accessToken');
      if (!token) return;
      const response = await fetch(getApiUrl(`/api/course/${selectedLecCourse._id}/material`), {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(uploadForm),
      });
      const data = await response.json();
      if (!response.ok) { setUploadError(data.error || 'Upload failed'); return; }
      setUploadSuccess('Material uploaded');
      setShowUploadModal(false);
      setUploadForm({ title: '', category: 'Lecture Notes', description: '', fileName: '', fileData: '', fileType: '', fileSize: 0 });
      fetchLecMaterials(selectedLecCourse._id);
      setTimeout(() => setUploadSuccess(''), 3000);
    } catch (error) { setUploadError('Upload failed'); }
    finally { setUploading(false); }
  };

  const handleDeleteMaterial = async (materialId: string) => {
    if (!confirm('Delete this material?')) return;
    try {
      const token = sessionStorage.getItem('accessToken');
      if (!token) return;
      const response = await fetch(getApiUrl(`/api/course/material/${materialId}`), {
        method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.ok && selectedLecCourse) fetchLecMaterials(selectedLecCourse._id);
    } catch (error) { console.error('Error deleting material:', error); }
  };

  const fetchLecAnnouncements = async (courseId: string) => {
    try {
      const token = sessionStorage.getItem('accessToken');
      if (!token) return;
      const res = await fetch(getApiUrl(`/api/course/${courseId}/announcements`), { headers: { 'Authorization': `Bearer ${token}` } });
      if (res.ok) { const data = await res.json(); setLecAnnouncements(data.announcements || []); }
    } catch {}
  };

  const postAnnouncement = async () => {
    if (!announcementMsg.trim() || !selectedLecCourse) return;
    try {
      const token = sessionStorage.getItem('accessToken');
      if (!token) return;
      await fetch(getApiUrl(`/api/course/${selectedLecCourse._id}/announcement`), {
        method: 'POST', headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: announcementMsg.trim() }),
      });
      setAnnouncementMsg('');
      fetchLecAnnouncements(selectedLecCourse._id);
    } catch {}
  };

  const deleteAnnouncement = async (id: string) => {
    try {
      const token = sessionStorage.getItem('accessToken');
      if (!token) return;
      await fetch(getApiUrl(`/api/course/announcement/${id}`), { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
      if (selectedLecCourse) fetchLecAnnouncements(selectedLecCourse._id);
    } catch {}
  };

  const fetchLecAssignments = async (courseId: string) => {
    try {
      const token = sessionStorage.getItem('accessToken');
      if (!token) return;
      const res = await fetch(getApiUrl(`/api/course/${courseId}/assignments`), { headers: { 'Authorization': `Bearer ${token}` } });
      if (res.ok) { const data = await res.json(); setLecAssignments(data.assignments || []); }
    } catch {}
  };

  const fetchLecQuizzes = async (courseId: string) => {
    try {
      const token = sessionStorage.getItem('accessToken');
      if (!token) return;
      const res = await fetch(getApiUrl(`/api/quiz/course/${courseId}`), { headers: { 'Authorization': `Bearer ${token}` } });
      if (res.ok) { const data = await res.json(); setLecQuizzes(data.quizzes || []); }
    } catch {}
  };

  const createQuiz = async () => {
    setQuizError('');
    if (!quizForm.title.trim() || !selectedLecCourse) { setQuizError('Title is required'); return; }
    if (quizQuestions.length === 0) { setQuizError('Add at least one question'); return; }
    if (quizForm.startDate && new Date(quizForm.startDate) <= new Date()) { setQuizError('Start date must be in the future'); return; }
    if (quizForm.endDate && new Date(quizForm.endDate) <= new Date()) { setQuizError('End date must be in the future'); return; }
    if (quizForm.startDate && quizForm.endDate && new Date(quizForm.endDate) <= new Date(quizForm.startDate)) { setQuizError('End date must be after start date'); return; }
    try {
      const token = sessionStorage.getItem('accessToken');
      if (!token) return;
      const res = await fetch(getApiUrl('/api/quiz'), {
        method: 'POST', headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseId: selectedLecCourse._id, title: quizForm.title.trim(), description: quizForm.description.trim(),
          timeLimit: quizForm.timeLimit, startDate: quizForm.startDate || null, endDate: quizForm.endDate || null,
          questions: quizQuestions,
          settings: { randomizeQuestions: quizForm.randomizeQuestions, randomizeOptions: quizForm.randomizeOptions, showOneAtATime: quizForm.showOneAtATime },
        }),
      });
      if (res.ok) {
        setShowCreateQuiz(false);
        setQuizForm({ title: '', description: '', timeLimit: 30, startDate: '', endDate: '', randomizeQuestions: true, randomizeOptions: true, showOneAtATime: false });
        setQuizQuestions([]);
        fetchLecQuizzes(selectedLecCourse._id);
      } else { const d = await res.json(); setQuizError(d.error || 'Failed'); }
    } catch { setQuizError('Failed to create quiz'); }
  };

  const deleteQuiz = async (id: string) => {
    if (!confirm('Delete this quiz and all attempts?')) return;
    try {
      const token = sessionStorage.getItem('accessToken');
      if (!token) return;
      await fetch(getApiUrl(`/api/quiz/${id}`), { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
      if (selectedLecCourse) fetchLecQuizzes(selectedLecCourse._id);
    } catch {}
  };

  const fetchQuizAttempts = async (quizId: string) => {
    try {
      const token = sessionStorage.getItem('accessToken');
      if (!token) return;
      const res = await fetch(getApiUrl(`/api/quiz/${quizId}/attempts`), { headers: { 'Authorization': `Bearer ${token}` } });
      if (res.ok) { const data = await res.json(); setQuizAttempts(data.attempts || []); }
    } catch {}
  };

  const toggleReleaseResults = async (quizId: string) => {
    try {
      const token = sessionStorage.getItem('accessToken');
      if (!token) return;
      await fetch(getApiUrl(`/api/quiz/${quizId}/release`), { method: 'PUT', headers: { 'Authorization': `Bearer ${token}` } });
      if (selectedLecCourse) fetchLecQuizzes(selectedLecCourse._id);
    } catch {}
  };

  const fetchAttemptDetails = async (attemptId: string) => {
    setGradingQuizLoading(true);
    try {
      const token = sessionStorage.getItem('accessToken');
      if (!token) return;
      const res = await fetch(getApiUrl(`/api/quiz/attempt/${attemptId}`), { headers: { 'Authorization': `Bearer ${token}` } });
      if (res.ok) {
        const data = await res.json();
        setGradingAttempt(data.attempt);
        setAttemptDetails(data.details || []);
      }
    } catch {}
    setGradingQuizLoading(false);
  };

  const gradeQuizQuestion = async (attemptId: string, questionIndex: number, points: number) => {
    try {
      const token = sessionStorage.getItem('accessToken');
      if (!token) return;
      const res = await fetch(getApiUrl(`/api/quiz/attempt/${attemptId}/grade-question`), {
        method: 'PUT', headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ questionIndex, points }),
      });
      if (res.ok) {
        const data = await res.json();
        // Update local state
        setAttemptDetails(prev => prev.map((d, i) => i === questionIndex ? { ...d, awardedPoints: points, isGraded: true, correct: points > 0 } : d));
        setGradingAttempt((prev: any) => prev ? { ...prev, score: data.score, percentage: data.percentage } : prev);
        // Refresh attempts list
        if (viewingQuizAttempts) fetchQuizAttempts(viewingQuizAttempts._id);
      }
    } catch {}
  };

  const createAssignment = async () => {
    setAssignmentError('');
    if (!assignmentForm.title.trim() || !assignmentForm.deadline || !selectedLecCourse) {
      setAssignmentError('Title and deadline are required'); return;
    }
    // Check if deadline is in the past
    if (new Date(assignmentForm.deadline) <= new Date()) {
      setAssignmentError('Deadline must be in the future. Please select a later date and time.'); return;
    }
    try {
      const token = sessionStorage.getItem('accessToken');
      if (!token) return;
      const res = await fetch(getApiUrl(`/api/course/${selectedLecCourse._id}/assignment`), {
        method: 'POST', headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(assignmentForm),
      });
      if (res.ok) {
        setShowAssignmentModal(false);
        setAssignmentForm({ title: '', description: '', deadline: '' });
        fetchLecAssignments(selectedLecCourse._id);
      } else { const d = await res.json(); setAssignmentError(d.error || 'Failed'); }
    } catch { setAssignmentError('Failed'); }
  };

  const deleteAssignment = async (id: string) => {
    if (!confirm('Delete this assignment and all submissions?')) return;
    try {
      const token = sessionStorage.getItem('accessToken');
      if (!token) return;
      await fetch(getApiUrl(`/api/course/assignment/${id}`), { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
      if (selectedLecCourse) fetchLecAssignments(selectedLecCourse._id);
    } catch {}
  };

  const fetchSubmissions = async (assignmentId: string) => {
    try {
      const token = sessionStorage.getItem('accessToken');
      if (!token) return;
      const res = await fetch(getApiUrl(`/api/course/assignment/${assignmentId}/submissions`), { headers: { 'Authorization': `Bearer ${token}` } });
      if (res.ok) { const data = await res.json(); setSubmissions(data.submissions || []); }
    } catch {}
  };

  const checkPlagiarism = async (assignmentId: string) => {
    setCheckingPlagiarism(true);
    setPlagiarismResults([]);
    try {
      const token = sessionStorage.getItem('accessToken');
      if (!token) return;
      const res = await fetch(getApiUrl(`/api/course/assignment/${assignmentId}/plagiarism`), { headers: { 'Authorization': `Bearer ${token}` } });
      if (res.ok) {
        const data = await res.json();
        setPlagiarismResults(data.results || []);
        setShowPlagiarism(true);
      }
    } catch {}
    setCheckingPlagiarism(false);
  };

  const gradeSubmission = async () => {
    if (!gradingSubmission) return;
    const score = parseFloat(gradeForm.score);
    if (isNaN(score) || score < 0 || score > assignmentMaxScore) return;
    setGradingLoading(true);
    try {
      const token = sessionStorage.getItem('accessToken');
      if (!token) return;
      const res = await fetch(getApiUrl(`/api/course/submission/${gradingSubmission._id}/grade`), {
        method: 'PUT', headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ score, feedback: gradeForm.feedback.trim() }),
      });
      if (res.ok) {
        setGradingSubmission(null);
        setGradeForm({ score: '', feedback: '' });
        if (viewingSubmissions) fetchSubmissions(viewingSubmissions._id);
      }
    } catch {}
    setGradingLoading(false);
  };

  const saveMaxScore = async (assignmentId: string, maxScore: number) => {
    setSavingMaxScore(true);
    try {
      const token = sessionStorage.getItem('accessToken');
      if (!token) return;
      await fetch(getApiUrl(`/api/course/assignment/${assignmentId}/maxscore`), {
        method: 'PUT', headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ maxScore }),
      });
    } catch {}
    setSavingMaxScore(false);
  };

  const openSubmissionPreview = async (submission: any) => {
    setPreviewingSubmission(submission);
    setPreviewLoading(true);
    setPreviewData('');
    try {
      const token = sessionStorage.getItem('accessToken');
      if (!token) return;
      const res = await fetch(getApiUrl(`/api/course/submission/${submission._id}/download`), { headers: { 'Authorization': `Bearer ${token}` } });
      if (res.ok) {
        const data = await res.json();
        if (data.fileType?.includes('pdf')) {
          // Convert base64 to blob URL for PDF
          const byteChars = atob(data.fileData);
          const byteNumbers = new Array(byteChars.length);
          for (let i = 0; i < byteChars.length; i++) byteNumbers[i] = byteChars.charCodeAt(i);
          const blob = new Blob([new Uint8Array(byteNumbers)], { type: 'application/pdf' });
          setPreviewData(URL.createObjectURL(blob));
        } else if (data.fileType?.includes('html') || data.fileName?.endsWith('.html')) {
          // Decode HTML content (written answers)
          try {
            setPreviewData(decodeURIComponent(escape(atob(data.fileData))));
          } catch {
            setPreviewData(atob(data.fileData));
          }
        } else if (data.fileType?.includes('text') || data.fileName?.endsWith('.txt') || data.fileName?.endsWith('.md') || data.fileName?.endsWith('.csv')) {
          // Decode text content
          setPreviewData(atob(data.fileData));
        } else {
          // Unsupported — offer download
          setPreviewData('__unsupported__');
        }
      }
    } catch {
      setPreviewData('__error__');
    }
    setPreviewLoading(false);
  };

  useEffect(() => {
    if (activeSection === 'courses') fetchLecCourses();
    if (activeSection === 'schedule') fetchAssignedCourses();
  }, [activeSection]);

  // Poll for course updates (every 15s)
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
          if (data.updated) {
            lastCourseTimestamp = data.timestamp;
            fetchLecCourses();
            if (selectedLecCourse) {
              fetchLecMaterials(selectedLecCourse._id);
              fetchLecAnnouncements(selectedLecCourse._id);
              fetchLecAssignments(selectedLecCourse._id);
            }
          }
        }
      } catch {}
    };
    const interval = setInterval(pollCourses, 10000);
    return () => clearInterval(interval);
  }, [selectedLecCourse]);

  useEffect(() => {
    if (selectedLecCourse) {
      fetchLecMaterials(selectedLecCourse._id);
      fetchLecAnnouncements(selectedLecCourse._id);
      fetchLecAssignments(selectedLecCourse._id);
      fetchLecQuizzes(selectedLecCourse._id);
      setCourseTab('materials');
    }
  }, [selectedLecCourse]);

  const scheduleColors = ['bg-blue-900/40 border-blue-600/50 text-blue-300', 'bg-purple-900/40 border-purple-600/50 text-purple-300', 'bg-green-900/40 border-green-600/50 text-green-300', 'bg-orange-900/40 border-orange-600/50 text-orange-300', 'bg-pink-900/40 border-pink-600/50 text-pink-300', 'bg-teal-900/40 border-teal-600/50 text-teal-300'];
  const getScheduleColor = (code: string) => {
    let hash = 0;
    for (let i = 0; i < code.length; i++) hash = code.charCodeAt(i) + ((hash << 5) - hash);
    return scheduleColors[Math.abs(hash) % scheduleColors.length];
  };

  const formatDateLabel = (dateStr: string) => {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const isClassPast = (entry: any) => {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    if (entry.date < todayStr) return true;
    if (entry.date === todayStr) {
      const [h, m] = (entry.endTime || '').split(':').map(Number);
      const endMinutes = (h || 0) * 60 + (m || 0);
      const currentMinutes = now.getHours() * 60 + now.getMinutes();
      if (endMinutes <= currentMinutes) return true;
    }
    return false;
  };

  const getWeekDates = () => {
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

  const handleQuickAction = (actionId: string) => {
    if (actionId === 'start-scanner') {
      setActiveSection('qr-scanner');
    } else if (actionId === 'take-attendance') {
      setActiveSection('attendance');
    } else if (actionId === 'view-schedule') {
      setActiveSection('courses');
    }
    // Handle other actions
  };

  // Show loading state
  if (loading) {
    return (
      <div className="app-shell flex items-center justify-center p-4" data-role="lecturer">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[var(--accent)] mx-auto mb-4" />
          <p className="text-[var(--text-secondary)] text-sm">Loading dashboard…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="app-shell flex items-center justify-center p-4" data-role="lecturer">
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
    <>
      {/* QR Code Modal */}
      {showQRCode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-slate-800 rounded-2xl p-8 max-w-md w-full border border-slate-700">
            <div className="text-center">
              <h3 className="text-xl font-bold text-white mb-4">Faculty Digital ID</h3>
              <div className="bg-white rounded-lg p-4 mb-4">
                <img src={lecturerData.qrCode} alt="Faculty QR Code" className="w-full h-auto" />
              </div>
              <div className="space-y-2 text-left">
                <div className="flex justify-between">
                  <span className="text-slate-400">Name:</span>
                  <span className="text-white">{lecturerData.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Faculty ID:</span>
                  <span className="text-white font-mono">{lecturerData.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Department:</span>
                  <span className="text-white">{lecturerData.department}</span>
                </div>
              </div>
              <button
                onClick={() => setShowQRCode(false)}
                className="mt-6 w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Course Details Modal */}
      {selectedCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-slate-800 rounded-2xl p-8 max-w-2xl w-full border border-slate-700 max-h-96 overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-2xl font-bold text-white">{selectedCourse.name}</h3>
              <button
                onClick={() => setSelectedCourse(null)}
                className="text-slate-400 hover:text-white"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-slate-400 text-sm">Course Code</p>
                  <p className="text-white font-semibold">{selectedCourse.code}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-sm">Semester</p>
                  <p className="text-white">{selectedCourse.semester}</p>
                </div>
              </div>
              
              <div>
                <p className="text-slate-400 text-sm mb-2">Description</p>
                <p className="text-slate-300">{selectedCourse.description}</p>
              </div>
              
              <div>
                <p className="text-slate-400 text-sm mb-2">Weekly Schedule</p>
                <div className="space-y-2">
                  {selectedCourse.weeklySchedule.map((session, index) => (
                    <div key={index} className="bg-slate-700/50 rounded p-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-white font-medium">{session.day} - {session.time}</p>
                          <p className="text-slate-400 text-sm">{session.topic}</p>
                        </div>
                        <span className="text-slate-500 text-xs">{selectedCourse.room}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-slate-400 text-sm">Students</p>
                  <p className="text-white font-semibold">{selectedCourse.students}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-sm">Attendance</p>
                  <p className="text-green-400 font-semibold">{selectedCourse.attendance}%</p>
                </div>
                <div>
                  <p className="text-slate-400 text-sm">Assignments</p>
                  <p className="text-blue-400 font-semibold">{selectedCourse.assignments}</p>
                </div>
              </div>
              
              <div className="flex gap-3 mt-6">
                <button 
                  onClick={() => {
                    setSelectedCourse(null);
                    setActiveSection('qr-scanner');
                  }}
                  className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white py-2 rounded-lg hover:from-green-700 hover:to-emerald-700 transition-colors"
                >
                  Take Attendance
                </button>
                <button 
                  onClick={() => {
                    setSelectedCourse(null);
                    setActiveSection('attendance');
                  }}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-2 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-colors"
                >
                  View Records
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {selectedClass && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-slate-800 rounded-2xl p-8 max-w-2xl w-full border border-slate-700 max-h-96 overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-2xl font-bold text-white">{selectedClass.name}</h3>
              <button
                onClick={() => setSelectedClass(null)}
                className="text-slate-400 hover:text-white"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-slate-400 text-sm">Course Code</p>
                  <p className="text-white font-semibold">{selectedClass.code}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-sm">Semester</p>
                  <p className="text-white">{selectedClass.semester}</p>
                </div>
              </div>
              
              <div>
                <p className="text-slate-400 text-sm mb-2">Description</p>
                <p className="text-slate-300">{selectedClass.description}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-slate-400 text-sm">Schedule</p>
                  <p className="text-white">{selectedClass.schedule}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-sm">Room</p>
                  <p className="text-white">{selectedClass.room}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-slate-400 text-sm">Students</p>
                  <p className="text-white font-semibold">{selectedClass.students}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-sm">Attendance</p>
                  <p className="text-green-400 font-semibold">{selectedClass.attendance}%</p>
                </div>
                <div>
                  <p className="text-slate-400 text-sm">Assignments</p>
                  <p className="text-blue-400 font-semibold">{selectedClass.assignments}</p>
                </div>
              </div>
              
              <div className="flex gap-3 mt-6">
                <button className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white py-2 rounded-lg hover:from-green-700 hover:to-emerald-700 transition-colors">
                  Take Attendance
                </button>
                <button className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-2 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-colors">
                  View Students
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <DashboardShell
        role="lecturer"
        navItems={menuItems}
        activeSection={activeSection}
        onSelectSection={setActiveSection}
        pageTitle={menuItems.find(i => i.id === activeSection)?.name ?? activeSection.replace('-', ' ')}
        pageSubtitle={lecturerData.department}
        user={{
          name: lecturerData.name,
          subtitle: lecturerData.title,
          secondary: lecturerData.department,
          initials: lecturerData.avatar,
        }}
        topbarActions={
          <button
            type="button"
            onClick={() => setShowQRCode(true)}
            className="btn btn-secondary text-xs"
          >
            <Icon name="qrCode" size={14} />
            <span className="hidden sm:inline">Show ID</span>
          </button>
        }
      >
          {activeSection === 'overview' && (
            <div className="space-y-6">
              {/* Welcome Card */}
              <div className="card-hover bg-slate-800/50 backdrop-blur-sm p-6 rounded-2xl border border-slate-700/50">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-xl font-bold text-white mb-2">Welcome back, {lecturerData.name}! 👋</h2>
                    <p className="text-slate-300">Here's your teaching overview for today.</p>
                  </div>
                  <div className="text-right">
                    <p className="text-slate-400 text-sm">Today's Date</p>
                    <p className="text-white font-semibold">{new Date().toLocaleDateString()}</p>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="card-hover bg-slate-800/50 backdrop-blur-sm p-6 rounded-2xl border border-slate-700/50">
                <h3 className="text-lg font-bold text-white mb-4">Quick Actions</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
                  {quickActions.map((action) => (
                    <button
                      key={action.id}
                      onClick={() => handleQuickAction(action.id)}
                      className={`btn-primary bg-gradient-to-r ${action.color} hover:scale-105 text-white p-3 sm:p-4 rounded-lg text-center transition-all duration-300 touch-manipulation`}
                    >
                      <div className="text-xl sm:text-2xl mb-2">{action.icon}</div>
                      <div className="font-medium text-xs sm:text-sm">{action.name}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                <div className="card-hover bg-slate-800/50 backdrop-blur-sm p-4 sm:p-6 rounded-2xl border border-slate-700/50">
                  <div className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="text-slate-400 text-xs sm:text-sm">My Courses</p>
                      <p className="text-xl sm:text-2xl font-bold text-white">{lecturerStats?.totalCourses ?? '—'}</p>
                      <p className="text-blue-400 text-xs sm:text-sm">{lecturerStats?.todayClasses ?? 0} classes today</p>
                    </div>
                    <div className="h-10 w-10 sm:h-12 sm:w-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-lg sm:text-xl">📚</span>
                    </div>
                  </div>
                </div>

                <div className="card-hover bg-slate-800/50 backdrop-blur-sm p-4 sm:p-6 rounded-2xl border border-slate-700/50">
                  <div className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="text-slate-400 text-xs sm:text-sm">Students</p>
                      <p className="text-xl sm:text-2xl font-bold text-white">{lecturerStats?.totalStudents ?? '—'}</p>
                      <p className="text-green-400 text-xs sm:text-sm">In your department</p>
                    </div>
                    <div className="h-10 w-10 sm:h-12 sm:w-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-lg sm:text-xl">👥</span>
                    </div>
                  </div>
                </div>

                <div className="card-hover bg-slate-800/50 backdrop-blur-sm p-4 sm:p-6 rounded-2xl border border-slate-700/50">
                  <div className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="text-slate-400 text-xs sm:text-sm">This Week</p>
                      <p className="text-xl sm:text-2xl font-bold text-white">{lecturerStats?.totalClassesThisWeek ?? '—'}</p>
                      <p className="text-yellow-400 text-xs sm:text-sm">Scheduled classes</p>
                    </div>
                    <div className="h-10 w-10 sm:h-12 sm:w-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-lg sm:text-xl">🗓️</span>
                    </div>
                  </div>
                </div>

                <div className="card-hover bg-slate-800/50 backdrop-blur-sm p-4 sm:p-6 rounded-2xl border border-slate-700/50">
                  <div className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="text-slate-400 text-xs sm:text-sm">To Grade</p>
                      <p className="text-xl sm:text-2xl font-bold text-white">{lecturerStats?.pendingGrading ?? '—'}</p>
                      <p className="text-purple-400 text-xs sm:text-sm">{lecturerStats?.totalAssignments ?? 0} assignments • {lecturerStats?.totalQuizzes ?? 0} quizzes</p>
                    </div>
                    <div className="h-10 w-10 sm:h-12 sm:w-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-lg sm:text-xl">📝</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Activity & Upcoming Tasks */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
                {/* Recent Activities */}
                <div className="card-hover bg-slate-800/50 backdrop-blur-sm p-4 sm:p-6 rounded-2xl border border-slate-700/50">
                  <h3 className="text-base sm:text-lg font-bold text-white mb-4">Recent Activities</h3>
                  <div className="space-y-3">
                    {loadingActivities ? (
                      <div className="text-center py-6">
                        <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-500 border-t-transparent mx-auto mb-2"></div>
                        <p className="text-slate-500 text-xs">Loading...</p>
                      </div>
                    ) : recentActivities.length === 0 ? (
                      <div className="text-center py-6">
                        <span className="text-2xl">📋</span>
                        <p className="text-slate-500 text-xs mt-2">No activities yet. Start by scheduling a class or uploading materials.</p>
                      </div>
                    ) : (
                      recentActivities.map((activity) => (
                        <div key={activity._id} className="flex items-center space-x-3 p-3 bg-slate-700/30 rounded-lg hover:bg-slate-700/50 transition-colors">
                          <div className="h-8 w-8 rounded-full bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                            <span className="text-blue-400">{activity.icon}</span>
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-white font-medium text-sm sm:text-base truncate">{activity.title}</p>
                            <p className="text-slate-400 text-xs sm:text-sm truncate">{activity.description}</p>
                          </div>
                          <span className="text-slate-500 text-xs flex-shrink-0">{formatTimeAgo(activity.createdAt)}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Upcoming Tasks */}
                <div className="card-hover bg-slate-800/50 backdrop-blur-sm p-4 sm:p-6 rounded-2xl border border-slate-700/50">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-base sm:text-lg font-bold text-white">Upcoming Tasks</h3>
                    <span className="flex items-center gap-1.5 text-xs text-slate-500">
                      <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse"></span>
                      Live
                    </span>
                  </div>
                  <div className="space-y-3">
                    {loadingTasks ? (
                      <div className="text-center py-6">
                        <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-500 border-t-transparent mx-auto mb-2"></div>
                        <p className="text-slate-500 text-xs">Loading...</p>
                      </div>
                    ) : upcomingTasks.length === 0 ? (
                      <div className="text-center py-6">
                        <span className="text-2xl">✅</span>
                        <p className="text-slate-500 text-xs mt-2">You&apos;re all caught up. No grading, deadlines, or classes due soon.</p>
                      </div>
                    ) : (
                      upcomingTasks.map((task) => (
                        <div key={task.id} className="p-3 bg-slate-700/30 rounded-lg hover:bg-slate-700/50 transition-colors">
                          <div className="flex justify-between items-start gap-2">
                            <div className="flex items-start gap-2.5 min-w-0 flex-1">
                              <span className="text-lg leading-none mt-0.5 flex-shrink-0">{task.icon}</span>
                              <div className="min-w-0 flex-1">
                                <p className="text-white font-medium text-sm sm:text-base truncate">{task.task}</p>
                                <p className="text-slate-400 text-xs sm:text-sm">{task.deadline}</p>
                              </div>
                            </div>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium flex-shrink-0 ${
                              task.priority === 'high' ? 'bg-red-900/30 text-red-400' :
                              task.priority === 'medium' ? 'bg-yellow-900/30 text-yellow-400' :
                              'bg-green-900/30 text-green-400'
                            }`}>
                              {task.priority}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'qr-scanner' && (
            <QRScannerNew />
          )}

          {activeSection === 'student-history' && (
            <div className="space-y-6">
              <div className="card-hover bg-slate-800/50 backdrop-blur-sm p-6 rounded-2xl border border-slate-700/50">
                <h2 className="text-xl font-bold text-white mb-6">Student Attendance History</h2>
                <p className="text-slate-400 mb-4">Search for a student by their Student ID to view their attendance history</p>
                
                <div className="mb-6">
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Student ID
                  </label>
                  <input
                    type="text"
                    value={searchStudentId}
                    onChange={(e) => setSearchStudentId(e.target.value)}
                    placeholder="e.g., UNIBADAN-123456789"
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {searchStudentId && searchStudentId.length > 5 && (
                  <AttendanceHistory studentId={searchStudentId} />
                )}

                {(!searchStudentId || searchStudentId.length <= 5) && (
                  <div className="text-center py-12">
                    <div className="h-16 w-16 bg-slate-700/30 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="h-8 w-8 text-slate-400" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                      </svg>
                    </div>
                    <p className="text-slate-400">Enter a student ID to view their attendance history</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeSection === 'attendance' && (
            <AttendanceManagement
              onOpenScanner={(sessionId) => {
                sessionStorage.setItem('activeAttendanceSessionId', sessionId);
                setActiveSection('qr-scanner');
              }}
            />
          )}

          {activeSection === 'courses' && (
            <div className="space-y-5">
              {!selectedLecCourse ? (
                <>
                  <div className="section-card">
                    <h2 className="section-title text-base sm:text-lg">My Courses</h2>
                    <p className="section-subtitle">
                      {lecCourses.length} course{lecCourses.length !== 1 ? 's' : ''} total ·{' '}
                      {lecCourses.filter((c: any) => c.level === selectedLecCourseLevel).length} in {selectedLecCourseLevel}
                    </p>
                  </div>

                  <div className="flex items-center gap-1 p-1 rounded-lg overflow-x-auto"
                       style={{ background: 'var(--surface-0)', border: '1px solid var(--border-subtle)' }}>
                    {['100L', '200L', '300L', '400L', '500L', '600L'].map(level => {
                      const count = lecCourses.filter((c: any) => c.level === level).length;
                      const active = selectedLecCourseLevel === level;
                      return (
                        <button
                          key={level}
                          type="button"
                          onClick={() => setSelectedLecCourseLevel(level)}
                          className={`flex-1 min-w-[60px] px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap ${
                            active ? 'text-white' : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
                          }`}
                          style={active ? { background: 'var(--accent)' } : undefined}
                        >
                          <span>{level}</span>
                          {count > 0 && (
                            <span className={`text-[10px] tabular-nums ${active ? 'text-white/80' : 'text-[var(--text-muted)]'}`}>
                              {count}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {loadingLecCourses ? (
                    <div className="text-center py-16">
                      <div className="animate-spin rounded-full h-10 w-10 border-2 border-[var(--accent)] border-t-transparent mx-auto mb-3" />
                      <p className="text-[var(--text-muted)] text-sm">Loading courses…</p>
                    </div>
                  ) : lecCourses.filter((c: any) => c.level === selectedLecCourseLevel).length === 0 ? (
                    <div className="section-card text-center py-16">
                      <div className="h-12 w-12 rounded-full mx-auto mb-3 flex items-center justify-center"
                           style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}>
                        <Icon name="bookOpen" size={22} />
                      </div>
                      <p className="text-[var(--text-primary)] font-medium">No {selectedLecCourseLevel} courses</p>
                      <p className="text-[var(--text-muted)] text-sm mt-1">You have no courses assigned at this level.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {lecCourses.filter((c: any) => c.level === selectedLecCourseLevel).map((c: any) => (
                        <button
                          key={c._id}
                          type="button"
                          onClick={() => setSelectedLecCourse(c)}
                          className="section-card surface-hover text-left group"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="h-9 w-9 rounded-lg flex items-center justify-center shrink-0"
                                 style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}>
                              <span className="font-semibold text-[11px] tracking-wide">{c.courseCode.slice(0, 3).toUpperCase()}</span>
                            </div>
                            <span className="pill">{c.level}</span>
                          </div>
                          <h3 className="text-[var(--text-primary)] font-medium text-sm tracking-tight">{c.courseCode}</h3>
                          <p className="text-[var(--text-secondary)] text-xs mt-0.5 truncate">{c.courseName}</p>
                          <div className="flex items-center justify-end gap-1 mt-3 text-[var(--accent)] text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                            Manage
                            <Icon name="chevronRight" size={12} />
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div className="section-card">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 min-w-0 flex-1">
                        <button
                          type="button"
                          onClick={() => { setSelectedLecCourse(null); setLecMaterials([]); }}
                          className="btn btn-ghost p-2 shrink-0 -ml-2"
                          aria-label="Back"
                        >
                          <Icon name="chevronLeft" size={18} />
                        </button>
                        <div className="min-w-0">
                          <h2 className="text-[var(--text-primary)] text-lg font-semibold tracking-tight">
                            {selectedLecCourse.courseCode}
                            <span className="text-[var(--text-muted)] font-normal ml-1.5">· {selectedLecCourse.courseName}</span>
                          </h2>
                          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                            <span className="pill">{selectedLecCourse.department}</span>
                            <span className="pill">{selectedLecCourse.level}</span>
                          </div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => { setShowUploadModal(true); setUploadError(''); }}
                        className="btn btn-primary text-sm shrink-0"
                      >
                        <Icon name="upload" size={14} />
                        Upload
                      </button>
                    </div>
                  </div>

                  {uploadSuccess && (
                    <div className="rounded-lg p-3 text-sm"
                         style={{
                           background: 'rgba(16,185,129,0.08)',
                           border: '1px solid rgba(16,185,129,0.25)',
                           color: 'var(--success)',
                         }}>
                      {uploadSuccess}
                    </div>
                  )}

                  <div className="flex items-center gap-1 p-1 rounded-lg overflow-x-auto"
                       style={{ background: 'var(--surface-0)', border: '1px solid var(--border-subtle)' }}>
                    {[
                      { id: 'materials', label: 'Materials', icon: 'bookOpen' as const },
                      { id: 'announcements', label: 'Announcements', icon: 'megaphone' as const },
                      { id: 'assignments', label: 'Assignments', icon: 'edit' as const },
                      { id: 'quizzes', label: 'Quizzes', icon: 'award' as const },
                    ].map(tab => {
                      const active = courseTab === tab.id;
                      return (
                        <button
                          key={tab.id}
                          type="button"
                          onClick={() => setCourseTab(tab.id)}
                          className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${
                            active ? 'text-white' : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
                          }`}
                          style={active ? { background: 'var(--accent)' } : undefined}
                        >
                          <Icon name={tab.icon} size={14} />
                          <span>{tab.label}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Materials Tab */}
                  {courseTab === 'materials' && (
                  <>

                  {/* Upload Modal */}
                  {showUploadModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                      <div className="bg-slate-800 rounded-2xl p-6 max-w-md w-full border border-slate-700/80 shadow-2xl">
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="text-lg font-bold text-white flex items-center gap-2">📤 Upload Material</h3>
                          <button onClick={() => setShowUploadModal(false)} className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-700/50">
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                          </button>
                        </div>
                        {uploadError && <div className="bg-red-900/30 border border-red-700/50 text-red-400 p-3 rounded-lg mb-4 text-sm">{uploadError}</div>}
                        <div className="space-y-4">
                          <div>
                            <label className="block text-xs text-slate-400 mb-1">Title</label>
                            <input type="text" value={uploadForm.title} onChange={(e) => setUploadForm({...uploadForm, title: e.target.value})} placeholder="e.g. Week 3 - Linked Lists" className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-green-500/50" />
                          </div>
                          <div>
                            <label className="block text-xs text-slate-400 mb-1">Category</label>
                            <select value={uploadForm.category} onChange={(e) => setUploadForm({...uploadForm, category: e.target.value})} className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500/50">
                              {['Lecture Notes', 'Assignments', 'Past Questions', 'Textbooks', 'Slides', 'Lab Manuals', 'General'].map(cat => <option key={cat} value={cat}>{cat}</option>)}
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs text-slate-400 mb-1">Description (optional)</label>
                            <textarea value={uploadForm.description} onChange={(e) => setUploadForm({...uploadForm, description: e.target.value})} placeholder="Brief description..." className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-green-500/50 resize-none" rows={2} />
                          </div>
                          <div>
                            <label className="block text-xs text-slate-400 mb-1">File</label>
                            <input type="file" onChange={handleFileSelect} accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.png,.jpg,.jpeg" className="w-full text-sm text-slate-400 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:bg-slate-700 file:text-white hover:file:bg-slate-600 cursor-pointer" />
                            {uploadForm.fileName && <p className="text-xs text-green-400 mt-1">📎 {uploadForm.fileName} ({(uploadForm.fileSize / 1024).toFixed(0)} KB)</p>}
                          </div>
                          <div className="flex gap-3 pt-2">
                            <button onClick={() => setShowUploadModal(false)} disabled={uploading} className="flex-1 border border-slate-600 text-slate-300 py-2.5 rounded-lg hover:bg-slate-700/50 text-sm disabled:opacity-40">Cancel</button>
                            <button onClick={handleUploadMaterial} disabled={uploading} className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white py-2.5 rounded-lg hover:from-green-700 hover:to-emerald-700 text-sm font-medium disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                              {uploading ? (
                                <>
                                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                  Uploading...
                                </>
                              ) : 'Upload'}
                            </button>
                          </div>
                          {uploading && (
                            <div className="mt-3">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-xs text-green-400">Uploading {uploadForm.fileName}...</span>
                                <span className="text-xs text-slate-500">{(uploadForm.fileSize / 1024).toFixed(0)} KB</span>
                              </div>
                              <div className="w-full bg-slate-700 rounded-full h-1.5 overflow-hidden">
                                <div className="bg-gradient-to-r from-green-500 to-emerald-400 h-full rounded-full animate-pulse" style={{width: '100%'}}></div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Drag & Drop Zone */}
                  <div
                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleDrop}
                    className={`rounded-2xl border-2 border-dashed p-6 text-center transition-all cursor-pointer ${isDragging ? 'border-green-500 bg-green-500/10' : 'border-slate-600/30 hover:border-slate-500/40 bg-slate-800/20'}`}
                    onClick={() => { setShowUploadModal(true); setUploadError(''); }}
                  >
                    <div className={`text-3xl mb-2 transition-transform ${isDragging ? 'scale-110' : ''}`}>{isDragging ? '📥' : '📂'}</div>
                    <p className={`text-sm font-medium ${isDragging ? 'text-green-300' : 'text-slate-400'}`}>
                      {isDragging ? 'Drop file here' : 'Drag & drop a file here, or click to upload'}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">PDF, DOC, PPT, XLS, images</p>
                  </div>

                  {/* Download Analytics */}
                  {lecMaterials.length > 0 && (
                    <div className="bg-slate-800/40 rounded-2xl border border-slate-700/30 p-4">
                      <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                        <svg className="h-4 w-4 text-blue-400" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" /></svg>
                        Download Analytics
                      </h3>
                      <div className="grid grid-cols-3 gap-3 mb-4">
                        <div className="bg-slate-700/30 rounded-xl p-3 text-center">
                          <p className="text-lg font-bold text-white">{lecMaterials.length}</p>
                          <p className="text-[10px] text-slate-400">Materials</p>
                        </div>
                        <div className="bg-slate-700/30 rounded-xl p-3 text-center">
                          <p className="text-lg font-bold text-blue-300">{lecMaterials.reduce((sum: number, m: any) => sum + (m.downloads || 0), 0)}</p>
                          <p className="text-[10px] text-slate-400">Total Downloads</p>
                        </div>
                        <div className="bg-slate-700/30 rounded-xl p-3 text-center">
                          <p className="text-lg font-bold text-green-300">{lecMaterials.length > 0 ? Math.round(lecMaterials.reduce((sum: number, m: any) => sum + (m.downloads || 0), 0) / lecMaterials.length) : 0}</p>
                          <p className="text-[10px] text-slate-400">Avg / Material</p>
                        </div>
                      </div>
                      {/* Top Materials by Downloads */}
                      <p className="text-xs text-slate-500 mb-2">Most downloaded</p>
                      <div className="space-y-1.5">
                        {[...lecMaterials].sort((a: any, b: any) => (b.downloads || 0) - (a.downloads || 0)).slice(0, 5).map((m: any) => {
                          const maxDownloads = Math.max(...lecMaterials.map((x: any) => x.downloads || 0), 1);
                          const pct = ((m.downloads || 0) / maxDownloads) * 100;
                          return (
                            <div key={m._id} className="flex items-center gap-3">
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center justify-between mb-0.5">
                                  <p className="text-xs text-slate-300 truncate">{m.title}</p>
                                  <span className="text-[10px] text-slate-400 flex-shrink-0 ml-2">{m.downloads || 0}</span>
                                </div>
                                <div className="w-full bg-slate-700/50 rounded-full h-1">
                                  <div className="bg-gradient-to-r from-blue-500 to-purple-500 h-full rounded-full transition-all" style={{width: `${pct}%`}}></div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Materials List */}
                  {loadingLecMaterials ? (
                    <div className="text-center py-12">
                      <div className="animate-spin rounded-full h-10 w-10 border-2 border-green-500 border-t-transparent mx-auto mb-4"></div>
                      <p className="text-slate-400 text-sm">Loading materials...</p>
                    </div>
                  ) : lecMaterials.length === 0 ? (
                    <div className="bg-slate-800/30 rounded-2xl border border-slate-700/30 text-center py-12 px-6">
                      <div className="h-14 w-14 bg-slate-700/30 rounded-2xl flex items-center justify-center mx-auto mb-3"><span className="text-2xl">📤</span></div>
                      <p className="text-slate-300 font-medium mb-1">No materials uploaded</p>
                      <p className="text-slate-500 text-sm mb-4">Upload lecture notes, slides, and other materials for your students</p>
                      <button onClick={() => { setShowUploadModal(true); setUploadError(''); }} className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-5 py-2 rounded-xl text-sm">Upload First Material</button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {lecMaterials.map((m: any) => {
                        const fileIcon = m.fileType?.includes('pdf') ? '📕' : m.fileType?.includes('image') ? '🖼️' : m.fileType?.includes('word') || m.fileType?.includes('document') ? '📘' : m.fileType?.includes('presentation') || m.fileType?.includes('powerpoint') ? '📙' : '📄';
                        return (
                          <div key={m._id} className="group bg-slate-800/40 rounded-xl border border-slate-700/30 p-4 hover:border-slate-600/40 transition-all flex items-center gap-4">
                            <div className="h-11 w-11 bg-slate-700/40 rounded-xl flex items-center justify-center flex-shrink-0 text-xl">{fileIcon}</div>
                            <div className="min-w-0 flex-1">
                              <h4 className="text-white font-medium text-sm truncate">{m.title}</h4>
                              <div className="flex items-center gap-3 mt-1">
                                <span className="text-[11px] text-green-400/70 bg-green-600/10 px-2 py-0.5 rounded">{m.category}</span>
                                <span className="text-[11px] text-slate-500">{m.fileName}</span>
                                <span className="text-[11px] text-slate-500">{m.downloads} download{m.downloads !== 1 ? 's' : ''}</span>
                              </div>
                              <p className="text-[10px] text-slate-600 mt-1">{new Date(m.createdAt).toLocaleDateString()}</p>
                            </div>
                            <button onClick={() => handleDeleteMaterial(m._id)} className="flex-shrink-0 text-red-400 hover:text-red-300 p-2 rounded-lg hover:bg-red-500/10 transition-all opacity-0 group-hover:opacity-100" title="Delete">
                              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                  </>
                  )}

                  {/* Announcements Tab */}
                  {courseTab === 'announcements' && (
                    <div className="space-y-4">
                      {/* Post Announcement */}
                      <div className="bg-slate-800/40 rounded-2xl border border-slate-700/30 p-4">
                        <textarea value={announcementMsg} onChange={(e) => setAnnouncementMsg(e.target.value)} placeholder="Write an announcement for your students..." className="w-full bg-slate-700/50 border border-slate-600/30 rounded-xl p-3 text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none" rows={3} />
                        <div className="flex justify-end mt-2">
                          <button onClick={postAnnouncement} disabled={!announcementMsg.trim()} className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-xl text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed">Post Announcement</button>
                        </div>
                      </div>
                      {/* Announcement List */}
                      {lecAnnouncements.length === 0 ? (
                        <div className="text-center py-10">
                          <span className="text-3xl">📢</span>
                          <p className="text-slate-400 text-sm mt-2">No announcements yet</p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {lecAnnouncements.map((a: any) => (
                            <div key={a._id} className="group bg-slate-800/40 rounded-xl border border-slate-700/30 p-4 hover:border-slate-600/40 transition-all">
                              <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0 flex-1">
                                  <p className="text-white text-sm">{a.message}</p>
                                  <p className="text-[10px] text-slate-500 mt-2">{new Date(a.createdAt).toLocaleString()}</p>
                                </div>
                                <button onClick={() => deleteAnnouncement(a._id)} className="text-red-400 hover:text-red-300 p-1.5 rounded-lg hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-all flex-shrink-0" title="Delete">
                                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Assignments Tab */}
                  {courseTab === 'assignments' && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <h3 className="section-title text-sm sm:text-base">Assignments</h3>
                          <p className="section-subtitle">
                            {lecAssignments.length === 0
                              ? 'Create and grade coursework'
                              : `${lecAssignments.length} assignment${lecAssignments.length !== 1 ? 's' : ''} · ${lecAssignments.reduce((sum: number, a: any) => sum + (a.submissions || 0), 0)} submission${lecAssignments.reduce((sum: number, a: any) => sum + (a.submissions || 0), 0) !== 1 ? 's' : ''}`}
                          </p>
                        </div>
                        <button
                          onClick={() => { setShowAssignmentModal(true); setAssignmentError(''); }}
                          className="btn btn-primary text-sm shrink-0"
                        >
                          <Icon name="plus" size={14} />
                          <span className="hidden min-[420px]:inline">New Assignment</span>
                          <span className="inline min-[420px]:hidden">New</span>
                        </button>
                      </div>

                      {/* Assignment Modal */}
                      {showAssignmentModal && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                          <div className="rounded-2xl p-6 max-w-md w-full shadow-2xl"
                               style={{ background: 'var(--surface-1)', border: '1px solid var(--border-default)' }}>
                            <div className="flex items-start justify-between mb-5">
                              <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0"
                                     style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}>
                                  <Icon name="edit" size={18} />
                                </div>
                                <div>
                                  <h3 className="text-[var(--text-primary)] text-base font-semibold">Create Assignment</h3>
                                  <p className="text-[var(--text-muted)] text-xs mt-0.5">Students will be able to submit before the deadline</p>
                                </div>
                              </div>
                              <button onClick={() => setShowAssignmentModal(false)} className="btn btn-ghost p-1.5" aria-label="Close">
                                <Icon name="close" size={18} />
                              </button>
                            </div>
                            {assignmentError && (
                              <div className="rounded-lg p-3 mb-4 text-sm flex items-center gap-2"
                                   style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', color: 'var(--danger)' }}>
                                <Icon name="alert" size={16} />
                                {assignmentError}
                              </div>
                            )}
                            <div className="space-y-4">
                              <div>
                                <label className="block text-xs font-medium text-[var(--text-muted)] mb-1.5 uppercase tracking-wider">Title</label>
                                <input type="text" value={assignmentForm.title} onChange={(e) => setAssignmentForm(p => ({...p, title: e.target.value}))} placeholder="e.g. Assignment 1 - Arrays" className="input" />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-[var(--text-muted)] mb-1.5 uppercase tracking-wider">Description (optional)</label>
                                <textarea value={assignmentForm.description} onChange={(e) => setAssignmentForm(p => ({...p, description: e.target.value}))} placeholder="Instructions..." className="textarea resize-none" rows={3} />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-[var(--text-muted)] mb-1.5 uppercase tracking-wider">Deadline</label>
                                <input type="datetime-local" value={assignmentForm.deadline} onChange={(e) => setAssignmentForm(p => ({...p, deadline: e.target.value}))} className="input" />
                              </div>
                              <div className="flex gap-3 pt-2">
                                <button onClick={() => setShowAssignmentModal(false)} className="btn btn-secondary flex-1">Cancel</button>
                                <button onClick={createAssignment} className="btn btn-primary flex-1">Create</button>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Submissions Viewer */}
                      {viewingSubmissions && (
                        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4">
                          <div className="rounded-t-2xl sm:rounded-2xl w-full max-w-2xl shadow-2xl max-h-[92vh] sm:max-h-[85vh] flex flex-col overflow-hidden"
                               style={{ background: 'var(--surface-1)', border: '1px solid var(--border-default)' }}>
                            {/* Header */}
                            <div className="flex items-start justify-between gap-3 p-5 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
                              <div className="flex items-center gap-3 min-w-0">
                                <div className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0"
                                     style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}>
                                  <Icon name="clipboardCheck" size={18} />
                                </div>
                                <div className="min-w-0">
                                  <h3 className="text-[var(--text-primary)] text-base font-semibold truncate">Submissions</h3>
                                  <p className="text-[var(--text-muted)] text-xs truncate">{viewingSubmissions.title} · {submissions.length} submitted</p>
                                </div>
                              </div>
                              <button onClick={() => { setViewingSubmissions(null); setSubmissions([]); setShowPlagiarism(false); setPlagiarismResults([]); }} className="btn btn-ghost p-1.5 shrink-0" aria-label="Close">
                                <Icon name="close" size={18} />
                              </button>
                            </div>

                            <div className="p-5 overflow-y-auto">
                            {/* Action bar: Max score + plagiarism */}
                            <div className="mb-4 rounded-xl p-3 flex flex-wrap items-center gap-3"
                                 style={{ background: 'var(--surface-0)', border: '1px solid var(--border-subtle)' }}>
                              <span className="text-xs text-[var(--text-muted)] font-medium uppercase tracking-wider shrink-0">Max Score</span>
                              <input
                                type="number"
                                min="1"
                                value={assignmentMaxScore}
                                onChange={(e) => setAssignmentMaxScore(parseInt(e.target.value) || 100)}
                                className="input w-20 text-center py-1.5"
                              />
                              <button
                                onClick={() => saveMaxScore(viewingSubmissions._id, assignmentMaxScore)}
                                disabled={savingMaxScore}
                                className="btn btn-secondary text-xs"
                              >
                                {savingMaxScore ? 'Saving…' : 'Set for all'}
                              </button>
                              {submissions.length >= 2 && (
                                <button
                                  onClick={() => checkPlagiarism(viewingSubmissions._id)}
                                  disabled={checkingPlagiarism}
                                  className="btn btn-primary text-xs ml-auto"
                                >
                                  {checkingPlagiarism ? (
                                    <><svg className="animate-spin h-3.5 w-3.5" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>Checking…</>
                                  ) : (
                                    <><Icon name="alert" size={14} />Check plagiarism</>
                                  )}
                                </button>
                              )}
                            </div>

                            {/* Plagiarism Results */}
                            {showPlagiarism && (
                              <div className="mb-4 rounded-xl overflow-hidden" style={{ background: 'var(--surface-0)', border: '1px solid var(--border-subtle)' }}>
                                <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
                                  <h4 className="text-sm font-semibold text-[var(--text-primary)] flex items-center gap-2">
                                    <Icon name="alert" size={15} style={{ color: 'var(--warning)' }} />
                                    Plagiarism Report
                                  </h4>
                                  <button onClick={() => setShowPlagiarism(false)} className="text-[var(--text-muted)] hover:text-[var(--text-primary)] text-xs">Hide</button>
                                </div>
                                <div className="p-4">
                                  {plagiarismResults.length === 0 ? (
                                    <div className="text-center py-4">
                                      <div className="h-10 w-10 rounded-full mx-auto mb-2 flex items-center justify-center"
                                           style={{ background: 'rgba(16,185,129,0.1)', color: 'var(--success)' }}>
                                        <Icon name="check" size={18} />
                                      </div>
                                      <p className="text-[var(--success)] text-sm font-medium">No plagiarism detected</p>
                                      <p className="text-[var(--text-muted)] text-xs mt-1">All submissions appear to be original</p>
                                    </div>
                                  ) : (
                                    <div className="space-y-2">
                                      <p className="text-[var(--text-muted)] text-xs mb-3">{plagiarismResults.length} suspicious pair{plagiarismResults.length !== 1 ? 's' : ''} found</p>
                                      {plagiarismResults.map((r: any, i: number) => {
                                        const tone = r.level === 'high'
                                          ? { bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.25)', bar: 'var(--danger)', text: 'var(--danger)' }
                                          : r.level === 'medium'
                                          ? { bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.25)', bar: 'var(--warning)', text: 'var(--warning)' }
                                          : { bg: 'rgba(245,158,11,0.05)', border: 'rgba(245,158,11,0.18)', bar: 'var(--warning)', text: 'var(--warning)' };
                                        return (
                                        <div key={i} className="rounded-lg p-3" style={{ background: tone.bg, border: `1px solid ${tone.border}` }}>
                                          <div className="flex items-center justify-between mb-1.5 gap-2">
                                            <div className="flex items-center gap-2 min-w-0 flex-1">
                                              <span className="text-[var(--text-primary)] text-sm font-medium truncate">{r.studentA}</span>
                                              <span className="text-[var(--text-muted)] text-xs shrink-0">↔</span>
                                              <span className="text-[var(--text-primary)] text-sm font-medium truncate">{r.studentB}</span>
                                            </div>
                                            <span className="text-xs font-bold shrink-0 tabular-nums" style={{ color: tone.text }}>{r.similarity}%</span>
                                          </div>
                                          <div className="w-full rounded-full h-1.5" style={{ background: 'var(--surface-2)' }}>
                                            <div className="h-1.5 rounded-full" style={{ width: `${r.similarity}%`, background: tone.bar }}></div>
                                          </div>
                                          {r.breakdown && (
                                            <div className="flex gap-3 mt-1.5 flex-wrap">
                                              <span className="text-[10px] text-[var(--text-muted)]">Words: <span className="text-[var(--text-secondary)]">{r.breakdown.wordSimilarity}%</span></span>
                                              <span className="text-[10px] text-[var(--text-muted)]">Phrases: <span className="text-[var(--text-secondary)]">{r.breakdown.phraseSimilarity}%</span></span>
                                              <span className="text-[10px] text-[var(--text-muted)]">Structure: <span className="text-[var(--text-secondary)]">{r.breakdown.structureSimilarity}%</span></span>
                                            </div>
                                          )}
                                          <p className="text-[10px] mt-1" style={{ color: tone.text }}>
                                            {r.level === 'high' ? 'Very likely copied' : r.level === 'medium' ? 'Suspicious — needs review' : 'Some overlap detected'}
                                          </p>
                                        </div>
                                        );
                                      })}
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}

                            {submissions.length === 0 ? (
                              <div className="text-center py-10">
                                <div className="h-12 w-12 rounded-full mx-auto mb-3 flex items-center justify-center"
                                     style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}>
                                  <Icon name="clipboardCheck" size={22} />
                                </div>
                                <p className="text-[var(--text-primary)] font-medium">No submissions yet</p>
                                <p className="text-[var(--text-muted)] text-sm mt-1">Submissions will appear here once students upload their work.</p>
                              </div>
                            ) : (
                              <div className="space-y-2">
                                {submissions.map((s: any) => {
                                  const graded = s.score !== undefined && s.score !== null;
                                  const ratio = graded ? s.score / (s.maxScore || 100) : 0;
                                  const gradeClass = ratio >= 0.7 ? 'pill-success' : ratio >= 0.5 ? 'pill-warning' : 'pill-danger';
                                  return (
                                  <div key={s._id} className="rounded-xl p-3" style={{ background: 'var(--surface-0)', border: '1px solid var(--border-subtle)' }}>
                                    <div className="flex items-center gap-3">
                                      <div className="h-9 w-9 rounded-full flex items-center justify-center text-xs font-semibold shrink-0"
                                           style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}>
                                        {s.studentName?.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()}
                                      </div>
                                      <div className="min-w-0 flex-1">
                                        <p className="text-[var(--text-primary)] text-sm font-medium truncate">{s.studentName}</p>
                                        <p className="text-[var(--text-muted)] text-xs truncate">{s.fileName} · {new Date(s.submittedAt).toLocaleString([], { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</p>
                                        {s.comment && <p className="text-[var(--text-muted)] text-xs mt-0.5 italic truncate">&ldquo;{s.comment}&rdquo;</p>}
                                      </div>
                                      <div className="flex items-center gap-0.5 shrink-0">
                                        <button onClick={() => openSubmissionPreview(s)} className="btn btn-ghost p-1.5" title="Preview" style={{ color: 'var(--success)' }}>
                                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                        </button>
                                        <button onClick={() => { setGradingSubmission(s); setGradeForm({ score: s.score?.toString() || '', feedback: s.feedback || '' }); }} className="btn btn-ghost p-1.5" title="Grade" style={{ color: 'var(--accent)' }}>
                                          <Icon name="award" size={16} />
                                        </button>
                                        <button onClick={async () => {
                                          try {
                                            const token = sessionStorage.getItem('accessToken');
                                            if (!token) return;
                                            const res = await fetch(getApiUrl(`/api/course/submission/${s._id}/download`), { headers: { 'Authorization': `Bearer ${token}` } });
                                            if (res.ok) {
                                              const data = await res.json();
                                              const link = document.createElement('a');
                                              link.href = `data:${data.fileType};base64,${data.fileData}`;
                                              link.download = data.fileName;
                                              link.click();
                                            }
                                          } catch {}
                                        }} className="btn btn-ghost p-1.5" title="Download">
                                          <Icon name="download" size={16} />
                                        </button>
                                      </div>
                                    </div>
                                    {graded && (
                                      <div className="mt-2 ml-12 flex items-center gap-2 flex-wrap">
                                        <span className={`pill ${gradeClass}`}>{s.score}/{s.maxScore || 100}</span>
                                        {s.feedback && <span className="text-[var(--text-muted)] text-xs truncate max-w-[220px]" title={s.feedback}>{s.feedback}</span>}
                                      </div>
                                    )}
                                  </div>
                                  );
                                })}
                              </div>
                            )}
                            </div>

                            {/* Grading Modal */}
                            {gradingSubmission && (
                              <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                                <div className="rounded-2xl p-6 max-w-sm w-full shadow-2xl"
                                     style={{ background: 'var(--surface-1)', border: '1px solid var(--border-default)' }}>
                                  <div className="flex items-start justify-between mb-5">
                                    <div className="flex items-center gap-3">
                                      <div className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0"
                                           style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}>
                                        <Icon name="award" size={18} />
                                      </div>
                                      <div>
                                        <h3 className="text-[var(--text-primary)] text-base font-semibold">Grade Submission</h3>
                                        <p className="text-[var(--text-muted)] text-xs mt-0.5">{gradingSubmission.studentName}</p>
                                      </div>
                                    </div>
                                    <button onClick={() => { setGradingSubmission(null); setGradeForm({ score: '', feedback: '' }); }} className="btn btn-ghost p-1.5" aria-label="Close">
                                      <Icon name="close" size={18} />
                                    </button>
                                  </div>
                                  <div className="space-y-4">
                                    <div>
                                      <label className="block text-xs font-medium text-[var(--text-muted)] mb-1.5 uppercase tracking-wider">Score (out of {assignmentMaxScore})</label>
                                      <input type="number" min="0" max={assignmentMaxScore} value={gradeForm.score} onChange={(e) => setGradeForm(p => ({...p, score: e.target.value}))} placeholder={`0 - ${assignmentMaxScore}`} className="input" />
                                    </div>
                                    {gradeForm.score && (
                                      <div className="rounded-lg p-3 text-center" style={{ background: 'var(--surface-0)', border: '1px solid var(--border-subtle)' }}>
                                        <span className="text-2xl font-bold" style={{ color: (parseFloat(gradeForm.score) / assignmentMaxScore) >= 0.7 ? 'var(--success)' : (parseFloat(gradeForm.score) / assignmentMaxScore) >= 0.5 ? 'var(--warning)' : 'var(--danger)' }}>{Math.round((parseFloat(gradeForm.score) / assignmentMaxScore) * 100)}%</span>
                                        <p className="text-[var(--text-muted)] text-xs mt-1">{gradeForm.score} / {assignmentMaxScore}</p>
                                      </div>
                                    )}
                                    <div>
                                      <label className="block text-xs font-medium text-[var(--text-muted)] mb-1.5 uppercase tracking-wider">Feedback (optional)</label>
                                      <textarea value={gradeForm.feedback} onChange={(e) => setGradeForm(p => ({...p, feedback: e.target.value}))} placeholder="Great work! / Needs improvement on..." className="textarea resize-none" rows={3} />
                                    </div>
                                    <div className="flex gap-3">
                                      <button onClick={() => { setGradingSubmission(null); setGradeForm({ score: '', feedback: '' }); }} className="btn btn-secondary flex-1">Cancel</button>
                                      <button onClick={gradeSubmission} disabled={!gradeForm.score || gradingLoading} className="btn btn-primary flex-1">
                                        {gradingLoading ? <><svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>Saving…</> : 'Save Grade'}
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Submission Preview Modal */}
                            {previewingSubmission && (
                              <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex flex-col">
                                <div className="flex items-center justify-between px-4 py-3 bg-slate-900/90 border-b border-slate-700/50">
                                  <div className="min-w-0 flex-1">
                                    <h3 className="text-white font-semibold text-sm truncate">{previewingSubmission.fileName}</h3>
                                    <p className="text-slate-400 text-xs">{previewingSubmission.studentName} • {new Date(previewingSubmission.submittedAt).toLocaleString()}</p>
                                  </div>
                                  <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                                    <button onClick={async () => {
                                      try {
                                        const token = sessionStorage.getItem('accessToken');
                                        if (!token) return;
                                        const res = await fetch(getApiUrl(`/api/course/submission/${previewingSubmission._id}/download`), { headers: { 'Authorization': `Bearer ${token}` } });
                                        if (res.ok) {
                                          const data = await res.json();
                                          const link = document.createElement('a');
                                          link.href = `data:${data.fileType};base64,${data.fileData}`;
                                          link.download = data.fileName;
                                          link.click();
                                        }
                                      } catch {}
                                    }} className="text-blue-400 hover:text-blue-300 px-3 py-1.5 rounded-lg hover:bg-blue-500/10 text-xs font-medium flex items-center gap-1.5 transition-colors">
                                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" /></svg>
                                      Download
                                    </button>
                                    <button onClick={() => { setPreviewingSubmission(null); setPreviewData(''); }} className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-700/50 transition-colors">
                                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                                    </button>
                                  </div>
                                </div>
                                <div className="flex-1 overflow-auto">
                                  {previewLoading ? (
                                    <div className="flex items-center justify-center h-full">
                                      <div className="text-center">
                                        <div className="animate-spin rounded-full h-10 w-10 border-2 border-blue-500 border-t-transparent mx-auto mb-3"></div>
                                        <p className="text-slate-400 text-sm">Loading preview...</p>
                                      </div>
                                    </div>
                                  ) : previewData === '__unsupported__' ? (
                                    <div className="flex items-center justify-center h-full">
                                      <div className="text-center">
                                        <span className="text-4xl">📄</span>
                                        <p className="text-slate-300 text-sm font-medium mt-3">Preview not available for this file type</p>
                                        <p className="text-slate-500 text-xs mt-1">Download the file to view it</p>
                                      </div>
                                    </div>
                                  ) : previewData === '__error__' ? (
                                    <div className="flex items-center justify-center h-full">
                                      <div className="text-center">
                                        <span className="text-4xl">⚠️</span>
                                        <p className="text-red-400 text-sm font-medium mt-3">Failed to load preview</p>
                                      </div>
                                    </div>
                                  ) : previewData.startsWith('blob:') ? (
                                    <iframe src={previewData} className="w-full h-full border-0" title="PDF Preview" />
                                  ) : previewData.startsWith('<') ? (
                                    <div className="max-w-4xl mx-auto p-6">
                                      <div className="bg-slate-800/80 border border-slate-700/50 rounded-xl p-6 prose prose-invert prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: previewData }} />
                                    </div>
                                  ) : (
                                    <div className="max-w-4xl mx-auto p-6">
                                      <pre className="bg-slate-800/80 border border-slate-700/50 rounded-xl p-6 text-slate-300 text-sm leading-relaxed whitespace-pre-wrap font-mono overflow-auto">{previewData}</pre>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Assignment List */}
                      {lecAssignments.length === 0 ? (
                        <div className="text-center py-12">
                          <div className="h-12 w-12 rounded-full mx-auto mb-3 flex items-center justify-center"
                               style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}>
                            <Icon name="edit" size={22} />
                          </div>
                          <p className="text-[var(--text-primary)] font-medium">No assignments yet</p>
                          <p className="text-[var(--text-muted)] text-sm mt-1 mb-4">Create your first assignment for students to submit.</p>
                          <button
                            onClick={() => { setShowAssignmentModal(true); setAssignmentError(''); }}
                            className="btn btn-primary text-sm"
                          >
                            <Icon name="plus" size={14} />
                            New Assignment
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-2.5">
                          {lecAssignments.map((a: any) => {
                            const isPast = new Date() > new Date(a.deadline);
                            const daysLeft = Math.ceil((new Date(a.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                            const subs = a.submissions || 0;
                            return (
                              <div
                                key={a._id}
                                className="group rounded-xl p-3.5 sm:p-4 transition-colors"
                                style={{
                                  background: 'var(--surface-1)',
                                  border: '1px solid var(--border-subtle)',
                                  opacity: isPast ? 0.7 : 1,
                                }}
                              >
                                <div className="flex items-start gap-3">
                                  <div className="h-9 w-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                                       style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}>
                                    <Icon name="edit" size={16} />
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <h4 className="text-[var(--text-primary)] font-medium text-sm">{a.title}</h4>
                                      {isPast ? (
                                        <span className="pill">Closed</span>
                                      ) : daysLeft <= 2 ? (
                                        <span className="pill pill-danger">Due soon</span>
                                      ) : (
                                        <span className="pill pill-success">{daysLeft} day{daysLeft !== 1 ? 's' : ''} left</span>
                                      )}
                                    </div>
                                    {a.description && <p className="text-[var(--text-secondary)] text-xs mt-1 line-clamp-2">{a.description}</p>}
                                    <div className="flex items-center gap-x-3 gap-y-1 mt-2 flex-wrap">
                                      <span className="text-[11px] text-[var(--text-muted)] flex items-center gap-1.5">
                                        <Icon name="clock" size={11} />
                                        {new Date(a.deadline).toLocaleString([], { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                      </span>
                                      <span className="text-[11px] flex items-center gap-1.5" style={{ color: subs > 0 ? 'var(--accent)' : 'var(--text-muted)' }}>
                                        <Icon name="clipboardCheck" size={11} />
                                        {subs} submission{subs !== 1 ? 's' : ''}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-0.5 shrink-0">
                                    <button
                                      onClick={() => { setViewingSubmissions(a); fetchSubmissions(a._id); setAssignmentMaxScore(a.maxScore || 100); }}
                                      className="btn btn-secondary text-xs"
                                      title="View submissions"
                                    >
                                      <Icon name="clipboardCheck" size={14} />
                                      <span className="hidden sm:inline">Submissions</span>
                                    </button>
                                    <button
                                      onClick={() => deleteAssignment(a._id)}
                                      className="btn btn-ghost p-1.5 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
                                      title="Delete"
                                      style={{ color: 'var(--danger)' }}
                                    >
                                      <Icon name="trash" size={14} />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Quizzes Tab */}
                  {courseTab === 'quizzes' && (
                    <div className="space-y-4">
                      <div className="flex justify-end">
                        <button onClick={() => { setShowCreateQuiz(true); setQuizError(''); setQuizQuestions([]); }} className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2">
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
                          New Quiz
                        </button>
                      </div>

                      {/* Create Quiz Modal */}
                      {showCreateQuiz && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                          <div className="bg-slate-800 rounded-2xl p-6 max-w-2xl w-full border border-slate-700/80 shadow-2xl max-h-[90vh] overflow-y-auto">
                            <div className="flex justify-between items-center mb-4">
                              <h3 className="text-lg font-bold text-white">🧠 Create Quiz</h3>
                              <button onClick={() => setShowCreateQuiz(false)} className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-700/50">
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                              </button>
                            </div>
                            {quizError && <div className="bg-red-900/30 border border-red-700/50 text-red-400 p-3 rounded-lg mb-4 text-sm">{quizError}</div>}
                            <div className="space-y-4">
                              <div>
                                <label className="block text-xs text-slate-400 mb-1">Title</label>
                                <input type="text" value={quizForm.title} onChange={(e) => setQuizForm(p => ({...p, title: e.target.value}))} placeholder="e.g. Week 3 Quiz" className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50" />
                              </div>
                              <div className="grid grid-cols-3 gap-3">
                                <div>
                                  <label className="block text-xs text-slate-400 mb-1">Time Limit (min)</label>
                                  <input type="number" min="1" value={quizForm.timeLimit} onChange={(e) => setQuizForm(p => ({...p, timeLimit: parseInt(e.target.value) || 30}))} className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50" />
                                </div>
                                <div>
                                  <label className="block text-xs text-slate-400 mb-1">Start Date</label>
                                  <input type="datetime-local" value={quizForm.startDate} onChange={(e) => setQuizForm(p => ({...p, startDate: e.target.value}))} className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50" />
                                </div>
                                <div>
                                  <label className="block text-xs text-slate-400 mb-1">End Date</label>
                                  <input type="datetime-local" value={quizForm.endDate} onChange={(e) => setQuizForm(p => ({...p, endDate: e.target.value}))} className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50" />
                                </div>
                              </div>
                              <div className="flex gap-4">
                                <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer"><input type="checkbox" checked={quizForm.randomizeQuestions} onChange={(e) => setQuizForm(p => ({...p, randomizeQuestions: e.target.checked}))} className="rounded" /> Randomize questions</label>
                                <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer"><input type="checkbox" checked={quizForm.randomizeOptions} onChange={(e) => setQuizForm(p => ({...p, randomizeOptions: e.target.checked}))} className="rounded" /> Shuffle options</label>
                                <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer"><input type="checkbox" checked={quizForm.showOneAtATime} onChange={(e) => setQuizForm(p => ({...p, showOneAtATime: e.target.checked}))} className="rounded" /> One at a time</label>
                              </div>
                              <div className="border-t border-slate-700/50 pt-4">
                                <div className="flex justify-between items-center mb-3">
                                  <h4 className="text-sm font-semibold text-white">Questions ({quizQuestions.length})</h4>
                                  <div className="flex gap-2">
                                    <button onClick={() => setQuizQuestions(p => [...p, { type: 'mcq', text: '', options: ['', '', '', ''], correctAnswer: 0, points: 1 }])} className="text-xs bg-blue-600/20 text-blue-300 px-2.5 py-1 rounded-lg hover:bg-blue-600/30">+ MCQ</button>
                                    <button onClick={() => setQuizQuestions(p => [...p, { type: 'true_false', text: '', correctAnswer: true, points: 1 }])} className="text-xs bg-green-600/20 text-green-300 px-2.5 py-1 rounded-lg hover:bg-green-600/30">+ True/False</button>
                                    <button onClick={() => setQuizQuestions(p => [...p, { type: 'short_answer', text: '', points: 1 }])} className="text-xs bg-orange-600/20 text-orange-300 px-2.5 py-1 rounded-lg hover:bg-orange-600/30">+ Short Answer</button>
                                  </div>
                                </div>
                                <div className="space-y-3 max-h-[40vh] overflow-y-auto">
                                  {quizQuestions.map((q: any, qi: number) => (
                                    <div key={qi} className="bg-slate-700/30 rounded-xl p-4 border border-slate-600/20">
                                      <div className="flex justify-between items-start mb-2">
                                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${q.type === 'mcq' ? 'bg-blue-600/20 text-blue-300' : q.type === 'true_false' ? 'bg-green-600/20 text-green-300' : 'bg-orange-600/20 text-orange-300'}`}>{q.type === 'mcq' ? 'MCQ' : q.type === 'true_false' ? 'True/False' : 'Short Answer'}</span>
                                        <button onClick={() => setQuizQuestions(p => p.filter((_, i) => i !== qi))} className="text-red-400 hover:text-red-300 text-xs">Remove</button>
                                      </div>
                                      <input type="text" value={q.text} onChange={(e) => { const nq = [...quizQuestions]; nq[qi] = {...nq[qi], text: e.target.value}; setQuizQuestions(nq); }} placeholder={`Question ${qi + 1}`} className="w-full px-3 py-2 bg-slate-700/70 border border-slate-600/50 rounded-lg text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 mb-2" />
                                      <div className="flex items-center gap-2 mb-2">
                                        <label className="text-[10px] text-slate-500">Points:</label>
                                        <input type="number" min="1" value={q.points} onChange={(e) => { const nq = [...quizQuestions]; nq[qi] = {...nq[qi], points: parseInt(e.target.value) || 1}; setQuizQuestions(nq); }} className="w-16 px-2 py-1 bg-slate-700/70 border border-slate-600/50 rounded text-white text-xs focus:outline-none" />
                                      </div>
                                      {q.type === 'mcq' && (
                                        <div className="space-y-1.5">
                                          {q.options.map((opt: string, oi: number) => (
                                            <div key={oi} className="flex items-center gap-2">
                                              <input type="radio" name={`q${qi}-correct`} checked={q.correctAnswer === oi} onChange={() => { const nq = [...quizQuestions]; nq[qi] = {...nq[qi], correctAnswer: oi}; setQuizQuestions(nq); }} className="text-purple-500" />
                                              <input type="text" value={opt} onChange={(e) => { const nq = [...quizQuestions]; const opts = [...nq[qi].options]; opts[oi] = e.target.value; nq[qi] = {...nq[qi], options: opts}; setQuizQuestions(nq); }} placeholder={`Option ${oi + 1}`} className="flex-1 px-2 py-1.5 bg-slate-700/50 border border-slate-600/40 rounded text-white text-xs placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-purple-500/50" />
                                              {q.options.length > 2 && <button onClick={() => { const nq = [...quizQuestions]; const opts = nq[qi].options.filter((_: any, i: number) => i !== oi); const ca = nq[qi].correctAnswer >= oi ? Math.max(0, nq[qi].correctAnswer - 1) : nq[qi].correctAnswer; nq[qi] = {...nq[qi], options: opts, correctAnswer: ca}; setQuizQuestions(nq); }} className="text-red-400 text-xs">✕</button>}
                                            </div>
                                          ))}
                                          <button onClick={() => { const nq = [...quizQuestions]; nq[qi] = {...nq[qi], options: [...nq[qi].options, '']}; setQuizQuestions(nq); }} className="text-[10px] text-purple-400 hover:text-purple-300">+ Add option</button>
                                        </div>
                                      )}
                                      {q.type === 'true_false' && (
                                        <div className="flex gap-3">
                                          <label className="flex items-center gap-1.5 text-xs text-slate-300 cursor-pointer"><input type="radio" name={`q${qi}-tf`} checked={q.correctAnswer === true} onChange={() => { const nq = [...quizQuestions]; nq[qi] = {...nq[qi], correctAnswer: true}; setQuizQuestions(nq); }} /> True</label>
                                          <label className="flex items-center gap-1.5 text-xs text-slate-300 cursor-pointer"><input type="radio" name={`q${qi}-tf`} checked={q.correctAnswer === false} onChange={() => { const nq = [...quizQuestions]; nq[qi] = {...nq[qi], correctAnswer: false}; setQuizQuestions(nq); }} /> False</label>
                                        </div>
                                      )}
                                      {q.type === 'short_answer' && (
                                        <div>
                                          <input type="text" value={q.modelAnswer || ''} onChange={(e) => { const nq = [...quizQuestions]; nq[qi] = {...nq[qi], modelAnswer: e.target.value}; setQuizQuestions(nq); }} placeholder="Model answer (for auto-similarity scoring)" className="w-full px-2 py-1.5 bg-slate-700/50 border border-slate-600/40 rounded text-white text-xs placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-purple-500/50" />
                                          <p className="text-[10px] text-slate-500 mt-1 italic">Used to suggest scores based on similarity. Leave blank for fully manual grading.</p>
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                              <div className="flex gap-3 pt-2">
                                <button onClick={() => setShowCreateQuiz(false)} className="flex-1 border border-slate-600 text-slate-300 py-2.5 rounded-lg hover:bg-slate-700/50 text-sm">Cancel</button>
                                <button onClick={createQuiz} className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-2.5 rounded-lg text-sm font-medium">Create Quiz</button>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Attempts Viewer */}
                      {viewingQuizAttempts && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                          <div className="bg-slate-800 rounded-2xl p-6 max-w-lg w-full border border-slate-700/80 shadow-2xl max-h-[80vh] overflow-y-auto">
                            <div className="flex justify-between items-center mb-4">
                              <div>
                                <h3 className="text-lg font-bold text-white">Quiz Results</h3>
                                <p className="text-slate-400 text-xs">{viewingQuizAttempts.title} • {quizAttempts.length} attempt{quizAttempts.length !== 1 ? 's' : ''}</p>
                              </div>
                              <button onClick={() => { setViewingQuizAttempts(null); setQuizAttempts([]); }} className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-700/50">
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                              </button>
                            </div>
                            {quizAttempts.length === 0 ? (
                              <p className="text-slate-400 text-sm text-center py-6">No attempts yet</p>
                            ) : (
                              <div className="space-y-2">
                                {quizAttempts.map((a: any) => (
                                  <div key={a._id} className="bg-slate-700/30 rounded-xl p-3 flex items-center gap-3">
                                    <div className="h-9 w-9 bg-purple-600/20 rounded-full flex items-center justify-center text-xs font-bold text-purple-300 flex-shrink-0">{a.studentName?.split(' ').map((n: string) => n[0]).join('')}</div>
                                    <div className="min-w-0 flex-1">
                                      <p className="text-white text-sm font-medium">{a.studentName}</p>
                                      <p className="text-slate-400 text-xs">{new Date(a.submittedAt || a.startedAt).toLocaleString()}{a.tabSwitches > 0 ? ` • ⚠️ ${a.tabSwitches} tab switch${a.tabSwitches !== 1 ? 'es' : ''}` : ''}</p>
                                    </div>
                                    <div className="flex items-center gap-2 flex-shrink-0">
                                      {a.submittedAt ? (
                                        <span className={`text-sm font-bold ${(a.percentage || 0) >= 70 ? 'text-green-400' : (a.percentage || 0) >= 50 ? 'text-yellow-400' : 'text-red-400'}`}>{a.score}/{a.totalPoints} ({a.percentage}%)</span>
                                      ) : (
                                        <span className="text-xs text-yellow-400">In progress</span>
                                      )}
                                      {a.submittedAt && (
                                        <button onClick={() => fetchAttemptDetails(a._id)} className="text-purple-400 hover:text-purple-300 p-1.5 rounded-lg hover:bg-purple-500/10 transition-colors" title="Review & Grade">
                                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" /></svg>
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Detailed Grading Modal */}
                      {gradingAttempt && (
                        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                          <div className="bg-slate-800 rounded-2xl p-6 max-w-2xl w-full border border-slate-700/80 shadow-2xl max-h-[90vh] overflow-y-auto">
                            <div className="flex justify-between items-center mb-4">
                              <div>
                                <h3 className="text-lg font-bold text-white">Review: {gradingAttempt.studentName}</h3>
                                <p className="text-slate-400 text-xs">Score: <span className={`font-bold ${(gradingAttempt.percentage || 0) >= 70 ? 'text-green-400' : (gradingAttempt.percentage || 0) >= 50 ? 'text-yellow-400' : 'text-red-400'}`}>{gradingAttempt.score}/{gradingAttempt.totalPoints} ({gradingAttempt.percentage}%)</span>{gradingAttempt.tabSwitches > 0 ? ` • ⚠️ ${gradingAttempt.tabSwitches} tab switches` : ''}</p>
                              </div>
                              <button onClick={() => { setGradingAttempt(null); setAttemptDetails([]); }} className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-700/50">
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                              </button>
                            </div>
                            {gradingQuizLoading ? (
                              <div className="text-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-2 border-purple-500 border-t-transparent mx-auto mb-2"></div>
                                <p className="text-slate-400 text-xs">Loading...</p>
                              </div>
                            ) : (
                              <div className="space-y-3">
                                {attemptDetails.map((d: any, i: number) => (
                                  <div key={i} className={`rounded-xl p-4 border ${d.type === 'short_answer' && !d.isGraded ? 'border-orange-500/30 bg-orange-900/5' : d.correct ? 'border-green-600/20 bg-green-900/5' : 'border-red-600/20 bg-red-900/5'}`}>
                                    <div className="flex items-start justify-between mb-2">
                                      <div className="flex items-center gap-2">
                                        <span className="text-xs font-bold text-slate-400">Q{i + 1}</span>
                                        <span className={`text-[10px] px-1.5 py-0.5 rounded ${d.type === 'mcq' ? 'bg-blue-600/20 text-blue-300' : d.type === 'true_false' ? 'bg-green-600/20 text-green-300' : 'bg-orange-600/20 text-orange-300'}`}>{d.type === 'mcq' ? 'MCQ' : d.type === 'true_false' ? 'T/F' : 'Short'}</span>
                                      </div>
                                      <span className={`text-xs font-bold ${d.awardedPoints > 0 ? 'text-green-400' : 'text-red-400'}`}>{d.awardedPoints}/{d.points}</span>
                                    </div>
                                    <p className="text-white text-sm mb-2">{d.text}</p>

                                    {d.type === 'mcq' && (
                                      <div className="text-xs space-y-1 ml-2">
                                        <p className="text-slate-400">Student: <span className={d.correct ? 'text-green-400' : 'text-red-400'}>{d.options?.[d.studentOriginalAnswer] || 'No answer'}</span></p>
                                        {!d.correct && <p className="text-slate-400">Correct: <span className="text-green-400">{d.options?.[d.correctAnswer]}</span></p>}
                                      </div>
                                    )}

                                    {d.type === 'true_false' && (
                                      <div className="text-xs space-y-1 ml-2">
                                        <p className="text-slate-400">Student: <span className={d.correct ? 'text-green-400' : 'text-red-400'}>{d.studentAnswer === true ? 'True' : d.studentAnswer === false ? 'False' : 'No answer'}</span></p>
                                        {!d.correct && <p className="text-slate-400">Correct: <span className="text-green-400">{d.correctAnswer ? 'True' : 'False'}</span></p>}
                                      </div>
                                    )}

                                    {d.type === 'short_answer' && (
                                      <div className="space-y-2 ml-2">
                                        <div className="bg-slate-700/30 rounded-lg p-3">
                                          <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Student's Answer</p>
                                          <p className="text-white text-sm">{d.studentAnswer || <span className="text-slate-500 italic">No answer</span>}</p>
                                        </div>
                                        {d.modelAnswer && (
                                          <div className="bg-slate-700/20 rounded-lg p-3">
                                            <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Model Answer</p>
                                            <p className="text-slate-300 text-sm">{d.modelAnswer}</p>
                                          </div>
                                        )}
                                        {d.similarity !== undefined && (
                                          <div className="flex items-center gap-2">
                                            <span className="text-[10px] text-slate-500">Similarity:</span>
                                            <div className="flex-1 bg-slate-700/50 rounded-full h-1.5">
                                              <div className={`h-1.5 rounded-full ${d.similarity >= 70 ? 'bg-green-500' : d.similarity >= 40 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${d.similarity}%` }}></div>
                                            </div>
                                            <span className={`text-xs font-bold ${d.similarity >= 70 ? 'text-green-400' : d.similarity >= 40 ? 'text-yellow-400' : 'text-red-400'}`}>{d.similarity}%</span>
                                          </div>
                                        )}
                                        <div className="flex items-center gap-2 pt-1">
                                          <span className="text-[10px] text-slate-500">Award points:</span>
                                          {Array.from({ length: (d.points || 1) + 1 }, (_, p) => (
                                            <button key={p} onClick={() => gradeQuizQuestion(gradingAttempt._id, i, p)} className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${d.awardedPoints === p && d.isGraded ? 'bg-purple-600 text-white' : 'bg-slate-700/50 text-slate-400 hover:text-white hover:bg-slate-600/50'}`}>{p}</button>
                                          ))}
                                          {d.suggestedPoints !== undefined && !d.isGraded && (
                                            <span className="text-[10px] text-purple-400 ml-1">Suggested: {d.suggestedPoints}</span>
                                          )}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Quiz List */}
                      {lecQuizzes.length === 0 ? (
                        <div className="text-center py-10">
                          <span className="text-3xl">🧠</span>
                          <p className="text-slate-400 text-sm mt-2">No quizzes yet</p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {lecQuizzes.map((q: any) => {
                            const isActive = (!q.startDate || new Date() >= new Date(q.startDate)) && (!q.endDate || new Date() <= new Date(q.endDate));
                            return (
                              <div key={q._id} className={`group bg-slate-800/40 rounded-xl border p-4 transition-all ${isActive ? 'border-purple-500/25 hover:border-purple-500/40' : 'border-slate-700/20 opacity-60'}`}>
                                <div className="flex items-start justify-between gap-3">
                                  <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <h4 className="text-white font-medium text-sm">{q.title}</h4>
                                      <span className="text-[10px] bg-purple-600/20 text-purple-300 px-2 py-0.5 rounded-full">{q.questions?.length || 0} Q</span>
                                      <span className="text-[10px] bg-slate-600/30 text-slate-400 px-2 py-0.5 rounded-full">⏱ {q.timeLimit}min</span>
                                      <span className="text-[10px] bg-slate-600/30 text-slate-400 px-2 py-0.5 rounded-full">{q.attemptCount || 0} attempts</span>
                                      {isActive ? <span className="text-[10px] bg-green-600/20 text-green-300 px-2 py-0.5 rounded-full">Active</span> : <span className="text-[10px] bg-slate-600/20 text-slate-400 px-2 py-0.5 rounded-full">Closed</span>}
                                    </div>
                                    {q.endDate && <p className="text-[11px] text-slate-500 mt-1">Ends: {new Date(q.endDate).toLocaleString()}</p>}
                                  </div>
                                  <div className="flex gap-1 flex-shrink-0">
                                    <button onClick={() => { setViewingQuizAttempts(q); fetchQuizAttempts(q._id); }} className="text-blue-400 hover:text-blue-300 p-2 rounded-lg hover:bg-blue-500/10 transition-colors" title="View Results">
                                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                    </button>
                                    <button onClick={() => toggleReleaseResults(q._id)} className={`p-2 rounded-lg transition-colors ${q.settings?.releaseResults ? 'text-green-400 hover:bg-green-500/10' : 'text-slate-400 hover:bg-slate-500/10'}`} title={q.settings?.releaseResults ? 'Hide results' : 'Release results'}>
                                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" /></svg>
                                    </button>
                                    <button onClick={() => deleteQuiz(q._id)} className="text-red-400 hover:text-red-300 p-2 rounded-lg hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-all" title="Delete">
                                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>
                                    </button>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {activeSection === 'qr-code' && (
            <div className="space-y-6">
              <div className="card-hover bg-slate-800/50 backdrop-blur-sm p-6 sm:p-8 rounded-2xl border border-slate-700/50">
                <div className="text-center">
                  <h2 className="text-xl sm:text-2xl font-bold text-white mb-6">My Faculty ID</h2>
                  <div className="bg-white rounded-lg p-4 sm:p-6 max-w-sm mx-auto mb-6">
                    <img src={lecturerData.qrCode} alt="Faculty QR Code" className="w-full h-auto" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md mx-auto text-left">
                    <div>
                      <p className="text-slate-400 text-sm">Name</p>
                      <p className="text-white font-medium text-sm sm:text-base truncate">{lecturerData.name}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 text-sm">Faculty ID</p>
                      <p className="text-white font-mono text-sm sm:text-base">{lecturerData.id}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 text-sm">Department</p>
                      <p className="text-white text-sm sm:text-base truncate">{lecturerData.department}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 text-sm">Title</p>
                      <p className="text-white text-sm sm:text-base">{lecturerData.title}</p>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center mt-6">
                    <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-colors touch-manipulation">
                      Download QR
                    </button>
                    <button className="border border-slate-600 text-slate-300 px-6 py-2 rounded-lg hover:bg-slate-700/50 transition-colors touch-manipulation">
                      Share
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'student-records' && (
            <div className="space-y-6">
              <div className="card-hover bg-slate-800/50 backdrop-blur-sm p-6 rounded-2xl border border-slate-700/50">
                <h2 className="text-xl font-bold text-white mb-2">Student Records</h2>
                <p className="text-slate-400 mb-6">View students in your department ({lecturerData.department})</p>
                
                {/* Search and Filter */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Filter by Level
                    </label>
                    <select
                      value={selectedLevel}
                      onChange={(e) => setSelectedLevel(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">All Levels</option>
                      {studentsData?.levels.map(level => (
                        <option key={level} value={level}>{level}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Search Students
                    </label>
                    <input
                      type="text"
                      value={studentSearch}
                      onChange={(e) => setStudentSearch(e.target.value)}
                      placeholder="Search by name, ID, or email..."
                      className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Loading State */}
                {loadingStudents && (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-slate-400">Loading students...</p>
                  </div>
                )}

                {/* Students List */}
                {!loadingStudents && studentsData && (
                  <>
                    {/* Summary */}
                    <div className="bg-slate-700/30 rounded-lg p-4 mb-6">
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-center">
                        <div>
                          <div className="text-2xl font-bold text-blue-400">{studentsData.totalStudents}</div>
                          <div className="text-slate-400 text-sm">Total Students</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-green-400">{studentsData.levels.length}</div>
                          <div className="text-slate-400 text-sm">Levels</div>
                        </div>
                        <div className="hidden sm:block">
                          <div className="text-2xl font-bold text-purple-400">{studentsData.department}</div>
                          <div className="text-slate-400 text-sm">Department</div>
                        </div>
                      </div>
                    </div>

                    {/* Display by selected level or all levels */}
                    {selectedLevel ? (
                      // Show students for selected level
                      <div>
                        <h3 className="text-lg font-bold text-white mb-4">
                          {selectedLevel} Students ({studentsData.students?.length || 0})
                        </h3>
                        <div className="space-y-3">
                          {studentsData.students && studentsData.students.length > 0 ? (
                            studentsData.students.map((student) => (
                              <div key={student.id} className="bg-slate-700/30 rounded-lg p-4 hover:bg-slate-700/50 transition-colors">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-4">
                                    <div className="h-12 w-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                                      <span className="text-white font-bold">
                                        {student.profile.firstName[0]}{student.profile.lastName[0]}
                                      </span>
                                    </div>
                                    <div>
                                      <h4 className="text-white font-medium">
                                        {student.profile.firstName} {student.profile.lastName}
                                      </h4>
                                      <p className="text-slate-400 text-sm">{student.profile.studentId}</p>
                                      <p className="text-slate-500 text-xs">{student.email}</p>
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                      student.status === 'active' ? 'bg-green-900/30 text-green-400' :
                                      student.status === 'pending' ? 'bg-yellow-900/30 text-yellow-400' :
                                      'bg-red-900/30 text-red-400'
                                    }`}>
                                      {student.status}
                                    </span>
                                    {student.profile.phone && (
                                      <p className="text-slate-400 text-xs mt-1">{student.profile.phone}</p>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="text-center py-8">
                              <p className="text-slate-400">No students found for this level</p>
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      // Show all levels grouped
                      <div className="space-y-6">
                        {studentsData.levels.map((level) => {
                          const levelStudents = studentsData.groupedByLevel?.[level] || [];
                          return (
                            <div key={level}>
                              <div className="flex items-center justify-between mb-3">
                                <h3 className="text-lg font-bold text-white">{level}</h3>
                                <span className="text-slate-400 text-sm">{levelStudents.length} students</span>
                              </div>
                              <div className="space-y-3">
                                {levelStudents.slice(0, 5).map((student) => (
                                  <div key={student.id} className="bg-slate-700/30 rounded-lg p-4 hover:bg-slate-700/50 transition-colors">
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center space-x-4">
                                        <div className="h-12 w-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                                          <span className="text-white font-bold">
                                            {student.profile.firstName[0]}{student.profile.lastName[0]}
                                          </span>
                                        </div>
                                        <div>
                                          <h4 className="text-white font-medium">
                                            {student.profile.firstName} {student.profile.lastName}
                                          </h4>
                                          <p className="text-slate-400 text-sm">{student.profile.studentId}</p>
                                          <p className="text-slate-500 text-xs">{student.email}</p>
                                        </div>
                                      </div>
                                      <div className="text-right">
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                          student.status === 'active' ? 'bg-green-900/30 text-green-400' :
                                          student.status === 'pending' ? 'bg-yellow-900/30 text-yellow-400' :
                                          'bg-red-900/30 text-red-400'
                                        }`}>
                                          {student.status}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                                {levelStudents.length > 5 && (
                                  <button
                                    onClick={() => setSelectedLevel(level)}
                                    className="w-full text-center py-2 text-blue-400 hover:text-blue-300 text-sm"
                                  >
                                    View all {levelStudents.length} students in {level} →
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* No results */}
                    {studentsData.totalStudents === 0 && (
                      <div className="text-center py-12">
                        <div className="h-16 w-16 bg-slate-700/30 rounded-full flex items-center justify-center mx-auto mb-4">
                          <svg className="h-8 w-8 text-slate-400" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                          </svg>
                        </div>
                        <p className="text-slate-400">No students found in your department</p>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          )}


          {activeSection === 'schedule' && (
            <div className="space-y-6">
              {/* Add/Edit Modal */}
              {showAddSchedule && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                  <div className="bg-slate-800 rounded-2xl p-6 max-w-lg w-full border border-slate-700/80 shadow-2xl max-h-[90vh] overflow-y-auto">
                    <div className="flex justify-between items-center mb-5">
                      <div>
                        <h3 className="text-lg font-bold text-white">{editingSchedule ? 'Edit Class' : 'New Class'}</h3>
                        <p className="text-slate-400 text-xs mt-0.5">{editingSchedule ? 'Update class details' : 'Add a new class to your schedule'}</p>
                      </div>
                      <button onClick={() => { setShowAddSchedule(false); setEditingSchedule(null); setScheduleError(''); }} className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-700/50 transition-colors">
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                    </div>
                    {scheduleError && <div className="bg-red-900/30 border border-red-700/50 text-red-400 p-3 rounded-lg mb-4 text-sm flex items-center gap-2"><span>⚠️</span>{scheduleError}</div>}

                    {/* Mode Toggle (only for new entries) */}
                    {!editingSchedule && (
                      <div className="flex bg-slate-700/50 rounded-lg p-1 mb-5">
                        <button onClick={() => setScheduleMode('single')} className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${scheduleMode === 'single' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}>📅 Single Date</button>
                        <button onClick={() => setScheduleMode('recurring')} className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${scheduleMode === 'recurring' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}>🔄 Recurring</button>
                      </div>
                    )}

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm text-slate-300 mb-1">Course</label>
                        {loadingAssignedCourses ? (
                          <div className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-400 text-sm">Loading your courses…</div>
                        ) : assignedCourses.length === 0 ? (
                          <div className="bg-amber-900/20 border border-amber-700/40 text-amber-300 p-3 rounded-lg text-sm">
                            You don&apos;t have any courses assigned to you yet. Ask your admin to assign you a course before scheduling classes.
                          </div>
                        ) : (
                          <select
                            value={scheduleForm.courseId}
                            onChange={(e) => {
                              const course = assignedCourses.find((c: any) => c._id === e.target.value);
                              if (course) {
                                setScheduleForm({
                                  ...scheduleForm,
                                  courseId: course._id,
                                  courseCode: course.courseCode,
                                  courseName: course.courseName,
                                  level: course.level || scheduleForm.level,
                                });
                              } else {
                                setScheduleForm({ ...scheduleForm, courseId: '', courseCode: '', courseName: '' });
                              }
                            }}
                            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="">Select a course you teach…</option>
                            {assignedCourses.map((c: any) => (
                              <option key={c._id} value={c._id}>{c.courseCode} — {c.courseName} ({c.level})</option>
                            ))}
                          </select>
                        )}
                      </div>
                      {scheduleForm.courseId && (
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm text-slate-300 mb-1">Course Name</label>
                            <div className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-300 text-sm truncate" title={scheduleForm.courseName}>{scheduleForm.courseName || '—'}</div>
                          </div>
                          <div>
                            <label className="block text-sm text-slate-300 mb-1">Level</label>
                            <div className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-300 text-sm">{scheduleForm.level}</div>
                          </div>
                        </div>
                      )}

                      {/* Date fields based on mode */}
                      {scheduleMode === 'single' || editingSchedule ? (
                        <div>
                          <label className="block text-sm text-slate-300 mb-1">Date</label>
                          <input type="date" value={scheduleForm.date} onChange={(e) => setScheduleForm({...scheduleForm, date: e.target.value})} className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>
                      ) : (
                        <>
                          <div>
                            <label className="block text-sm text-slate-300 mb-1">Day of Week</label>
                            <select value={scheduleForm.recurringDay} onChange={(e) => setScheduleForm({...scheduleForm, recurringDay: e.target.value})} className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                              {['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'].map(d => <option key={d} value={d}>{d}</option>)}
                            </select>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm text-slate-300 mb-1">From Date</label>
                              <input type="date" value={scheduleForm.recurringStart} onChange={(e) => setScheduleForm({...scheduleForm, recurringStart: e.target.value})} className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
                            </div>
                            <div>
                              <label className="block text-sm text-slate-300 mb-1">Until Date</label>
                              <input type="date" value={scheduleForm.recurringEnd} onChange={(e) => setScheduleForm({...scheduleForm, recurringEnd: e.target.value})} className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
                            </div>
                          </div>
                          <p className="text-slate-500 text-xs">This will create a class entry for every {scheduleForm.recurringDay} between the selected dates.</p>
                        </>
                      )}

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm text-slate-300 mb-1">Start Time</label>
                          <input type="time" value={scheduleForm.startTime} onChange={(e) => setScheduleForm({...scheduleForm, startTime: e.target.value})} className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>
                        <div>
                          <label className="block text-sm text-slate-300 mb-1">End Time</label>
                          <input type="time" value={scheduleForm.endTime} onChange={(e) => setScheduleForm({...scheduleForm, endTime: e.target.value})} className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm text-slate-300 mb-1">Venue</label>
                        <input type="text" value={scheduleForm.venue} onChange={(e) => setScheduleForm({...scheduleForm, venue: e.target.value})} placeholder="e.g., Room 201, Science Building" className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                      </div>
                      <div className="flex gap-3 pt-2">
                        <button onClick={() => { setShowAddSchedule(false); setEditingSchedule(null); setScheduleError(''); }} className="flex-1 border border-slate-600 text-slate-300 py-2 rounded-lg hover:bg-slate-700/50 transition-colors">Cancel</button>
                        <button onClick={handleScheduleSubmit} disabled={!scheduleForm.courseId && !scheduleForm.courseCode} className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">{editingSchedule ? 'Update' : scheduleMode === 'recurring' ? 'Create Recurring' : 'Save Class'}</button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Cancel Class Modal */}
              {cancellingSchedule && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                  <div className="bg-slate-800 rounded-2xl p-6 max-w-md w-full border border-slate-700/80 shadow-2xl">
                    <div className="flex justify-between items-center mb-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-red-500/20 flex items-center justify-center">
                          <svg className="h-5 w-5 text-red-400" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>
                        </div>
                        <h3 className="text-lg font-bold text-white">Cancel Class</h3>
                      </div>
                      <button onClick={() => { setCancellingSchedule(null); setCancelReason(''); }} className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-700/50">
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                    </div>
                    <div className="bg-slate-700/30 rounded-lg p-3 mb-4">
                      <p className="text-white font-medium text-sm">{cancellingSchedule.courseCode} — {cancellingSchedule.courseName}</p>
                      <p className="text-slate-400 text-xs mt-1 flex items-center gap-2">
                        <span>📅 {cancellingSchedule.date}</span>
                        <span>•</span>
                        <span>🕐 {cancellingSchedule.startTime} - {cancellingSchedule.endTime}</span>
                      </p>
                    </div>
                    <label className="block text-xs font-medium text-slate-400 mb-2 uppercase tracking-wider">Reason for cancellation</label>
                    <textarea
                      value={cancelReason}
                      onChange={(e) => setCancelReason(e.target.value)}
                      placeholder="e.g. Lecturer unavailable, Venue maintenance..."
                      className="w-full bg-slate-700/70 border border-slate-600/50 rounded-lg p-3 text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 resize-none transition-all"
                      rows={3}
                    />
                    <div className="flex gap-3 mt-4">
                      <button onClick={() => { setCancellingSchedule(null); setCancelReason(''); }} className="flex-1 px-4 py-2.5 border border-slate-600/50 text-slate-300 rounded-lg hover:bg-slate-700/50 text-sm transition-colors">Go Back</button>
                      <button onClick={handleCancelSchedule} disabled={!cancelReason.trim()} className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-500 disabled:opacity-40 disabled:cursor-not-allowed text-sm font-medium transition-all shadow-lg">Cancel Class</button>
                    </div>
                  </div>
                </div>
              )}

              {/* Announcement Modal */}
              {announcementEntry && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                  <div className="bg-slate-800 rounded-2xl p-6 max-w-md w-full border border-slate-700/80 shadow-2xl">
                    <div className="flex justify-between items-center mb-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-amber-500/20 flex items-center justify-center">
                          <span className="text-lg">📢</span>
                        </div>
                        <h3 className="text-lg font-bold text-white">Class Announcement</h3>
                      </div>
                      <button onClick={() => { setAnnouncementEntry(null); setAnnouncementText(''); }} className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-700/50">
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                    </div>
                    <div className="bg-slate-700/30 rounded-lg p-3 mb-4">
                      <p className="text-white font-medium text-sm">{announcementEntry.courseCode} — {announcementEntry.courseName}</p>
                      <p className="text-slate-400 text-xs mt-1 flex items-center gap-2">
                        <span>📅 {announcementEntry.date}</span>
                        <span>•</span>
                        <span>🕐 {announcementEntry.startTime} - {announcementEntry.endTime}</span>
                      </p>
                    </div>
                    <label className="block text-xs font-medium text-slate-400 mb-2 uppercase tracking-wider">Announcement</label>
                    <textarea
                      value={announcementText}
                      onChange={(e) => setAnnouncementText(e.target.value)}
                      placeholder="e.g. Bring your laptops, Test next week, Submit assignments before class..."
                      className="w-full bg-slate-700/70 border border-slate-600/50 rounded-lg p-3 text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 resize-none transition-all"
                      rows={3}
                    />
                    <div className="flex gap-3 mt-4">
                      <button onClick={() => { setAnnouncementEntry(null); setAnnouncementText(''); }} className="flex-1 px-4 py-2.5 border border-slate-600/50 text-slate-300 rounded-lg hover:bg-slate-700/50 text-sm transition-colors">Cancel</button>
                      {announcementEntry.announcement && (
                        <button onClick={() => { setAnnouncementText(''); handleSaveAnnouncement(); }} className="px-4 py-2.5 border border-red-600/50 text-red-400 rounded-lg hover:bg-red-500/10 text-sm transition-colors">Remove</button>
                      )}
                      <button onClick={handleSaveAnnouncement} className="flex-1 px-4 py-2.5 bg-amber-600 text-white rounded-lg hover:bg-amber-500 text-sm font-medium transition-all shadow-lg">Save</button>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
                <StatCard label="Total Classes" value={scheduleEntries.length} icon="calendar" />
                <StatCard label="Today" value={scheduleTodayClasses.length} icon="clock" accent="info" />
                <StatCard label="Active" value={scheduleEntries.filter((e: any) => e.status !== 'cancelled').length} icon="check" accent="success" />
                <StatCard label="Cancelled" value={scheduleEntries.filter((e: any) => e.status === 'cancelled').length} icon="alert" accent="danger" />
              </div>

              <div className="section-card p-0 overflow-hidden">
                <div className="p-4 sm:p-5 border-b border-[var(--border-subtle)]">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                    <div className="min-w-0">
                      <h2 className="section-title text-base sm:text-lg">Class Schedule</h2>
                      <p className="section-subtitle">{scheduleView === 'week' ? 'Weekly' : 'Monthly'} overview</p>
                    </div>
                    <div className="flex items-stretch sm:items-center gap-2 w-full sm:w-auto">
                      <div className="flex items-center p-0.5 rounded-lg flex-1 sm:flex-initial" style={{ background: 'var(--surface-2)', border: '1px solid var(--border-default)' }}>
                        <button
                          type="button"
                          onClick={() => setScheduleView('week')}
                          className={`flex-1 sm:flex-initial px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                            scheduleView === 'week' ? 'text-white' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                          }`}
                          style={scheduleView === 'week' ? { background: 'var(--accent)' } : undefined}
                        >
                          Week
                        </button>
                        <button
                          type="button"
                          onClick={() => setScheduleView('month')}
                          className={`flex-1 sm:flex-initial px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                            scheduleView === 'month' ? 'text-white' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                          }`}
                          style={scheduleView === 'month' ? { background: 'var(--accent)' } : undefined}
                        >
                          Month
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => { setShowAddSchedule(true); setEditingSchedule(null); setScheduleForm({ courseCode: '', courseName: '', date: new Date().toISOString().split('T')[0], startTime: '', endTime: '', venue: '', level: '100L', recurringDay: 'Monday', recurringStart: '', recurringEnd: '' }); setScheduleMode('single'); setScheduleError(''); }}
                        className="btn btn-primary text-sm shrink-0"
                      >
                        <Icon name="plus" size={14} />
                        <span className="hidden min-[380px]:inline">Add Class</span>
                        <span className="inline min-[380px]:hidden">Add</span>
                      </button>
                    </div>
                  </div>
                </div>

                <div className="px-3 sm:px-5 py-2.5 border-b border-[var(--border-subtle)]"
                     style={{ background: 'var(--surface-0)' }}>
                  {/* Mobile: 2 rows — nav row + Today button row. Desktop: single row */}
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
                        ? `${formatDateLabel(scheduleStartDate)} – ${formatDateLabel(scheduleEndDate)}`
                        : formatDateLabel(scheduleDate)}
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

                {(scheduleSuccess || scheduleError) && (
                  <div className="px-4 sm:px-5 pt-4 space-y-2">
                    {scheduleSuccess && (
                      <div className="rounded-lg p-3 text-sm flex items-center gap-2"
                           style={{
                             background: 'rgba(16,185,129,0.08)',
                             border: '1px solid rgba(16,185,129,0.25)',
                             color: 'var(--success)',
                           }}>
                        <Icon name="check" size={16} />
                        {scheduleSuccess}
                      </div>
                    )}
                    {scheduleError && (
                      <div className="rounded-lg p-3 text-sm flex items-center gap-2"
                           style={{
                             background: 'rgba(239,68,68,0.08)',
                             border: '1px solid rgba(239,68,68,0.25)',
                             color: 'var(--danger)',
                           }}>
                        <Icon name="alert" size={16} />
                        {scheduleError}
                      </div>
                    )}
                  </div>
                )}

                <div className="p-3 sm:p-5">
                {loadingSchedule ? (
                  <div className="text-center py-16">
                    <div className="animate-spin rounded-full h-10 w-10 border-2 border-[var(--accent)] border-t-transparent mx-auto mb-3" />
                    <p className="text-[var(--text-muted)] text-sm">Loading schedule…</p>
                  </div>
                ) : scheduleEntries.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="h-12 w-12 rounded-full mx-auto mb-3 flex items-center justify-center"
                         style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}>
                      <Icon name="calendar" size={22} />
                    </div>
                    <p className="text-[var(--text-primary)] font-medium">No classes this {scheduleView}</p>
                    <p className="text-[var(--text-muted)] text-sm mt-1 mb-4">Get started by adding your first class.</p>
                    <button
                      type="button"
                      onClick={() => { setShowAddSchedule(true); setEditingSchedule(null); setScheduleForm({ courseCode: '', courseName: '', date: new Date().toISOString().split('T')[0], startTime: '', endTime: '', venue: '', level: '100L', recurringDay: 'Monday', recurringStart: '', recurringEnd: '' }); setScheduleMode('single'); setScheduleError(''); }}
                      className="btn btn-primary text-sm"
                    >
                      <Icon name="plus" size={14} />
                      Add Class
                    </button>
                  </div>
                ) : (
                  <>
                    {scheduleTodayClasses.length > 0 && (
                      <div className="mb-5 sm:mb-6 rounded-xl p-3 sm:p-4"
                           style={{
                             background: 'var(--accent-soft)',
                             border: '1px solid color-mix(in srgb, var(--accent) 25%, transparent)',
                           }}>
                        <div className="flex items-center justify-between gap-2 mb-3">
                          <h3 className="text-sm font-semibold flex items-center gap-2 min-w-0 truncate" style={{ color: 'var(--accent)' }}>
                            <span className="h-1.5 w-1.5 rounded-full animate-pulse shrink-0" style={{ background: 'var(--accent)' }} />
                            <span className="truncate">Today's classes</span>
                          </h3>
                          <span className="pill pill-info shrink-0">
                            {scheduleTodayClasses.filter((e: any) => e.status !== 'cancelled').length} active
                          </span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                          {scheduleTodayClasses.map((entry: any) => (
                            <div
                              key={entry._id}
                              className="flex items-center gap-3 rounded-lg px-3 py-2"
                              style={{
                                background: 'var(--surface-1)',
                                border: '1px solid ' + (entry.status === 'cancelled' ? 'rgba(239,68,68,0.25)' : 'var(--border-default)'),
                                opacity: entry.status === 'cancelled' ? 0.7 : 1,
                              }}
                            >
                              <div className="h-8 w-12 rounded-md flex items-center justify-center shrink-0 text-[11px] font-semibold tabular-nums"
                                   style={{
                                     background: entry.status === 'cancelled' ? 'rgba(239,68,68,0.1)' : 'var(--surface-2)',
                                     color: entry.status === 'cancelled' ? 'var(--danger)' : 'var(--accent)',
                                   }}>
                                {entry.startTime.slice(0, 5)}
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className={`text-sm font-medium truncate ${entry.status === 'cancelled' ? 'line-through text-[var(--text-muted)]' : 'text-[var(--text-primary)]'}`}>
                                  {entry.courseCode}
                                </p>
                                <p className="text-xs truncate text-[var(--text-muted)]">{entry.venue} · {entry.level}</p>
                              </div>
                              {entry.status === 'cancelled' && <span className="pill pill-danger">Cancelled</span>}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {scheduleView === 'week' ? (
                      <div className="space-y-3">
                        {getWeekDates().map(dateStr => {
                          const dateEntries = scheduleGrouped[dateStr] || [];
                          const isToday = dateStr === new Date().toISOString().split('T')[0];
                          const activeCount = dateEntries.filter((e: any) => e.status !== 'cancelled').length;
                          return (
                            <div
                              key={dateStr}
                              className="rounded-xl overflow-hidden"
                              style={{
                                background: isToday ? 'var(--accent-soft)' : 'var(--surface-0)',
                                border: '1px solid ' + (isToday ? 'color-mix(in srgb, var(--accent) 30%, transparent)' : 'var(--border-subtle)'),
                              }}
                            >
                              <div className="px-4 py-2.5 flex items-center justify-between"
                                   style={{ borderBottom: '1px solid ' + (isToday ? 'color-mix(in srgb, var(--accent) 20%, transparent)' : 'var(--border-subtle)') }}>
                                <div className="flex items-center gap-2">
                                  <h4 className="font-medium text-sm text-[var(--text-primary)]">{formatDateLabel(dateStr)}</h4>
                                  {isToday && <span className="pill pill-info">Today</span>}
                                </div>
                                <span className="text-[var(--text-muted)] text-xs">
                                  {activeCount > 0 ? `${activeCount} class${activeCount !== 1 ? 'es' : ''}` : 'Free day'}
                                </span>
                              </div>
                              {dateEntries.length === 0 ? (
                                <div className="px-4 py-4">
                                  <p className="text-[var(--text-muted)] text-xs italic">No classes scheduled.</p>
                                </div>
                              ) : (
                                <div className="p-2 sm:p-3 space-y-2">
                                  {dateEntries.map((entry: any) => (
                                    <div
                                      key={entry._id}
                                      className="group rounded-lg p-2.5 sm:p-3"
                                      style={{
                                        background: 'var(--surface-1)',
                                        border: '1px solid ' + (entry.status === 'cancelled' ? 'rgba(239,68,68,0.25)' : 'var(--border-subtle)'),
                                        opacity: entry.status === 'cancelled' ? 0.75 : 1,
                                      }}
                                    >
                                      <div className="flex items-start gap-2.5 sm:gap-3">
                                        <div className="shrink-0 w-14 sm:w-16 text-center rounded-md py-1.5"
                                             style={{
                                               background: 'var(--surface-2)',
                                               border: '1px solid var(--border-subtle)',
                                             }}>
                                          <p className={`text-[11px] sm:text-xs font-semibold tabular-nums ${entry.status === 'cancelled' ? 'text-[var(--danger)]' : 'text-[var(--text-primary)]'}`}>
                                            {entry.startTime}
                                          </p>
                                          <p className="text-[10px] text-[var(--text-muted)] tabular-nums">{entry.endTime}</p>
                                        </div>
                                        <div className="min-w-0 flex-1">
                                          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                                            <h5 className={`font-medium text-sm ${entry.status === 'cancelled' ? 'line-through text-[var(--text-muted)]' : 'text-[var(--text-primary)]'}`}>
                                              {entry.courseCode}
                                            </h5>
                                            <span className="pill">{entry.level}</span>
                                            {entry.status === 'cancelled' && <span className="pill pill-danger">Cancelled</span>}
                                          </div>
                                          <p className="text-xs mt-0.5 text-[var(--text-secondary)] line-clamp-2 sm:line-clamp-none">{entry.courseName}</p>
                                          <p className="text-xs text-[var(--text-muted)] mt-1 flex items-center gap-1.5 min-w-0">
                                            <Icon name="user" size={11} className="shrink-0" />
                                            <span className="truncate">{entry.venue}</span>
                                          </p>
                                          {entry.status === 'cancelled' && entry.cancelReason && (
                                            <p className="text-xs text-[var(--danger)] mt-1.5 italic rounded px-2 py-1"
                                               style={{ background: 'rgba(239,68,68,0.06)' }}>
                                              {entry.cancelReason}
                                            </p>
                                          )}
                                          {entry.announcement && entry.status !== 'cancelled' && (
                                            <p className="text-xs mt-1.5 rounded px-2 py-1 break-words"
                                               style={{ background: 'rgba(245,158,11,0.08)', color: 'var(--warning)' }}>
                                              {entry.announcement}
                                            </p>
                                          )}
                                        </div>
                                        {/* Desktop-only inline actions (revealed on hover) */}
                                        <div className="hidden sm:flex items-center gap-0.5 shrink-0 opacity-60 group-hover:opacity-100 transition-opacity">
                                          {isClassPast(entry) ? (
                                            <span className="text-[10px] text-[var(--text-muted)] italic px-1">Past</span>
                                          ) : entry.status === 'cancelled' ? (
                                            <button type="button" onClick={() => handleRestoreSchedule(entry._id)} className="btn btn-ghost p-1.5" title="Restore">
                                              <Icon name="check" size={14} />
                                            </button>
                                          ) : (
                                            <>
                                              <button type="button" onClick={() => openEditSchedule(entry)} className="btn btn-ghost p-1.5" title="Edit">
                                                <Icon name="edit" size={14} />
                                              </button>
                                              <button
                                                type="button"
                                                onClick={() => { setAnnouncementEntry(entry); setAnnouncementText(entry.announcement || ''); }}
                                                className="btn btn-ghost p-1.5"
                                                title="Announcement"
                                                style={entry.announcement ? { color: 'var(--warning)' } : undefined}
                                              >
                                                <Icon name="megaphone" size={14} />
                                              </button>
                                              <button type="button" onClick={() => setCancellingSchedule(entry)} className="btn btn-ghost p-1.5" title="Cancel class" style={{ color: 'var(--warning)' }}>
                                                <Icon name="alert" size={14} />
                                              </button>
                                              <button type="button" onClick={() => handleDeleteSchedule(entry._id)} className="btn btn-ghost p-1.5" title="Delete" style={{ color: 'var(--danger)' }}>
                                                <Icon name="trash" size={14} />
                                              </button>
                                            </>
                                          )}
                                        </div>
                                      </div>
                                      {/* Mobile-only action row (below content, always visible) */}
                                      <div className="flex sm:hidden items-center justify-end gap-1 mt-2 pt-2 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
                                        {isClassPast(entry) ? (
                                          <span className="text-[10px] text-[var(--text-muted)] italic">Past class</span>
                                        ) : entry.status === 'cancelled' ? (
                                          <button type="button" onClick={() => handleRestoreSchedule(entry._id)} className="btn btn-ghost p-1.5" aria-label="Restore">
                                            <Icon name="check" size={14} />
                                          </button>
                                        ) : (
                                          <>
                                            <button type="button" onClick={() => openEditSchedule(entry)} className="btn btn-ghost p-1.5" aria-label="Edit">
                                              <Icon name="edit" size={14} />
                                            </button>
                                            <button
                                              type="button"
                                              onClick={() => { setAnnouncementEntry(entry); setAnnouncementText(entry.announcement || ''); }}
                                              className="btn btn-ghost p-1.5"
                                              aria-label="Announcement"
                                              style={entry.announcement ? { color: 'var(--warning)' } : undefined}
                                            >
                                              <Icon name="megaphone" size={14} />
                                            </button>
                                            <button type="button" onClick={() => setCancellingSchedule(entry)} className="btn btn-ghost p-1.5" aria-label="Cancel class" style={{ color: 'var(--warning)' }}>
                                              <Icon name="alert" size={14} />
                                            </button>
                                            <button type="button" onClick={() => handleDeleteSchedule(entry._id)} className="btn btn-ghost p-1.5" aria-label="Delete" style={{ color: 'var(--danger)' }}>
                                              <Icon name="trash" size={14} />
                                            </button>
                                          </>
                                        )}
                                      </div>
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
                        {Object.entries(scheduleGrouped).sort(([a], [b]) => a.localeCompare(b)).map(([dateStr, entries]) => {
                          const isToday = dateStr === new Date().toISOString().split('T')[0];
                          return (
                            <div
                              key={dateStr}
                              className="rounded-xl overflow-hidden"
                              style={{
                                background: isToday ? 'var(--accent-soft)' : 'var(--surface-0)',
                                border: '1px solid ' + (isToday ? 'color-mix(in srgb, var(--accent) 30%, transparent)' : 'var(--border-subtle)'),
                              }}
                            >
                              <div className="px-4 py-2 flex items-center justify-between"
                                   style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                                <div className="flex items-center gap-2">
                                  <span className="font-medium text-sm text-[var(--text-primary)]">{formatDateLabel(dateStr)}</span>
                                  {isToday && <span className="pill pill-info">Today</span>}
                                </div>
                                <span className="text-[var(--text-muted)] text-xs">
                                  {(entries as any[]).length} class{(entries as any[]).length !== 1 ? 'es' : ''}
                                </span>
                              </div>
                              <div className="p-2 sm:p-3 space-y-1.5">
                                {(entries as any[]).map((entry: any) => (
                                  <div
                                    key={entry._id}
                                    className="group flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 rounded-lg px-2.5 sm:px-3 py-2"
                                    style={{
                                      background: 'var(--surface-1)',
                                      border: '1px solid ' + (entry.status === 'cancelled' ? 'rgba(239,68,68,0.2)' : 'var(--border-subtle)'),
                                      opacity: entry.status === 'cancelled' ? 0.7 : 1,
                                    }}
                                  >
                                    <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                                      <p className="shrink-0 w-12 text-xs font-semibold tabular-nums text-[var(--text-primary)]">{entry.startTime}</p>
                                      <div className="min-w-0 flex-1 flex items-center gap-1.5 sm:gap-2 flex-wrap">
                                        <span className={`font-medium text-sm ${entry.status === 'cancelled' ? 'line-through text-[var(--text-muted)]' : 'text-[var(--text-primary)]'}`}>
                                          {entry.courseCode}
                                        </span>
                                        <span className="text-xs text-[var(--text-muted)] truncate max-w-[120px] sm:max-w-none">{entry.venue}</span>
                                        <span className="pill">{entry.level}</span>
                                        {entry.status === 'cancelled' && <span className="pill pill-danger">Cancelled</span>}
                                      </div>
                                    </div>
                                    <div className="flex items-center justify-end gap-0.5 shrink-0 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                      {isClassPast(entry) ? (
                                        <span className="text-[10px] text-[var(--text-muted)] italic px-1">Past</span>
                                      ) : entry.status === 'cancelled' ? (
                                        <button type="button" onClick={() => handleRestoreSchedule(entry._id)} className="btn btn-ghost p-1" aria-label="Restore">
                                          <Icon name="check" size={12} />
                                        </button>
                                      ) : (
                                        <>
                                          <button type="button" onClick={() => openEditSchedule(entry)} className="btn btn-ghost p-1" aria-label="Edit">
                                            <Icon name="edit" size={12} />
                                          </button>
                                          <button type="button" onClick={() => setCancellingSchedule(entry)} className="btn btn-ghost p-1" aria-label="Cancel" style={{ color: 'var(--warning)' }}>
                                            <Icon name="alert" size={12} />
                                          </button>
                                          <button type="button" onClick={() => handleDeleteSchedule(entry._id)} className="btn btn-ghost p-1" aria-label="Delete" style={{ color: 'var(--danger)' }}>
                                            <Icon name="trash" size={12} />
                                          </button>
                                        </>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </>
                )}
                </div>
              </div>
            </div>
          )}

          {/* Grades & Assessment Section */}
          {activeSection === 'grades' && (
            <LecturerGradebook />
          )}

          {/* Reports & Analytics Section */}
          {activeSection === 'reports' && (
            <LecturerReports />
          )}

          {!['overview', 'qr-scanner', 'attendance', 'courses', 'qr-code', 'student-records', 'student-history', 'schedule', 'grades', 'reports'].includes(activeSection) && (
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
      </DashboardShell>
    </>
  );
}