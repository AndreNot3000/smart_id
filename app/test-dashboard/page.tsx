"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import StudentQRDisplay from "@/components/qr/StudentQRDisplay";
import AttendanceHistory from "@/components/qr/AttendanceHistory";

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

interface Grade {
  id: string;
  course: string;
  assignment: string;
  grade: string;
  score: string;
  status: 'excellent' | 'good' | 'average' | 'poor';
}

export default function TestDashboard() {
  const router = useRouter();
  const [activeSection, setActiveSection] = useState('dashboard');
  const [studentData, setStudentData] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch student profile data
  useEffect(() => {
    const fetchStudentProfile = async () => {
      try {
        const token = sessionStorage.getItem('accessToken');
        
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

        if (response.status === 401) {
          sessionStorage.removeItem('accessToken');
          sessionStorage.removeItem('refreshToken');
          sessionStorage.removeItem('user');
          router.push('/login');
          return;
        }

        if (response.ok) {
          const profileData: StudentProfile = await response.json();
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

    fetchStudentProfile();
  }, [router]);

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

  const recentGrades: Grade[] = [
    {
      id: '1',
      course: 'Database Systems',
      assignment: 'Midterm Exam',
      grade: 'A',
      score: '92/100',
      status: 'excellent'
    },
    {
      id: '2',
      course: 'Web Development',
      assignment: 'Project Assignment',
      grade: 'A-',
      score: '88/100',
      status: 'good'
    },
    {
      id: '3',
      course: 'Algorithms',
      assignment: 'Quiz 3',
      grade: 'B+',
      score: '85/100',
      status: 'good'
    }
  ];

  const menuItems = [
    { id: 'dashboard', name: 'Dashboard', icon: '📊' },
    { id: 'qr-code', name: 'My QR Code', icon: '📱' },
    { id: 'attendance', name: 'My Attendance', icon: '📋' },
    { id: 'profile', name: 'My Profile', icon: '👤' },
    { id: 'courses', name: 'My Courses', icon: '📚' },
    { id: 'grades', name: 'Grades', icon: '📝' },
    { id: 'schedule', name: 'Schedule', icon: '🗓️' },
    { id: 'payments', name: 'Payments', icon: '💳' }
  ];

  // Calculate academic stats
  const academicStats = studentData ? {
    gpa: 3.85,
    creditsEarned: 84,
    attendance: 96,
    walletBalance: 15420
  } : {
    gpa: 0,
    creditsEarned: 0,
    attendance: 0,
    walletBalance: 0
  };

  const displayName = studentData 
    ? `${studentData.profile.firstName} ${studentData.profile.lastName}`
    : 'Student';

  const displayData = {
    name: displayName,
    studentId: studentData?.profile.studentId || 'Loading...',
    year: studentData?.profile.year || 'Loading...',
    university: studentData?.profile.universityName || 'Loading...',
    avatar: studentData?.profile.avatar || 'ST'
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 flex items-center justify-center">
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
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 flex">
      {/* Sidebar */}
      <div className="w-64 bg-slate-900/50 backdrop-blur-sm border-r border-slate-700/50 flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-slate-700/50">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm">ID</span>
            </div>
            <span className="text-xl font-bold text-white">Campus ID</span>
          </div>
        </div>

        {/* User Profile */}
        <div className="p-6 border-b border-slate-700/50">
          <div className="flex items-center space-x-3">
            <div className="h-12 w-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold">{displayData.avatar}</span>
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-white font-semibold truncate">{displayData.name}</h3>
              <p className="text-slate-400 text-sm truncate">{displayData.studentId}</p>
              <p className="text-slate-500 text-xs truncate">{displayData.year}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {menuItems.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => setActiveSection(item.id)}
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
        <div className="p-4 border-t border-slate-700/50">
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
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700/50 px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-white capitalize">
              {activeSection === 'dashboard' ? 'Overview' : activeSection.replace('-', ' ')}
            </h1>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-white font-semibold">{displayData.year}</p>
                <p className="text-slate-400 text-sm">Physics</p>
              </div>
              
              <div className="h-10 w-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold">{displayData.avatar}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-6 overflow-y-auto">
          {activeSection === 'dashboard' && (
            <div className="space-y-6">
              {/* Welcome Card */}
              <div className="bg-slate-800/50 backdrop-blur-sm p-6 rounded-2xl border border-slate-700/50">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-xl font-bold text-white mb-2">Welcome back, {displayData.name}! 👋</h2>
                    <p className="text-slate-300">Here's your academic overview for {displayData.university}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-slate-400 text-sm">Student ID</p>
                    <p className="text-white font-semibold">{displayData.studentId}</p>
                    <p className="text-slate-400 text-xs">{displayData.year}</p>
                  </div>
                </div>
              </div>

              {/* Academic Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-slate-800/50 backdrop-blur-sm p-6 rounded-2xl border border-slate-700/50">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-400 text-sm">Current GPA</p>
                      <p className="text-2xl font-bold text-white">{academicStats.gpa}</p>
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
                      <p className="text-2xl font-bold text-white">{academicStats.creditsEarned}</p>
                      <p className="text-blue-400 text-sm">of 120 total</p>
                    </div>
                    <div className="h-12 w-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                      <span className="text-white text-xl">📚</span>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-800/50 backdrop-blur-sm p-6 rounded-2xl border border-slate-700/50">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-400 text-sm">Attendance</p>
                      <p className="text-2xl font-bold text-white">{academicStats.attendance}%</p>
                      <p className="text-purple-400 text-sm">Excellent</p>
                    </div>
                    <div className="h-12 w-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                      <span className="text-white text-xl">📅</span>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-800/50 backdrop-blur-sm p-6 rounded-2xl border border-slate-700/50">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-400 text-sm">Wallet Balance</p>
                      <p className="text-2xl font-bold text-white">₦{academicStats.walletBalance.toLocaleString()}</p>
                      <p className="text-cyan-400 text-sm">Available</p>
                    </div>
                    <div className="h-12 w-12 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-lg flex items-center justify-center">
                      <span className="text-white text-xl">💳</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Today's Classes & Recent Grades */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {/* Today's Classes */}
                <div className="bg-slate-800/50 backdrop-blur-sm p-6 rounded-2xl border border-slate-700/50">
                  <h3 className="text-lg font-bold text-white mb-4">Today's Classes</h3>
                  <div className="space-y-3">
                    {todaysClasses.map((course) => (
                      <div key={course.id} className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
                            <span className="text-white font-bold text-sm">{course.code.split(' ')[0]}</span>
                          </div>
                          <div>
                            <p className="text-white font-medium">{course.name}</p>
                            <p className="text-slate-400 text-sm">{course.code} • {course.room}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-white font-semibold">{course.time}</p>
                          <p className="text-slate-400 text-sm">{course.credits} hours</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent Grades */}
                <div className="bg-slate-800/50 backdrop-blur-sm p-6 rounded-2xl border border-slate-700/50">
                  <h3 className="text-lg font-bold text-white mb-4">Recent Grades</h3>
                  <div className="space-y-3">
                    {recentGrades.map((grade) => (
                      <div key={grade.id} className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg">
                        <div>
                          <p className="text-white font-medium">{grade.course}</p>
                          <p className="text-slate-400 text-sm">{grade.assignment}</p>
                        </div>
                        <div className="text-right">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            grade.status === 'excellent' ? 'bg-green-900/30 text-green-400' :
                            grade.status === 'good' ? 'bg-blue-900/30 text-blue-400' :
                            'bg-yellow-900/30 text-yellow-400'
                          }`}>
                            {grade.grade}
                          </span>
                          <p className="text-slate-400 text-xs mt-1">{grade.score}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Other sections placeholder */}
          {activeSection !== 'dashboard' && activeSection !== 'qr-code' && activeSection !== 'attendance' && (
            <div className="bg-slate-800/50 backdrop-blur-sm p-8 rounded-2xl border border-slate-700/50 text-center">
              <div className="text-6xl mb-4">
                {menuItems.find(item => item.id === activeSection)?.icon}
              </div>
              <h2 className="text-2xl font-bold text-white mb-4 capitalize">
                {activeSection.replace('-', ' ')}
              </h2>
              <p className="text-slate-300">This section is coming soon! We're working hard to bring you amazing features.</p>
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
        </main>
      </div>
    </div>
  );
}