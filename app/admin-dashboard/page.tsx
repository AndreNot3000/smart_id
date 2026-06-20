"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { DashboardShell, Icon, StatCard, type NavItem } from "@/components/dashboard";
import type { TourStep } from "@/lib/tour";
import DepartmentCombobox from "@/components/ui/DepartmentCombobox";
import { formatLecturerDisplayName } from "@/lib/lecturerTitle";
import QRScannerNew from "@/components/qr/QRScannerNew";
import AttendanceHistory from "@/components/qr/AttendanceHistory";
import { AdminAttendanceOverview } from "@/components/attendance";
import { AdminMfaSettings, GradeScaleSettings } from "@/components/admin";
import { AdminReports } from "@/components/reports";
import { getApiUrl } from "@/lib/config";
import { enforceRole } from "@/lib/session";

// API Response Types
interface DashboardStats {
  stats: {
    users: {
      total: number;
      students: number;
      lecturers: number;
      admins: number;
    };
    status: {
      active: number;
      pending: number;
      suspended: number;
    };
    institution: {
      id: string;
      totalUsers: number;
    };
  };
  generatedAt: string;
}

interface Student {
  id: string;
  email: string;
  studentId: string;
  firstName: string;
  lastName: string;
  department: string;
  year: string;
  status: string;
  emailVerified: boolean;
  createdAt: string;
}

interface Lecturer {
  id: string;
  email: string;
  lecturerId: string;
  firstName: string;
  lastName: string;
  department: string;
  title: string;
  specialization: string;
  status: string;
  emailVerified: boolean;
  createdAt: string;
}

interface StudentsResponse {
  students: Student[];
  total: number;
}

interface LecturersResponse {
  lecturers: Lecturer[];
  total: number;
}

interface AdminProfile {
  id: string;
  email: string;
  userType: string;
  status: string;
  profile: {
    firstName: string;
    lastName: string;
    avatar: string;
    universityName: string;
  };
}

export default function AdminDashboard() {
  const router = useRouter();
  const [activeSection, setActiveSection] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [searchStudentId, setSearchStudentId] = useState<string>('');
  // Student History search-by-name/ID combobox
  const [historyQuery, setHistoryQuery] = useState<string>('');
  const [selectedHistoryStudent, setSelectedHistoryStudent] = useState<Student | null>(null);
  
  // Data states
  const [adminData, setAdminData] = useState({
    name: '',
    id: '',
    email: '',
    role: 'Administrator',
    institution: '',
    avatar: '',
  });
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [lecturers, setLecturers] = useState<Lecturer[]>([]);
  
  // UI states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userModalType, setUserModalType] = useState<'student' | 'lecturer'>('student');

  // Course management states
  const [adminCourses, setAdminCourses] = useState<any[]>([]);
  const [loadingAdminCourses, setLoadingAdminCourses] = useState(false);
  const [selectedCourseLevel, setSelectedCourseLevel] = useState('100L');
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState<any>(null);
  const [courseForm, setCourseForm] = useState({ courseCode: '', courseName: '', description: '', credits: 3, department: '', level: '100L', semester: 'First' });
  const [courseError, setCourseError] = useState('');
  const [courseSuccess, setCourseSuccess] = useState('');
  const [userActionMessage, setUserActionMessage] = useState('');
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);
  const [assigningCourse, setAssigningCourse] = useState<any>(null);

  // Fetch all dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Guard: the token in this tab must belong to an admin. If a tab
        // inherited a different user's session (e.g. opened from another tab),
        // bounce to login instead of rendering the wrong account.
        if (!enforceRole('admin', router)) return;

        const token = sessionStorage.getItem('accessToken');

        // Fetch all data in parallel
        const [profileRes, statsRes, studentsRes, lecturersRes] = await Promise.all([
          fetch(getApiUrl('/api/users/profile'), {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }),
          fetch(getApiUrl('/api/users/dashboard-stats'), {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }),
          fetch(getApiUrl('/api/admin/students'), {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }),
          fetch(getApiUrl('/api/admin/lecturers'), {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          })
        ]);

        // Check for authentication errors
        if (profileRes.status === 401 || statsRes.status === 401 || studentsRes.status === 401 || lecturersRes.status === 401) {
          sessionStorage.removeItem('accessToken');
          sessionStorage.removeItem('refreshToken');
          sessionStorage.removeItem('user');
          router.push('/login');
          return;
        }

        // Parse responses
        const profileData: AdminProfile = await profileRes.json();
        const statsData: DashboardStats = await statsRes.json();
        const studentsData: StudentsResponse = await studentsRes.json();
        const lecturersData: LecturersResponse = await lecturersRes.json();

        // Set admin profile data
        if (profileRes.ok) {
          setAdminData({
            name: `${profileData.profile.firstName} ${profileData.profile.lastName}`,
            id: profileData.id,
            email: profileData.email,
            role: 'Institution Administrator',
            institution: profileData.profile.universityName,
            avatar: profileData.profile.avatar,
          });
        }

        // Set dashboard stats
        if (statsRes.ok) {
          setDashboardStats(statsData);
        }

        // Set students data
        if (studentsRes.ok) {
          setStudents(studentsData.students);
        }

        // Set lecturers data
        if (lecturersRes.ok) {
          setLecturers(lecturersData.lecturers);
        }

      } catch (err: any) {
        setError(err.message || 'Failed to load dashboard data');
        console.error('Dashboard fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [router]);

  // Course management functions
  const fetchAdminCourses = async () => {
    setLoadingAdminCourses(true);
    try {
      const token = sessionStorage.getItem('accessToken');
      if (!token) return;
      const response = await fetch(getApiUrl('/api/course'), {
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
      if (response.ok) {
        const data = await response.json();
        setAdminCourses(data.courses || []);
      }
    } catch (error) { console.error('Error fetching courses:', error); }
    finally { setLoadingAdminCourses(false); }
  };

  const handleCourseSubmit = async () => {
    setCourseError('');
    console.log('Course form values:', JSON.stringify(courseForm));
    if (!courseForm.courseCode.trim() || !courseForm.courseName.trim() || !courseForm.department.trim() || !courseForm.level) {
      setCourseError('Please fill in all required fields');
      return;
    }
    try {
      const token = sessionStorage.getItem('accessToken');
      if (!token) return;
      const url = editingCourse ? getApiUrl(`/api/course/${editingCourse._id}`) : getApiUrl('/api/course');
      const method = editingCourse ? 'PUT' : 'POST';
      const response = await fetch(url, {
        method, headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(courseForm),
      });
      const data = await response.json();
      if (!response.ok) { setCourseError(data.error || 'Failed'); return; }
      setCourseSuccess(editingCourse ? 'Course updated' : 'Course created');
      setShowCourseModal(false);
      setEditingCourse(null);
      setCourseForm({ courseCode: '', courseName: '', description: '', credits: 3, department: '', level: '100L', semester: 'First' });
      fetchAdminCourses();
      setTimeout(() => setCourseSuccess(''), 3000);
    } catch (error) { setCourseError('Failed to save course'); }
  };

  const handleDeleteCourse = async (id: string) => {
    if (!confirm('Delete this course and all its materials?')) return;
    try {
      const token = sessionStorage.getItem('accessToken');
      if (!token) return;
      const response = await fetch(getApiUrl(`/api/course/${id}`), {
        method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.ok) { fetchAdminCourses(); setCourseSuccess('Course deleted'); setTimeout(() => setCourseSuccess(''), 3000); }
    } catch (error) { console.error('Error deleting course:', error); }
  };

  const fetchUsers = async () => {
    try {
      const token = sessionStorage.getItem('accessToken');
      if (!token) return;
      const [studentsRes, lecturersRes, statsRes] = await Promise.all([
        fetch(getApiUrl('/api/admin/students'), {
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        }),
        fetch(getApiUrl('/api/admin/lecturers'), {
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        }),
        fetch(getApiUrl('/api/users/dashboard-stats'), {
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        }),
      ]);
      if (studentsRes.ok) {
        const data: StudentsResponse = await studentsRes.json();
        setStudents(data.students);
      }
      if (lecturersRes.ok) {
        const data: LecturersResponse = await lecturersRes.json();
        setLecturers(data.lecturers);
      }
      if (statsRes.ok) {
        const statsData: DashboardStats = await statsRes.json();
        setDashboardStats(statsData);
      }
    } catch (error) {
      console.error('Error refreshing users:', error);
    }
  };

  const handleDeleteStudent = async (student: Student) => {
    const name = `${student.firstName} ${student.lastName}`;
    if (!confirm(`Delete student "${name}" (${student.studentId})? This cannot be undone.`)) return;
    setDeletingUserId(student.id);
    try {
      const token = sessionStorage.getItem('accessToken');
      if (!token) return;
      const response = await fetch(getApiUrl(`/api/admin/students/${student.id}`), {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        alert(data.error || 'Failed to delete student');
        return;
      }
      setUserActionMessage('Student deleted');
      await fetchUsers();
      setTimeout(() => setUserActionMessage(''), 3000);
    } catch (error) {
      console.error('Error deleting student:', error);
      alert('Failed to delete student');
    } finally {
      setDeletingUserId(null);
    }
  };

  const handleDeleteLecturer = async (lecturer: Lecturer) => {
    const name = `${lecturer.firstName} ${lecturer.lastName}`;
    if (!confirm(`Delete lecturer "${name}" (${lecturer.lecturerId})? They will be removed from assigned courses. This cannot be undone.`)) return;
    setDeletingUserId(lecturer.id);
    try {
      const token = sessionStorage.getItem('accessToken');
      if (!token) return;
      const response = await fetch(getApiUrl(`/api/admin/lecturers/${lecturer.id}`), {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        alert(data.error || 'Failed to delete lecturer');
        return;
      }
      setUserActionMessage('Lecturer deleted');
      await fetchUsers();
      setTimeout(() => setUserActionMessage(''), 3000);
    } catch (error) {
      console.error('Error deleting lecturer:', error);
      alert('Failed to delete lecturer');
    } finally {
      setDeletingUserId(null);
    }
  };

  const toggleLecturerAssignment = async (courseId: string, lecturerId: string, currentIds: string[]) => {
    try {
      const token = sessionStorage.getItem('accessToken');
      if (!token) return;
      const isAssigned = currentIds.includes(lecturerId);
      const newIds = isAssigned ? currentIds.filter(id => id !== lecturerId) : [...currentIds, lecturerId];
      const response = await fetch(getApiUrl(`/api/course/${courseId}`), {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ lecturerIds: newIds }),
      });
      if (response.ok) {
        fetchAdminCourses();
        // Update the assigning course state too
        setAssigningCourse((prev: any) => prev ? { ...prev, lecturerIds: newIds } : null);
      }
    } catch (error) { console.error('Error assigning lecturer:', error); }
  };

  useEffect(() => {
    if (activeSection === 'courses') fetchAdminCourses();
  }, [activeSection]);

  const menuItems: NavItem[] = [
    { id: 'overview', name: 'Overview', icon: 'dashboard' },
    { id: 'qr-scanner', name: 'QR Scanner', icon: 'scan' },
    { id: 'student-history', name: 'Student History', icon: 'history' },
    { id: 'students', name: 'Student Management', icon: 'graduation' },
    { id: 'lecturers', name: 'Lecturer Management', icon: 'briefcase' },
    { id: 'departments', name: 'Departments', icon: 'building' },
    { id: 'courses', name: 'Course Management', icon: 'bookOpen' },
    { id: 'attendance', name: 'Attendance Management', icon: 'clipboardCheck' },
    { id: 'reports', name: 'Reports', icon: 'trendingUp' },
    { id: 'settings', name: 'Settings', icon: 'settings' },
  ];

  const adminTourSteps: TourStep[] = [
    {
      title: 'Welcome, Admin 👋',
      description:
        "Let's walk through your institution dashboard in about a minute. You can skip anytime.",
    },
    {
      selector: '[data-tour="profile-card"]',
      title: 'This is you',
      description: 'Your name and institution appear here so you always know you are on the right account.',
      side: 'right',
    },
    {
      selector: '[data-tour="nav-overview"]',
      title: 'Your Overview',
      description: 'Your command centre — key stats, recent activity and quick actions for your institution.',
      side: 'right',
    },
    {
      selector: '[data-tour="nav-qr-scanner"]',
      title: 'QR Scanner',
      description: 'Scan student or lecturer QR codes for attendance and identity verification.',
      side: 'right',
    },
    {
      selector: '[data-tour="nav-students"]',
      title: 'Student Management',
      description: 'Create, activate and manage student accounts across your institution.',
      side: 'right',
    },
    {
      selector: '[data-tour="nav-lecturers"]',
      title: 'Lecturer Management',
      description: 'Onboard lecturers, assign them to courses and manage their access.',
      side: 'right',
    },
    {
      selector: '[data-tour="nav-courses"]',
      title: 'Course Management',
      description: 'Create courses, assign lecturers and organise your academic catalogue.',
      side: 'right',
    },
    {
      selector: '[data-tour="nav-attendance"]',
      title: 'Attendance Management',
      description: 'View attendance across all courses and download institution-wide reports.',
      side: 'right',
    },
    {
      selector: '[data-tour="nav-reports"]',
      title: 'Reports',
      description: 'Analytics on enrolment, attendance and academic performance at a glance.',
      side: 'right',
    },
    {
      selector: '[data-tour="nav-settings"]',
      title: 'Configure your preferences',
      description: 'Set grading scales, institution details and other system-wide settings.',
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

  const quickActions = [
    { id: 'add-student', name: 'Add Student', icon: '🎓', color: 'from-blue-600 to-indigo-600' },
    { id: 'add-lecturer', name: 'Add Lecturer', icon: '👨‍🏫', color: 'from-green-600 to-emerald-600' },
    { id: 'manage-courses', name: 'Manage Courses', icon: '📚', color: 'from-purple-600 to-pink-600' },
    { id: 'view-reports', name: 'View Reports', icon: '📊', color: 'from-cyan-600 to-blue-600' },
  ];

  const handleQuickAction = (actionId: string) => {
    switch (actionId) {
      case 'add-student':
        setActiveSection('students');
        setUserModalType('student');
        setShowUserModal(true);
        break;
      case 'add-lecturer':
        setActiveSection('lecturers');
        setUserModalType('lecturer');
        setShowUserModal(true);
        break;
      case 'manage-courses':
        setActiveSection('courses');
        break;
      case 'view-reports':
        setActiveSection('reports');
        break;
    }
  };

  if (loading) {
    return (
      <div className="app-shell flex items-center justify-center p-4" data-role="admin">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[var(--accent)] mx-auto mb-4" />
          <p className="text-[var(--text-secondary)] text-sm">Loading dashboard…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="app-shell flex items-center justify-center p-4" data-role="admin">
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
      {showUserModal && (
        <UserCreationModal
          isOpen={showUserModal}
          onClose={() => setShowUserModal(false)}
          institutionName={adminData.institution}
          userType={userModalType}
          onSuccess={() => {
            window.location.reload();
          }}
        />
      )}

      <DashboardShell
        role="admin"
        navItems={menuItems}
        activeSection={activeSection}
        onSelectSection={setActiveSection}
        pageTitle={menuItems.find(i => i.id === activeSection)?.name ?? activeSection.replace('-', ' ')}
        pageSubtitle={adminData.institution}
        user={{
          name: adminData.name,
          subtitle: adminData.role,
          secondary: adminData.institution,
          initials: adminData.avatar,
        }}
        topbarActions={
          dashboardStats ? (
            <div className="hidden lg:flex items-center gap-4 px-3 py-1.5 rounded-lg"
                 style={{ background: 'var(--surface-1)', border: '1px solid var(--border-default)' }}>
              <div className="text-right leading-tight">
                <p className="text-[var(--text-primary)] text-sm font-semibold">{dashboardStats.stats.users.students}</p>
                <p className="text-[var(--text-muted)] text-[10px] uppercase tracking-wider">Students</p>
              </div>
              <div className="h-6 w-px bg-[var(--border-default)]" />
              <div className="text-right leading-tight">
                <p className="text-[var(--text-primary)] text-sm font-semibold">{dashboardStats.stats.users.lecturers}</p>
                <p className="text-[var(--text-muted)] text-[10px] uppercase tracking-wider">Lecturers</p>
              </div>
            </div>
          ) : null
        }
        tourSteps={adminTourSteps}
      >
          {activeSection === 'overview' && (
            <div className="space-y-6">
              {/* Welcome Card */}
              <div className="bg-slate-800/50 backdrop-blur-sm p-6 rounded-2xl border border-slate-700/50">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-xl font-bold text-white mb-2">Welcome back, {adminData.name}! 👋</h2>
                    <p className="text-slate-300">Here's your {adminData.institution} overview for today.</p>
                  </div>
                  <div className="text-right">
                    <p className="text-slate-400 text-sm">Total Users</p>
                    <p className="text-white font-semibold text-2xl">{dashboardStats?.stats.users.total || 0}</p>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-slate-800/50 backdrop-blur-sm p-6 rounded-2xl border border-slate-700/50">
                <h3 className="text-lg font-bold text-white mb-4">Quick Actions</h3>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {quickActions.map((action) => (
                    <button
                      key={action.id}
                      onClick={() => handleQuickAction(action.id)}
                      className={`bg-gradient-to-r ${action.color} hover:scale-105 text-white p-4 rounded-lg text-center transition-all duration-300`}
                    >
                      <div className="text-2xl mb-2">{action.icon}</div>
                      <div className="font-medium text-sm">{action.name}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Stats Grid */}
              {dashboardStats && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-slate-800/50 backdrop-blur-sm p-6 rounded-2xl border border-slate-700/50">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-slate-400 text-sm">Total Students</p>
                        <p className="text-2xl font-bold text-white">{dashboardStats.stats.users.students}</p>
                        <p className="text-blue-400 text-sm">Active users</p>
                      </div>
                      <div className="h-12 w-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                        <span className="text-white text-xl">🎓</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-800/50 backdrop-blur-sm p-6 rounded-2xl border border-slate-700/50">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-slate-400 text-sm">Total Lecturers</p>
                        <p className="text-2xl font-bold text-white">{dashboardStats.stats.users.lecturers}</p>
                        <p className="text-green-400 text-sm">Faculty members</p>
                      </div>
                      <div className="h-12 w-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                        <span className="text-white text-xl">👨‍🏫</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-800/50 backdrop-blur-sm p-6 rounded-2xl border border-slate-700/50">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-slate-400 text-sm">Active Users</p>
                        <p className="text-2xl font-bold text-white">{dashboardStats.stats.status.active}</p>
                        <p className="text-purple-400 text-sm">Currently active</p>
                      </div>
                      <div className="h-12 w-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                        <span className="text-white text-xl">✅</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-800/50 backdrop-blur-sm p-6 rounded-2xl border border-slate-700/50">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-slate-400 text-sm">Pending</p>
                        <p className="text-2xl font-bold text-white">{dashboardStats.stats.status.pending}</p>
                        <p className="text-yellow-400 text-sm">Awaiting approval</p>
                      </div>
                      <div className="h-12 w-12 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg flex items-center justify-center">
                        <span className="text-white text-xl">⏳</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Recent Students */}
              <div className="bg-slate-800/50 backdrop-blur-sm p-6 rounded-2xl border border-slate-700/50">
                <h3 className="text-lg font-bold text-white mb-4">Recent Students</h3>
                <div className="space-y-3">
                  {students.length > 0 ? (
                    students.slice(0, 5).map((student) => (
                      <div key={student.id} className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="h-8 w-8 rounded-full bg-blue-900/30 flex items-center justify-center">
                            <span className="text-blue-400">🎓</span>
                          </div>
                          <div>
                            <p className="text-white font-medium">{student.firstName} {student.lastName}</p>
                            <p className="text-slate-400 text-sm">{student.department} • {student.year}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            student.status === 'active' ? 'bg-green-900/30 text-green-400' :
                            'bg-yellow-900/30 text-yellow-400'
                          }`}>
                            {student.status}
                          </span>
                          <p className="text-slate-500 text-xs mt-1">{new Date(student.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-slate-400">No students found</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeSection === 'students' && (
            <div className="space-y-6">
              {userActionMessage && (
                <div className="bg-green-500/10 border border-green-500/50 text-green-400 px-4 py-3 rounded-lg text-sm">
                  {userActionMessage}
                </div>
              )}
              <div className="bg-slate-800/50 backdrop-blur-sm p-6 rounded-2xl border border-slate-700/50">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-white">Student Management</h2>
                  <button 
                    onClick={() => {
                      setUserModalType('student');
                      setShowUserModal(true);
                    }}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-colors"
                  >
                    Add New Student
                  </button>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                  {students.length > 0 ? (
                    students.map((student) => (
                      <div 
                        key={student.id}
                        className="bg-slate-700/30 rounded-lg p-4 hover:bg-slate-700/50 transition-colors"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="text-white font-semibold">{student.firstName} {student.lastName}</h3>
                            <p className="text-slate-400 text-sm">{student.studentId}</p>
                          </div>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            student.status === 'active' ? 'bg-green-900/30 text-green-400' :
                            'bg-yellow-900/30 text-yellow-400'
                          }`}>
                            {student.status}
                          </span>
                        </div>
                        
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-slate-400">Email:</span>
                            <span className="text-white truncate ml-2">{student.email}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Department:</span>
                            <span className="text-white">{student.department}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Year:</span>
                            <span className="text-white">{student.year}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Email Verified:</span>
                            <span className={student.emailVerified ? 'text-green-400' : 'text-red-400'}>
                              {student.emailVerified ? 'Yes' : 'No'}
                            </span>
                          </div>
                        </div>
                        
                        <div className="mt-3 pt-3 border-t border-slate-600 flex items-center justify-between gap-2">
                          <span className="text-slate-400 text-xs">Created: {new Date(student.createdAt).toLocaleDateString()}</span>
                          <button
                            type="button"
                            onClick={() => handleDeleteStudent(student)}
                            disabled={deletingUserId === student.id}
                            className="text-red-400 hover:text-red-300 p-1.5 rounded-lg hover:bg-red-500/10 transition-colors disabled:opacity-50"
                            title="Delete student"
                          >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-full text-center py-8">
                      <p className="text-slate-400">No students found. Create your first student account!</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeSection === 'lecturers' && (
            <div className="space-y-6">
              {userActionMessage && (
                <div className="bg-green-500/10 border border-green-500/50 text-green-400 px-4 py-3 rounded-lg text-sm">
                  {userActionMessage}
                </div>
              )}
              <div className="bg-slate-800/50 backdrop-blur-sm p-6 rounded-2xl border border-slate-700/50">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-white">Lecturer Management</h2>
                  <button 
                    onClick={() => {
                      setUserModalType('lecturer');
                      setShowUserModal(true);
                    }}
                    className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-4 py-2 rounded-lg hover:from-green-700 hover:to-emerald-700 transition-colors"
                  >
                    Add New Lecturer
                  </button>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                  {lecturers.length > 0 ? (
                    lecturers.map((lecturer) => (
                      <div 
                        key={lecturer.id}
                        className="bg-slate-700/30 rounded-lg p-4 hover:bg-slate-700/50 transition-colors"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="text-white font-semibold">{lecturer.firstName} {lecturer.lastName}</h3>
                            <p className="text-slate-400 text-sm">{lecturer.lecturerId}</p>
                          </div>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            lecturer.status === 'active' ? 'bg-green-900/30 text-green-400' :
                            'bg-yellow-900/30 text-yellow-400'
                          }`}>
                            {lecturer.status}
                          </span>
                        </div>
                        
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-slate-400">Email:</span>
                            <span className="text-white truncate ml-2">{lecturer.email}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Department:</span>
                            <span className="text-white">{lecturer.department}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Title:</span>
                            <span className="text-white">{lecturer.title}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Specialization:</span>
                            <span className="text-white">{lecturer.specialization}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Email Verified:</span>
                            <span className={lecturer.emailVerified ? 'text-green-400' : 'text-red-400'}>
                              {lecturer.emailVerified ? 'Yes' : 'No'}
                            </span>
                          </div>
                        </div>
                        
                        <div className="mt-3 pt-3 border-t border-slate-600 flex items-center justify-between gap-2">
                          <span className="text-slate-400 text-xs">Created: {new Date(lecturer.createdAt).toLocaleDateString()}</span>
                          <button
                            type="button"
                            onClick={() => handleDeleteLecturer(lecturer)}
                            disabled={deletingUserId === lecturer.id}
                            className="text-red-400 hover:text-red-300 p-1.5 rounded-lg hover:bg-red-500/10 transition-colors disabled:opacity-50"
                            title="Delete lecturer"
                          >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-full text-center py-8">
                      <p className="text-slate-400">No lecturers found. Create your first lecturer account!</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Course Management Section */}
          {activeSection === 'courses' && (
            <div className="space-y-4">
              <div className="bg-slate-800/50 backdrop-blur-sm p-5 rounded-2xl border border-slate-700/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">📚 Course Management</h2>
                  <p className="text-slate-400 text-xs mt-1">{adminCourses.length} course{adminCourses.length !== 1 ? 's' : ''} total • {adminCourses.filter((c: any) => c.level === selectedCourseLevel).length} in {selectedCourseLevel}</p>
                </div>
                <button onClick={() => { setShowCourseModal(true); setEditingCourse(null); setCourseForm({ courseCode: '', courseName: '', description: '', credits: 3, department: '', level: selectedCourseLevel, semester: 'First' }); setCourseError(''); }} className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all text-sm font-medium">+ Add {selectedCourseLevel} Course</button>
              </div>

              {/* Level Tabs */}
              <div className="flex bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 p-1 gap-1 overflow-x-auto">
                {['100L', '200L', '300L', '400L', '500L', '600L'].map(level => {
                  const count = adminCourses.filter((c: any) => c.level === level).length;
                  return (
                    <button key={level} onClick={() => setSelectedCourseLevel(level)} className={`flex-1 min-w-[60px] px-3 py-2.5 rounded-lg text-xs font-medium transition-all flex flex-col items-center gap-0.5 ${selectedCourseLevel === level ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-slate-700/50'}`}>
                      <span>{level}</span>
                      {count > 0 && <span className={`text-[10px] ${selectedCourseLevel === level ? 'text-purple-200' : 'text-slate-500'}`}>{count}</span>}
                    </button>
                  );
                })}
              </div>

              {courseSuccess && <div className="bg-green-900/30 border border-green-700/50 text-green-400 p-3 rounded-xl text-sm">{courseSuccess}</div>}

              {/* Course Modal */}
              {showCourseModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                  <div className="bg-slate-800 rounded-2xl p-6 max-w-md w-full border border-slate-700/80 shadow-2xl">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-bold text-white">{editingCourse ? 'Edit Course' : 'Add Course'}</h3>
                      <button onClick={() => setShowCourseModal(false)} className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-700/50">
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                    </div>
                    {courseError && <div className="bg-red-900/30 border border-red-700/50 text-red-400 p-3 rounded-lg mb-4 text-sm">{courseError}</div>}
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs text-slate-400 mb-1">Course Code</label>
                          <input type="text" value={courseForm.courseCode} onChange={(e) => setCourseForm(prev => ({...prev, courseCode: e.target.value}))} placeholder="CSC201" className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50" />
                        </div>
                        <div>
                          <label className="block text-xs text-slate-400 mb-1">Level</label>
                          <select value={courseForm.level} onChange={(e) => setCourseForm(prev => ({...prev, level: e.target.value}))} className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50">
                            {['100L','200L','300L','400L','500L','600L'].map(l => <option key={l} value={l}>{l}</option>)}
                          </select>
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">Course Name</label>
                        <input type="text" value={courseForm.courseName} onChange={(e) => setCourseForm(prev => ({...prev, courseName: e.target.value}))} placeholder="Data Structures and Algorithms" className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50" />
                      </div>
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">Department <span className="text-red-400">*</span></label>
                        <DepartmentCombobox
                          value={courseForm.department}
                          onChange={(v) => setCourseForm(prev => ({ ...prev, department: v }))}
                          accent="purple"
                          compact
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs text-slate-400 mb-1">Credits</label>
                          <input type="number" value={courseForm.credits} onChange={(e) => setCourseForm(prev => ({...prev, credits: parseInt(e.target.value) || 0}))} className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50" />
                        </div>
                        <div>
                          <label className="block text-xs text-slate-400 mb-1">Semester</label>
                          <select value={courseForm.semester} onChange={(e) => setCourseForm(prev => ({...prev, semester: e.target.value}))} className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50">
                            <option value="First">First</option>
                            <option value="Second">Second</option>
                          </select>
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">Description (optional)</label>
                        <textarea value={courseForm.description} onChange={(e) => setCourseForm(prev => ({...prev, description: e.target.value}))} placeholder="Brief course description..." className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 resize-none" rows={2} />
                      </div>
                      <div className="flex gap-3 pt-2">
                        <button onClick={() => setShowCourseModal(false)} className="flex-1 border border-slate-600 text-slate-300 py-2.5 rounded-lg hover:bg-slate-700/50 text-sm">Cancel</button>
                        <button onClick={handleCourseSubmit} className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-2.5 rounded-lg hover:from-purple-700 hover:to-pink-700 text-sm font-medium">{editingCourse ? 'Update' : 'Create'}</button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Assign Lecturer Modal */}
              {assigningCourse && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                  <div className="bg-slate-800 rounded-2xl p-6 max-w-md w-full border border-slate-700/80 shadow-2xl max-h-[80vh] overflow-y-auto">
                    <div className="flex justify-between items-center mb-4">
                      <div>
                        <h3 className="text-lg font-bold text-white">Assign Lecturers</h3>
                        <p className="text-slate-400 text-xs mt-0.5">{assigningCourse.courseCode} — {assigningCourse.courseName}</p>
                      </div>
                      <button onClick={() => setAssigningCourse(null)} className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-700/50">
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                    </div>
                    {lecturers.length === 0 ? (
                      <p className="text-slate-400 text-sm text-center py-6">No lecturers found in your institution</p>
                    ) : (
                      <div className="space-y-2">
                        {lecturers.map((lec) => {
                          const isAssigned = (assigningCourse.lecturerIds || []).includes(lec.id);
                          return (
                            <div key={lec.id} className={`flex items-center justify-between p-3 rounded-xl border transition-all ${isAssigned ? 'bg-green-900/15 border-green-500/25' : 'bg-slate-700/20 border-slate-600/20 hover:border-slate-500/30'}`}>
                              <div className="flex items-center gap-3">
                                <div className={`h-9 w-9 rounded-full flex items-center justify-center text-xs font-bold ${isAssigned ? 'bg-green-600 text-white' : 'bg-slate-600 text-slate-300'}`}>
                                  {lec.firstName[0]}{lec.lastName[0]}
                                </div>
                                <div>
                                  <p className="text-white text-sm font-medium">{lec.firstName} {lec.lastName}</p>
                                  <p className="text-slate-400 text-xs">{lec.department} • {lec.email}</p>
                                </div>
                              </div>
                              <button
                                onClick={() => toggleLecturerAssignment(assigningCourse._id, lec.id, assigningCourse.lecturerIds || [])}
                                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${isAssigned ? 'bg-red-600/20 text-red-300 hover:bg-red-600/30' : 'bg-green-600/20 text-green-300 hover:bg-green-600/30'}`}
                              >
                                {isAssigned ? 'Remove' : 'Assign'}
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Course List */}
              {loadingAdminCourses ? (
                <div className="text-center py-16">
                  <div className="animate-spin rounded-full h-10 w-10 border-2 border-purple-500 border-t-transparent mx-auto mb-4"></div>
                  <p className="text-slate-400 text-sm">Loading courses...</p>
                </div>
              ) : adminCourses.filter((c: any) => c.level === selectedCourseLevel).length === 0 ? (
                <div className="bg-slate-800/30 rounded-2xl border border-slate-700/30 text-center py-16 px-6">
                  <div className="h-16 w-16 bg-slate-700/30 rounded-2xl flex items-center justify-center mx-auto mb-4"><span className="text-3xl">📚</span></div>
                  <p className="text-slate-300 font-medium mb-1">No {selectedCourseLevel} courses yet</p>
                  <p className="text-slate-500 text-sm">Click "+ Add {selectedCourseLevel} Course" to create one</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {adminCourses.filter((c: any) => c.level === selectedCourseLevel).map((c: any) => (
                    <div key={c._id} className="group bg-slate-800/40 rounded-xl border border-slate-700/30 p-4 hover:border-slate-600/40 transition-all flex items-center gap-4">
                      <div className="h-11 w-11 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-bold text-xs">{c.courseCode.slice(0, 3)}</span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="text-white font-medium text-sm">{c.courseCode}</h4>
                          <span className="text-[10px] bg-slate-700/50 text-slate-400 px-2 py-0.5 rounded-full">{c.level}</span>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full ${c.status === 'active' ? 'bg-green-600/20 text-green-300' : 'bg-slate-600/20 text-slate-400'}`}>{c.status}</span>
                        </div>
                        <p className="text-slate-300 text-xs mt-0.5">{c.courseName}</p>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-[11px] text-slate-500">{c.department}</span>
                          {c.credits > 0 && <span className="text-[11px] text-slate-500">{c.credits} credits</span>}
                          {c.semester && <span className="text-[11px] text-slate-500">{c.semester}</span>}
                          {(() => {
                            const ids: string[] = c.lecturerIds || [];
                            if (ids.length === 0) {
                              return <span className="text-[11px] text-amber-400/80 inline-flex items-center gap-1">👤 Unassigned</span>;
                            }
                            const names = ids
                              .map((id) => {
                                const lec = lecturers.find((l) => l.id === id);
                                return lec
                                  ? formatLecturerDisplayName({
                                      title: lec.title,
                                      firstName: lec.firstName,
                                      lastName: lec.lastName,
                                    })
                                  : null;
                              })
                              .filter(Boolean) as string[];
                            if (names.length === 0) {
                              return <span className="text-[11px] text-slate-500">{ids.length} lecturer{ids.length !== 1 ? 's' : ''}</span>;
                            }
                            const shown = names.slice(0, 2).join(', ');
                            const extra = names.length - 2;
                            return (
                              <span className="text-[11px] text-emerald-400/90 inline-flex items-center gap-1" title={names.join(', ')}>
                                👤 {shown}{extra > 0 ? ` +${extra} more` : ''}
                              </span>
                            );
                          })()}
                        </div>
                      </div>
                      <div className="flex gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => setAssigningCourse(c)} className="text-green-400 hover:text-green-300 p-2 rounded-lg hover:bg-green-500/10 transition-colors" title="Assign Lecturers">
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" /></svg>
                        </button>
                        <button onClick={() => { setEditingCourse(c); setCourseForm({ courseCode: c.courseCode, courseName: c.courseName, description: c.description || '', credits: c.credits || 3, department: c.department, level: c.level, semester: c.semester || 'First' }); setShowCourseModal(true); setCourseError(''); }} className="text-blue-400 hover:text-blue-300 p-2 rounded-lg hover:bg-blue-500/10 transition-colors" title="Edit">
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" /></svg>
                        </button>
                        <button onClick={() => handleDeleteCourse(c._id)} className="text-red-400 hover:text-red-300 p-2 rounded-lg hover:bg-red-500/10 transition-colors" title="Delete">
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Attendance — institution-wide overview across all departments */}
          {activeSection === 'attendance' && (
            <AdminAttendanceOverview
              onOpenScanner={(sessionId) => {
                sessionStorage.setItem('activeAttendanceSessionId', sessionId);
                setActiveSection('qr-scanner');
              }}
            />
          )}

          {/* Settings Section */}
          {activeSection === 'settings' && (
            <div className="space-y-6">
              <div className="flex items-start gap-3">
                <div
                  className="h-10 w-10 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background: "var(--accent-soft)", color: "var(--accent)" }}
                >
                  <Icon name="settings" size={20} />
                </div>
                <div className="min-w-0">
                  <h2 className="text-[var(--text-primary)] text-xl font-semibold tracking-tight">Settings</h2>
                  <p className="text-[var(--text-muted)] text-sm mt-1">
                    Security and institution-wide configuration.
                  </p>
                </div>
              </div>

              <AdminMfaSettings />
              <GradeScaleSettings />
            </div>
          )}

          {/* Reports & Analytics Section */}
          {activeSection === 'reports' && (
            <AdminReports />
          )}

          {!['overview', 'students', 'lecturers', 'qr-scanner', 'student-history', 'courses', 'attendance', 'settings', 'reports'].includes(activeSection) && (
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

          {/* QR Scanner Section */}
          {activeSection === 'qr-scanner' && (
            <QRScannerNew />
          )}

          {/* Student History Section */}
          {activeSection === 'student-history' && (
            <div className="space-y-6">
              <div className="bg-slate-800/50 backdrop-blur-sm p-6 rounded-2xl border border-slate-700/50">
                <h2 className="text-xl font-bold text-white mb-6">Student Attendance History</h2>
                <p className="text-slate-400 mb-4">Search for a student by name or Student ID to view their attendance history</p>

                {(() => {
                  const q = historyQuery.trim().toLowerCase();
                  const matches = q.length < 1 ? [] : students.filter((s) => {
                    const name = `${s.firstName} ${s.lastName}`.toLowerCase();
                    return (
                      name.includes(q) ||
                      s.studentId.toLowerCase().includes(q) ||
                      (s.email || '').toLowerCase().includes(q)
                    );
                  }).slice(0, 25);
                  return (
                    <div className="mb-6 relative">
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Search by name or Student ID
                      </label>
                      <input
                        type="text"
                        value={historyQuery}
                        onChange={(e) => {
                          setHistoryQuery(e.target.value);
                          if (selectedHistoryStudent) {
                            setSelectedHistoryStudent(null);
                            setSearchStudentId('');
                          }
                        }}
                        placeholder="e.g., John Doe or UNIBADAN-123456789"
                        className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />

                      {q.length >= 1 && !selectedHistoryStudent && (
                        <div className="absolute z-20 mt-1 w-full bg-slate-800 border border-slate-600 rounded-lg shadow-xl max-h-72 overflow-y-auto">
                          {matches.length === 0 ? (
                            <p className="px-4 py-3 text-slate-400 text-sm">No students found.</p>
                          ) : (
                            matches.map((s) => (
                              <button
                                key={s.id}
                                type="button"
                                onClick={() => {
                                  setSelectedHistoryStudent(s);
                                  setSearchStudentId(s.studentId);
                                  setHistoryQuery(`${s.firstName} ${s.lastName}`);
                                }}
                                className="w-full text-left px-4 py-3 hover:bg-slate-700/70 transition-colors flex items-center gap-3 border-b border-slate-700/50 last:border-0"
                              >
                                <div className="h-8 w-8 rounded-full bg-blue-600/30 text-blue-300 flex items-center justify-center text-xs font-semibold shrink-0">
                                  {s.firstName[0]}{s.lastName[0]}
                                </div>
                                <div className="min-w-0">
                                  <p className="text-white text-sm font-medium truncate">
                                    {s.firstName} {s.lastName}
                                  </p>
                                  <p className="text-slate-400 text-xs truncate">
                                    {s.studentId} · {s.department} · {s.year}
                                  </p>
                                </div>
                              </button>
                            ))
                          )}
                        </div>
                      )}
                    </div>
                  );
                })()}

                {searchStudentId && searchStudentId.length > 5 ? (
                  <AttendanceHistory studentId={searchStudentId} />
                ) : (
                  <div className="text-center py-12">
                    <div className="h-16 w-16 bg-slate-700/30 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="h-8 w-8 text-slate-400" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                      </svg>
                    </div>
                    <p className="text-slate-400">Search by name or Student ID to view attendance history</p>
                  </div>
                )}
              </div>
            </div>
          )}
      </DashboardShell>
    </>
  );
}

// User Creation Modal Component
function UserCreationModal({ 
  isOpen, 
  onClose, 
  institutionName,
  userType,
  onSuccess
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  institutionName: string;
  userType: 'student' | 'lecturer';
  onSuccess: () => void;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [emailStatus, setEmailStatus] = useState<'idle' | 'checking' | 'available' | 'reissue' | 'taken'>('idle');
  const [success, setSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    department: '',
    year: '',
    title: '',
    specialization: ''
  });

  // Reset form when modal opens or userType changes
  useEffect(() => {
    if (isOpen) {
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        department: '',
        year: '',
        title: '',
        specialization: ''
      });
      setError('');
      setEmailError('');
      setEmailStatus('idle');
      setSuccess(false);
      setSuccessMessage('');
    }
  }, [isOpen, userType]);

  // Live email-availability check (debounced). Emails are unique per-institution
  // and across all roles, so we warn the admin before they submit.
  useEffect(() => {
    const email = formData.email.trim();
    const looksValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!looksValid) {
      setEmailStatus('idle');
      setEmailError('');
      return;
    }

    let cancelled = false;
    setEmailStatus('checking');
    const t = setTimeout(async () => {
      try {
        const token = sessionStorage.getItem('accessToken');
        const res = await fetch(
          getApiUrl(`/api/admin/check-email?email=${encodeURIComponent(email)}&userType=${userType}`),
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const data = await res.json();
        if (cancelled) return;
        if (data.available && data.reissue) {
          setEmailStatus('reissue');
          setEmailError(data.message || 'Activation will be resent for this pending account.');
        } else if (data.available) {
          setEmailStatus('available');
          setEmailError('');
        } else if (data.valid) {
          setEmailStatus('taken');
          setEmailError(data.message || 'This email is already in use at your institution.');
        } else {
          setEmailStatus('idle');
          setEmailError('');
        }
      } catch {
        if (!cancelled) setEmailStatus('idle');
      }
    }, 500);

    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [formData.email, userType]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
    if (e.target.name === 'email') setEmailError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setEmailError('');

    // Block submit if we already know the email is taken.
    if (emailStatus === 'taken') {
      setEmailError('This email is already in use at your institution. Please use a different one.');
      return;
    }

    setIsLoading(true);

    try {
      const token = sessionStorage.getItem('accessToken');
      if (!token) {
        setError('Authentication required. Please login again.');
        return;
      }

      // Prepare request body based on user type
      let requestBody: any = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        department: formData.department
      };

      if (userType === 'student') {
        requestBody.year = formData.year;
      } else {
        requestBody.title = formData.title;
        requestBody.specialization = formData.specialization;
      }

      const endpoint = userType === 'student' 
        ? getApiUrl('/api/admin/students')
        : getApiUrl('/api/admin/lecturers');

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestBody)
      });

      const data = await response.json();

      if (!response.ok) {
        // Surface email clashes inline on the field; everything else as a banner.
        if (data.field === 'email' || data.code === 'EMAIL_EXISTS_SAME_INSTITUTION') {
          setEmailStatus('taken');
          setEmailError(data.error || data.message || 'This email is already in use at your institution.');
          return;
        }
        throw new Error(data.error || data.message || `Failed to create ${userType} account`);
      }

      setSuccess(true);
      setSuccessMessage(
        data.reissued
          ? data.message || 'Activation email resent. The previous link is no longer valid.'
          : `Activation email sent to ${formData.email}`,
      );
      setTimeout(() => {
        onClose();
        onSuccess();
      }, 2000);
    } catch (err: any) {
      setError(err.message || `Failed to create ${userType}. Please try again.`);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-slate-800 rounded-2xl p-8 max-w-2xl w-full border border-slate-700 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="text-2xl font-bold text-white">Create New {userType === 'student' ? 'Student' : 'Lecturer'}</h3>
            <p className="text-slate-400 text-sm mt-1">An activation email will be sent to the {userType}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {success ? (
          <div className="text-center py-8">
            <div className="h-16 w-16 bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="h-8 w-8 text-green-400" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h4 className="text-xl font-bold text-white mb-2">
              {successMessage.includes('resent') ? 'Activation Resent' : `${userType === 'student' ? 'Student' : 'Lecturer'} Created Successfully!`}
            </h4>
            <p className="text-slate-300">{successMessage}</p>
          </div>
        ) : (
          <>
            {error && (
              <div className="mb-4 p-3 rounded-lg border bg-red-900/30 border-red-700">
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    First Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="John"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Last Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Doe"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Email Address <span className="text-red-400">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  aria-invalid={emailStatus === 'taken'}
                  className={`w-full px-3 py-2 bg-slate-700 border rounded-lg text-white focus:outline-none focus:ring-2 ${
                    emailStatus === 'taken'
                      ? 'border-red-500 focus:ring-red-500'
                      : emailStatus === 'available'
                        ? 'border-green-500 focus:ring-green-500'
                        : emailStatus === 'reissue'
                          ? 'border-amber-500 focus:ring-amber-500'
                        : 'border-slate-600 focus:ring-blue-500'
                  }`}
                  placeholder={userType === 'student' ? 'john.doe@university.edu' : 'prof.doe@university.edu'}
                />
                {emailStatus === 'checking' && (
                  <p className="mt-1 text-xs text-slate-400">Checking availability…</p>
                )}
                {emailStatus === 'available' && (
                  <p className="mt-1 text-xs text-green-400">✓ Email is available</p>
                )}
                {emailStatus === 'reissue' && emailError && (
                  <p className="mt-1 text-xs text-amber-400">{emailError}</p>
                )}
                {emailStatus === 'taken' && emailError && (
                  <p className="mt-1 text-xs text-red-400">{emailError}</p>
                )}
                <p className="mt-1 text-[11px] text-slate-500">
                  Each email can be used once per institution (across students, lecturers and admins).
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Institution</label>
                <input
                  type="text"
                  value={institutionName}
                  disabled
                  className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded-lg text-slate-400 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Department <span className="text-red-400">*</span>
                </label>
                <DepartmentCombobox
                  value={formData.department}
                  onChange={(v) => {
                    setFormData((prev) => ({ ...prev, department: v }));
                    setError('');
                  }}
                />
                <p className="mt-1 text-[11px] text-slate-500">
                  Search the list, or type a department that isn&apos;t listed to add it.
                </p>
              </div>

              {userType === 'student' ? (
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Academic Year <span className="text-red-400">*</span>
                  </label>
                  <select
                    name="year"
                    value={formData.year}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select year...</option>
                    <option value="Freshman (Year 1)">Freshman (Year 1)</option>
                    <option value="Sophomore (Year 2)">Sophomore (Year 2)</option>
                    <option value="Junior (Year 3)">Junior (Year 3)</option>
                    <option value="Senior (Year 4)">Senior (Year 4)</option>
                    <option value="Graduate Student">Graduate Student</option>
                  </select>
                </div>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Title <span className="text-red-400">*</span>
                    </label>
                    <select
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select title...</option>
                      <option value="Prof">Prof</option>
                      <option value="Dr">Dr</option>
                      <option value="Mr">Mr</option>
                      <option value="Mrs">Mrs</option>
                      <option value="Ms">Ms</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Specialization <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      name="specialization"
                      value={formData.specialization}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., Machine Learning, Database Systems, Software Engineering"
                    />
                  </div>
                </>
              )}

              <div className="flex gap-3 mt-6 pt-4 border-t border-slate-700">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isLoading}
                  className="flex-1 border border-slate-600 text-slate-300 py-2 rounded-lg hover:bg-slate-700/50 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading || emailStatus === 'taken' || emailStatus === 'checking'}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Creating...
                    </div>
                  ) : (
                    `Create ${userType === 'student' ? 'Student' : 'Lecturer'}`
                  )}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}