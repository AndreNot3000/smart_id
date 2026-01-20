"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

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
  const [showUserModal, setShowUserModal] = useState(false);
  
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
  
  // UI states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch all dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        if (!token) {
          router.push('/login');
          return;
        }

        // Fetch all data in parallel
        const [profileRes, statsRes, studentsRes] = await Promise.all([
          fetch('http://localhost:8000/api/users/profile', {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }),
          fetch('http://localhost:8000/api/users/dashboard-stats', {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }),
          fetch('http://localhost:8000/api/admin/students', {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          })
        ]);

        // Check for authentication errors
        if (profileRes.status === 401 || statsRes.status === 401 || studentsRes.status === 401) {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
          router.push('/login');
          return;
        }

        // Parse responses
        const profileData: AdminProfile = await profileRes.json();
        const statsData: DashboardStats = await statsRes.json();
        const studentsData: StudentsResponse = await studentsRes.json();

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

      } catch (err: any) {
        setError(err.message || 'Failed to load dashboard data');
        console.error('Dashboard fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [router]);

  const menuItems = [
    { id: 'overview', name: 'Dashboard Overview', icon: '📊' },
    { id: 'students', name: 'Student Management', icon: '🎓' },
    { id: 'lecturers', name: 'Lecturer Management', icon: '👨‍🏫' },
    { id: 'departments', name: 'Departments', icon: '🏢' },
    { id: 'courses', name: 'Course Management', icon: '📚' },
    { id: 'reports', name: 'Reports', icon: '📈' },
    { id: 'settings', name: 'Settings', icon: '⚙️' }
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
        setShowUserModal(true);
        break;
      case 'add-lecturer':
        setActiveSection('lecturers');
        break;
      case 'manage-courses':
        setActiveSection('courses');
        break;
      case 'view-reports':
        setActiveSection('reports');
        break;
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="h-16 w-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="h-8 w-8 text-red-400" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">Error Loading Dashboard</h3>
          <p className="text-slate-400 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Student Creation Modal */}
      {showUserModal && (
        <StudentCreationModal
          isOpen={showUserModal}
          onClose={() => setShowUserModal(false)}
          institutionName={adminData.institution}
          onSuccess={() => {
            // Refresh students list
            window.location.reload();
          }}
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
        <div className="p-6 border-b border-slate-700/50">
          <div className="flex items-center space-x-3">
            <div className="h-12 w-12 bg-gradient-to-br from-red-500 to-orange-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold">{adminData.avatar}</span>
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-white font-semibold truncate">{adminData.name}</h3>
              <p className="text-slate-400 text-sm truncate">{adminData.role}</p>
              <p className="text-slate-500 text-xs truncate">{adminData.institution}</p>
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
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
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
          <button 
            onClick={() => {
              localStorage.removeItem('accessToken');
              localStorage.removeItem('refreshToken');
              localStorage.removeItem('user');
              router.push('/login');
            }}
            className="w-full flex items-center space-x-3 px-4 py-3 text-slate-300 hover:bg-slate-700/50 hover:text-white rounded-lg transition-colors"
          >
            <span className="text-lg">🚪</span>
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:ml-64">
        {/* Header */}
        <header className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700/50 px-6 py-4">
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
              <h1 className="text-2xl font-bold text-white capitalize">{activeSection.replace('-', ' ')}</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              {dashboardStats && (
                <>
                  <div className="text-right">
                    <p className="text-white font-semibold">{dashboardStats.stats.users.students}</p>
                    <p className="text-slate-400 text-xs">Students</p>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-semibold">{dashboardStats.stats.users.lecturers}</p>
                    <p className="text-slate-400 text-xs">Lecturers</p>
                  </div>
                </>
              )}
              
              <div className="h-10 w-10 bg-gradient-to-br from-red-500 to-orange-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold">{adminData.avatar}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="p-6">
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
              <div className="bg-slate-800/50 backdrop-blur-sm p-6 rounded-2xl border border-slate-700/50">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-white">Student Management</h2>
                  <button 
                    onClick={() => setShowUserModal(true)}
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
                        
                        <div className="mt-3 pt-3 border-t border-slate-600">
                          <span className="text-slate-400 text-xs">Created: {new Date(student.createdAt).toLocaleDateString()}</span>
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

          {/* Other sections placeholder */}
          {!['overview', 'students'].includes(activeSection) && (
            <div className="bg-slate-800/50 backdrop-blur-sm p-8 rounded-2xl border border-slate-700/50 text-center">
              <div className="text-6xl mb-4">
                {menuItems.find(item => item.id === activeSection)?.icon}
              </div>
              <h2 className="text-2xl font-bold text-white mb-4 capitalize">
                {activeSection.replace('-', ' ')}
              </h2>
              <p className="text-slate-300">This section is coming soon!</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

// Student Creation Modal Component
function StudentCreationModal({ 
  isOpen, 
  onClose, 
  institutionName,
  onSuccess
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  institutionName: string;
  onSuccess: () => void;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    department: '',
    year: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setError('Authentication required. Please login again.');
        return;
      }

      const response = await fetch('http://localhost:8000/api/admin/students', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create student account');
      }

      setSuccess(true);
      setTimeout(() => {
        onClose();
        onSuccess();
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to create student. Please try again.');
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
            <h3 className="text-2xl font-bold text-white">Create New Student</h3>
            <p className="text-slate-400 text-sm mt-1">An activation email will be sent to the student</p>
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
            <h4 className="text-xl font-bold text-white mb-2">Student Created Successfully!</h4>
            <p className="text-slate-300">Activation email sent to {formData.email}</p>
          </div>
        ) : (
          <>
            {error && (
              <div className="mb-4 p-3 bg-red-900/30 border border-red-700 rounded-lg">
                <p className="text-red-400 text-sm">{error}</p>
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
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="john.doe@university.edu"
                />
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
                <select
                  name="department"
                  value={formData.department}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select department...</option>
                  <option value="Computer Science">Computer Science</option>
                  <option value="Mathematics">Mathematics</option>
                  <option value="Physics">Physics</option>
                  <option value="Chemistry">Chemistry</option>
                  <option value="Biology">Biology</option>
                  <option value="Engineering">Engineering</option>
                  <option value="Business Administration">Business Administration</option>
                  <option value="Psychology">Psychology</option>
                  <option value="English Literature">English Literature</option>
                  <option value="History">History</option>
                </select>
              </div>

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
                  disabled={isLoading}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-colors disabled:opacity-50"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Creating...
                    </div>
                  ) : (
                    'Create Student'
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