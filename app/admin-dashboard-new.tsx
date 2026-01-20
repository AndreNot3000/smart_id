"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

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

interface StudentsResponse {
  students: Student[];
  total: number;
}

export default function AdminDashboard() {
  const [activeSection, setActiveSection] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [userModalType, setUserModalType] = useState('create');
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch dashboard statistics
  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        if (!token) {
          throw new Error('No access token found');
        }

        const response = await fetch('http://localhost:8000/api/users/dashboard-stats', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch dashboard stats');
        }

        const data = await response.json();
        setDashboardStats(data);
      } catch (err) {
        console.error('Error fetching dashboard stats:', err);
        setError(err instanceof Error ? err.message : 'Failed to load dashboard stats');
      }
    };

    fetchDashboardStats();
  }, []);

  // Fetch students data
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        if (!token) {
          throw new Error('No access token found');
        }

        const response = await fetch('http://localhost:8000/api/admin/students', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch students');
        }

        const data: StudentsResponse = await response.json();
        setStudents(data.students);
      } catch (err) {
        console.error('Error fetching students:', err);
        setError(err instanceof Error ? err.message : 'Failed to load students');
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  const adminData = {
    name: 'Michael Anderson',
    id: 'EMP123456789',
    email: 'michael.anderson@harvard.edu',
    role: 'Registrar',
    department: 'Academic Affairs',
    institution: 'Harvard University',
    permissions: 'Institution Admin',
    avatar: 'MA',
    lastLogin: '2024-01-15 09:30 AM'
  };

  const menuItems = [
    { id: 'overview', name: 'Dashboard Overview', icon: '📊' },
    { id: 'students', name: 'Student Management', icon: '🎓' },
    { id: 'lecturers', name: 'Lecturer Management', icon: '👨‍🏫' },
    { id: 'departments', name: 'Departments', icon: '🏢' },
    { id: 'courses', name: 'Course Management', icon: '📚' },
    { id: 'attendance', name: 'Attendance Reports', icon: '📋' },
    { id: 'grades', name: 'Grade Management', icon: '📝' },
    { id: 'enrollment', name: 'Enrollment', icon: '📝' },
    { id: 'reports', name: 'Academic Reports', icon: '📈' },
    { id: 'events', name: 'Campus Events', icon: '🎉' },
    { id: 'announcements', name: 'Announcements', icon: '📢' },
    { id: 'settings', name: 'Institution Settings', icon: '⚙️' }
  ];

  const quickActions = [
    { id: 'add-student', name: 'Add Student', icon: '🎓', color: 'from-blue-600 to-indigo-600' },
    { id: 'add-lecturer', name: 'Add Lecturer', icon: '👨‍🏫', color: 'from-green-600 to-emerald-600' },
    { id: 'manage-courses', name: 'Manage Courses', icon: '📚', color: 'from-purple-600 to-pink-600' },
    { id: 'view-reports', name: 'View Reports', icon: '📊', color: 'from-cyan-600 to-blue-600' },
    { id: 'enrollment', name: 'Enrollment', icon: '📝', color: 'from-yellow-600 to-orange-600' },
    { id: 'announcements', name: 'Send Announcement', icon: '📢', color: 'from-red-600 to-pink-600' }
  ];

  const handleQuickAction = (actionId: string) => {
    switch (actionId) {
      case 'add-student':
        setActiveSection('students');
        setShowUserModal(true);
        setUserModalType('create');
        break;
      case 'add-lecturer':
        setActiveSection('lecturers');
        setShowUserModal(true);
        setUserModalType('create');
        break;
      case 'manage-courses':
        setActiveSection('courses');
        break;
      case 'view-reports':
        setActiveSection('reports');
        break;
      case 'enrollment':
        setActiveSection('enrollment');
        break;
      case 'announcements':
        setActiveSection('announcements');
        break;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-800/95 backdrop-blur-sm border-r border-slate-700/50 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between p-6 border-b border-slate-700/50">
          <Link href="/" className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm">ID</span>
            </div>
            <span className="text-xl font-bold text-white">Campus ID</span>
          </Link>
          <button 
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-slate-400 hover:text-white"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Admin Profile */}
        <div className="p-4 sm:p-6 border-b border-slate-700/50">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 sm:h-12 sm:w-12 bg-gradient-to-br from-red-500 to-orange-600 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-sm sm:text-base">{adminData.avatar}</span>
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-white font-semibold text-sm sm:text-base truncate">{adminData.name}</h3>
              <p className="text-slate-400 text-xs sm:text-sm truncate">{adminData.role}</p>
              <p className="text-slate-500 text-xs truncate">{adminData.permissions}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 max-h-96 overflow-y-auto">
          <ul className="space-y-1">
            {menuItems.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => {
                    setActiveSection(item.id);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center space-x-3 px-3 sm:px-4 py-3 sm:py-3 rounded-lg text-left transition-colors touch-manipulation ${
                    activeSection === item.id
                      ? 'bg-gradient-to-r from-red-600 to-orange-600 text-white'
                      : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
                  }`}
                >
                  <span className="text-lg">{item.icon}</span>
                  <span className="text-sm">{item.name}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* Logout */}
        <div className="absolute bottom-4 left-4 right-4">
          <Link href="/" className="flex items-center space-x-3 px-4 py-3 text-slate-300 hover:bg-slate-700/50 hover:text-white rounded-lg transition-colors">
            <span className="text-lg">🚪</span>
            <span>Logout</span>
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:ml-64">
        {/* Header */}
        <header className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700/50 px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden text-slate-400 hover:text-white p-1"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                </svg>
              </button>
              <h1 className="text-lg sm:text-2xl font-bold text-white capitalize truncate">{activeSection.replace('-', ' ')}</h1>
            </div>
            
            <div className="flex items-center space-x-2 sm:space-x-4">
              <div className="hidden sm:flex items-center space-x-4">
                <div className="text-right">
                  <p className="text-white font-semibold text-sm">
                    {loading ? 'Loading...' : dashboardStats?.stats.users.students.toLocaleString() || '0'}
                  </p>
                  <p className="text-slate-400 text-xs">Students</p>
                </div>
                <div className="text-right">
                  <p className="text-white font-semibold text-sm">
                    {loading ? 'Loading...' : dashboardStats?.stats.users.lecturers || '0'}
                  </p>
                  <p className="text-slate-400 text-xs">Lecturers</p>
                </div>
              </div>
              
              <div className="h-8 w-8 sm:h-10 sm:w-10 bg-gradient-to-br from-red-500 to-orange-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm sm:text-base">{adminData.avatar}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="p-4 sm:p-6">
          {activeSection === 'overview' && (
            <div className="space-y-6">
              {/* Welcome Card */}
              <div className="card-hover bg-slate-800/50 backdrop-blur-sm p-6 rounded-2xl border border-slate-700/50">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-xl font-bold text-white mb-2">
                      {loading ? 'Loading...' : error ? 'Error loading data' : `Welcome back, ${adminData.name}! 👋`}
                    </h2>
                    <p className="text-slate-300">
                      {loading ? 'Fetching your institution overview...' : 
                       error ? 'Please refresh the page to try again.' :
                       "Here's your Harvard University overview for today."}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-slate-400 text-sm">Academic Year</p>
                    <p className="text-white font-semibold">2024-2025</p>
                    <p className="text-slate-400 text-xs">Fall 2024</p>
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

              {/* Institution Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                <div className="card-hover bg-slate-800/50 backdrop-blur-sm p-4 sm:p-6 rounded-2xl border border-slate-700/50">
                  <div className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="text-slate-400 text-xs sm:text-sm">Total Students</p>
                      <p className="text-xl sm:text-2xl font-bold text-white">
                        {loading ? 'Loading...' : dashboardStats?.stats.users.students.toLocaleString() || '0'}
                      </p>
                      <p className="text-blue-400 text-xs sm:text-sm">+125 this semester</p>
                    </div>
                    <div className="h-10 w-10 sm:h-12 sm:w-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-lg sm:text-xl">🎓</span>
                    </div>
                  </div>
                </div>

                <div className="card-hover bg-slate-800/50 backdrop-blur-sm p-4 sm:p-6 rounded-2xl border border-slate-700/50">
                  <div className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="text-slate-400 text-xs sm:text-sm">Total Lecturers</p>
                      <p className="text-xl sm:text-2xl font-bold text-white">
                        {loading ? 'Loading...' : dashboardStats?.stats.users.lecturers || '0'}
                      </p>
                      <p className="text-green-400 text-xs sm:text-sm">+8 new hires</p>
                    </div>
                    <div className="h-10 w-10 sm:h-12 sm:w-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-lg sm:text-xl">👨‍🏫</span>
                    </div>
                  </div>
                </div>

                <div className="card-hover bg-slate-800/50 backdrop-blur-sm p-4 sm:p-6 rounded-2xl border border-slate-700/50">
                  <div className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="text-slate-400 text-xs sm:text-sm">Active Users</p>
                      <p className="text-xl sm:text-2xl font-bold text-white">
                        {loading ? 'Loading...' : dashboardStats?.stats.status.active || '0'}
                      </p>
                      <p className="text-purple-400 text-xs sm:text-sm">Online now</p>
                    </div>
                    <div className="h-10 w-10 sm:h-12 sm:w-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-lg sm:text-xl">🏢</span>
                    </div>
                  </div>
                </div>

                <div className="card-hover bg-slate-800/50 backdrop-blur-sm p-4 sm:p-6 rounded-2xl border border-slate-700/50">
                  <div className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="text-slate-400 text-xs sm:text-sm">Total Users</p>
                      <p className="text-xl sm:text-2xl font-bold text-white">
                        {loading ? 'Loading...' : dashboardStats?.stats.users.total.toLocaleString() || '0'}
                      </p>
                      <p className="text-cyan-400 text-xs sm:text-sm">All roles</p>
                    </div>
                    <div className="h-10 w-10 sm:h-12 sm:w-12 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-lg sm:text-xl">📚</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
                {/* Recent Students */}
                <div className="card-hover bg-slate-800/50 backdrop-blur-sm p-4 sm:p-6 rounded-2xl border border-slate-700/50">
                  <h3 className="text-base sm:text-lg font-bold text-white mb-4">Recent Student Enrollments</h3>
                  {loading ? (
                    <div className="space-y-3">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="animate-pulse">
                          <div className="flex items-center space-x-3 p-3 bg-slate-700/30 rounded-lg">
                            <div className="h-8 w-8 rounded-full bg-slate-600"></div>
                            <div className="flex-1 space-y-2">
                              <div className="h-4 bg-slate-600 rounded w-3/4"></div>
                              <div className="h-3 bg-slate-600 rounded w-1/2"></div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : error ? (
                    <div className="text-center py-8">
                      <p className="text-red-400 mb-2">Failed to load students</p>
                      <p className="text-slate-400 text-sm">{error}</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {students.slice(0, 3).map((student) => (
                        <div key={student.id} className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg hover:bg-slate-700/50 transition-colors">
                          <div className="flex items-center space-x-3 min-w-0 flex-1">
                            <div className="h-8 w-8 rounded-full bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                              <span className="text-blue-400">🎓</span>
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-white font-medium text-sm sm:text-base truncate">
                                {student.firstName} {student.lastName}
                              </p>
                              <p className="text-slate-400 text-xs sm:text-sm truncate">
                                {student.department} • {student.year}
                              </p>
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              student.status === 'active' ? 'bg-green-900/30 text-green-400' :
                              student.status === 'pending' ? 'bg-yellow-900/30 text-yellow-400' :
                              'bg-red-900/30 text-red-400'
                            }`}>
                              {student.status}
                            </span>
                            <p className="text-slate-500 text-xs mt-1">
                              {new Date(student.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      ))}
                      {students.length === 0 && (
                        <div className="text-center py-8">
                          <p className="text-slate-400">No students found</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Pending Approvals Placeholder */}
                <div className="card-hover bg-slate-800/50 backdrop-blur-sm p-4 sm:p-6 rounded-2xl border border-slate-700/50">
                  <h3 className="text-base sm:text-lg font-bold text-white mb-4">System Status</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-slate-700/30 rounded-lg">
                      <span className="text-slate-300">Active Users</span>
                      <span className="text-green-400 font-semibold">
                        {dashboardStats?.stats.status.active || 0}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-slate-700/30 rounded-lg">
                      <span className="text-slate-300">Pending Users</span>
                      <span className="text-yellow-400 font-semibold">
                        {dashboardStats?.stats.status.pending || 0}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-slate-700/30 rounded-lg">
                      <span className="text-slate-300">Suspended Users</span>
                      <span className="text-red-400 font-semibold">
                        {dashboardStats?.stats.status.suspended || 0}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Other sections placeholder */}
          {activeSection !== 'overview' && (
            <div className="card-hover bg-slate-800/50 backdrop-blur-sm p-8 rounded-2xl border border-slate-700/50 text-center">
              <div className="text-6xl mb-4">
                {menuItems.find(item => item.id === activeSection)?.icon}
              </div>
              <h2 className="text-2xl font-bold text-white mb-4 capitalize">
                {activeSection.replace('-', ' ')}
              </h2>
              <p className="text-slate-300">This section is coming soon! We're building comprehensive admin tools for managing your institution.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}