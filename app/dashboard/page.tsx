"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

// Student Profile API Response Type
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
    phone: string;
    address: string;
    universityName: string;
  };
}

export default function StudentDashboard() {
  const router = useRouter();
  const [activeSection, setActiveSection] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [studentData, setStudentData] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch student profile data
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = sessionStorage.getItem('accessToken');
        const userData = sessionStorage.getItem('user');
        
        console.log('Student Dashboard - Token:', token ? 'Present' : 'Missing');
        console.log('Student Dashboard - User Data:', userData);
        
        if (!token) {
          router.push('/login');
          return;
        }

        const response = await fetch('http://localhost:8000/api/users/profile', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          if (response.status === 401) {
            sessionStorage.removeItem('accessToken');
            sessionStorage.removeItem('refreshToken');
            sessionStorage.removeItem('user');
            router.push('/login');
            return;
          }
          throw new Error('Failed to fetch profile');
        }

        const data: StudentProfile = await response.json();
        setStudentData(data);
      } catch (err: any) {
        setError(err.message || 'Failed to load profile');
        console.error('Profile fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [router]);

  const menuItems = [
    { id: 'overview', name: 'Dashboard', icon: '📊' },
    { id: 'profile', name: 'My Profile', icon: '👤' },
    { id: 'courses', name: 'My Courses', icon: '📚' },
    { id: 'grades', name: 'Grades', icon: '📝' },
    { id: 'attendance', name: 'Attendance', icon: '📋' },
    { id: 'schedule', name: 'Schedule', icon: '📅' },
    { id: 'payments', name: 'Payments', icon: '💳' },
    { id: 'library', name: 'Library', icon: '📖' },
  ];

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

  if (!studentData) {
    return null;
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

        {/* Student Profile */}
        <div className="p-6 border-b border-slate-700/50">
          <div className="flex items-center space-x-3">
            <div className="h-12 w-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold">{studentData.profile.avatar}</span>
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-white font-semibold truncate">
                {studentData.profile.firstName} {studentData.profile.lastName}
              </h3>
              <p className="text-slate-400 text-sm truncate">{studentData.profile.studentId}</p>
              <p className="text-slate-500 text-xs truncate">{studentData.profile.department}</p>
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
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
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
              sessionStorage.removeItem('accessToken');
              sessionStorage.removeItem('refreshToken');
              sessionStorage.removeItem('user');
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
              <div className="text-right hidden sm:block">
                <p className="text-white font-semibold">{studentData.profile.year}</p>
                <p className="text-slate-400 text-xs">{studentData.profile.department}</p>
              </div>
              
              <div className="h-10 w-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold">{studentData.profile.avatar}</span>
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
                    <h2 className="text-xl font-bold text-white mb-2">
                      Welcome back, {studentData.profile.firstName}! 👋
                    </h2>
                    <p className="text-slate-300">
                      Here's your academic overview for {studentData.profile.universityName}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-slate-400 text-sm">Student ID</p>
                    <p className="text-white font-semibold">{studentData.profile.studentId}</p>
                    <p className="text-slate-400 text-xs">{studentData.profile.year}</p>
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-slate-800/50 backdrop-blur-sm p-6 rounded-2xl border border-slate-700/50">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-400 text-sm">Current GPA</p>
                      <p className="text-2xl font-bold text-white">3.85</p>
                      <p className="text-green-400 text-sm">Excellent</p>
                    </div>
                    <div className="h-12 w-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                      <span className="text-white text-xl">📊</span>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-800/50 backdrop-blur-sm p-6 rounded-2xl border border-slate-700/50">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-400 text-sm">Credits Earned</p>
                      <p className="text-2xl font-bold text-white">84</p>
                      <p className="text-blue-400 text-sm">of 120 total</p>
                    </div>
                    <div className="h-12 w-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                      <span className="text-white text-xl">🎓</span>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-800/50 backdrop-blur-sm p-6 rounded-2xl border border-slate-700/50">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-400 text-sm">Attendance</p>
                      <p className="text-2xl font-bold text-white">96%</p>
                      <p className="text-green-400 text-sm">Excellent</p>
                    </div>
                    <div className="h-12 w-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                      <span className="text-white text-xl">📋</span>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-800/50 backdrop-blur-sm p-6 rounded-2xl border border-slate-700/50">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-400 text-sm">Wallet Balance</p>
                      <p className="text-2xl font-bold text-white">₦15,420</p>
                      <p className="text-cyan-400 text-sm">Available</p>
                    </div>
                    <div className="h-12 w-12 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-lg flex items-center justify-center">
                      <span className="text-white text-xl">💳</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {/* Upcoming Classes */}
                <div className="bg-slate-800/50 backdrop-blur-sm p-6 rounded-2xl border border-slate-700/50">
                  <h3 className="text-lg font-bold text-white mb-4">Today's Classes</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="h-8 w-8 rounded-full bg-blue-900/30 flex items-center justify-center">
                          <span className="text-blue-400">📚</span>
                        </div>
                        <div>
                          <p className="text-white font-medium">Data Structures</p>
                          <p className="text-slate-400 text-sm">CS 201 • Room 301</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-white font-semibold">10:00 AM</p>
                        <p className="text-slate-400 text-xs">2 hours</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="h-8 w-8 rounded-full bg-green-900/30 flex items-center justify-center">
                          <span className="text-green-400">🧮</span>
                        </div>
                        <div>
                          <p className="text-white font-medium">Calculus II</p>
                          <p className="text-slate-400 text-sm">MATH 202 • Room 105</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-white font-semibold">2:00 PM</p>
                        <p className="text-slate-400 text-xs">1.5 hours</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="h-8 w-8 rounded-full bg-purple-900/30 flex items-center justify-center">
                          <span className="text-purple-400">⚗️</span>
                        </div>
                        <div>
                          <p className="text-white font-medium">Physics Lab</p>
                          <p className="text-slate-400 text-sm">PHY 201L • Lab 2</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-white font-semibold">4:00 PM</p>
                        <p className="text-slate-400 text-xs">3 hours</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recent Grades */}
                <div className="bg-slate-800/50 backdrop-blur-sm p-6 rounded-2xl border border-slate-700/50">
                  <h3 className="text-lg font-bold text-white mb-4">Recent Grades</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                      <div>
                        <p className="text-white font-medium">Database Systems</p>
                        <p className="text-slate-400 text-sm">Midterm Exam</p>
                      </div>
                      <div className="text-right">
                        <span className="text-green-400 font-semibold text-lg">A</span>
                        <p className="text-slate-400 text-xs">92/100</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                      <div>
                        <p className="text-white font-medium">Web Development</p>
                        <p className="text-slate-400 text-sm">Project Assignment</p>
                      </div>
                      <div className="text-right">
                        <span className="text-green-400 font-semibold text-lg">A-</span>
                        <p className="text-slate-400 text-xs">88/100</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                      <div>
                        <p className="text-white font-medium">Algorithms</p>
                        <p className="text-slate-400 text-sm">Quiz 3</p>
                      </div>
                      <div className="text-right">
                        <span className="text-blue-400 font-semibold text-lg">B+</span>
                        <p className="text-slate-400 text-xs">85/100</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'profile' && (
            <div className="space-y-6">
              <div className="bg-slate-800/50 backdrop-blur-sm p-6 rounded-2xl border border-slate-700/50">
                <h2 className="text-xl font-bold text-white mb-6">My Profile</h2>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Profile Picture */}
                  <div className="text-center">
                    <div className="h-32 w-32 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-white font-bold text-4xl">{studentData.profile.avatar}</span>
                    </div>
                    <h3 className="text-xl font-bold text-white">
                      {studentData.profile.firstName} {studentData.profile.lastName}
                    </h3>
                    <p className="text-slate-400">{studentData.profile.studentId}</p>
                  </div>

                  {/* Personal Information */}
                  <div className="lg:col-span-2 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">First Name</label>
                        <input
                          type="text"
                          value={studentData.profile.firstName}
                          disabled
                          className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Last Name</label>
                        <input
                          type="text"
                          value={studentData.profile.lastName}
                          disabled
                          className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
                      <input
                        type="email"
                        value={studentData.email}
                        disabled
                        className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Department</label>
                        <input
                          type="text"
                          value={studentData.profile.department}
                          disabled
                          className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Academic Year</label>
                        <input
                          type="text"
                          value={studentData.profile.year}
                          disabled
                          className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">University</label>
                      <input
                        type="text"
                        value={studentData.profile.universityName}
                        disabled
                        className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Phone</label>
                      <input
                        type="text"
                        value={studentData.profile.phone}
                        disabled
                        className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Address</label>
                      <textarea
                        value={studentData.profile.address}
                        disabled
                        rows={3}
                        className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Other sections placeholder */}
          {!['overview', 'profile'].includes(activeSection) && (
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