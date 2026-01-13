"use client";

import Link from "next/link";
import { useState } from "react";

export default function LecturerDashboard() {
  const [activeSection, setActiveSection] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);
  const [showQRCode, setShowQRCode] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scannedStudents, setScannedStudents] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);

  const lecturerData = {
    name: 'Dr. Sarah Johnson',
    id: 'FAC123456789',
    email: 'sarah.johnson@university.edu',
    university: 'Harvard University',
    department: 'Computer Science',
    title: 'Associate Professor',
    officeHours: 'Mon-Wed 2:00-4:00 PM',
    avatar: 'SJ',
    qrCode: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjgwIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iODAiIGZpbGw9IndoaXRlIi8+PHJlY3QgeD0iMCIgeT0iMCIgd2lkdGg9IjMiIGhlaWdodD0iNjAiIGZpbGw9ImJsYWNrIi8+PHJlY3QgeD0iOCIgeT0iMCIgd2lkdGg9IjIiIGhlaWdodD0iNjAiIGZpbGw9ImJsYWNrIi8+PHJlY3QgeD0iMTYiIHk9IjAiIHdpZHRoPSI0IiBoZWlnaHQ9IjYwIiBmaWxsPSJibGFjayIvPjx0ZXh0IHg9IjEwMCIgeT0iNzUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtZmFtaWx5PSJtb25vc3BhY2UiIGZvbnQtc2l6ZT0iOCIgZmlsbD0iYmxhY2siPkZBQzEyMzQ1Njc4OTwvdGV4dD48L3N2Zz4='
  };

  const menuItems = [
    { id: 'overview', name: 'Overview', icon: '📊' },
    { id: 'qr-scanner', name: 'QR Scanner', icon: '📱' },
    { id: 'attendance', name: 'Attendance Management', icon: '📋' },
    { id: 'courses', name: 'Weekly Courses', icon: '📚' },
    { id: 'grades', name: 'Grades & Assessment', icon: '📝' },
    { id: 'students', name: 'Student Records', icon: '👥' },
    { id: 'schedule', name: 'Class Schedule', icon: '📅' },
    { id: 'announcements', name: 'Announcements', icon: '📢' },
    { id: 'office-hours', name: 'Office Hours', icon: '🕐' },
    { id: 'reports', name: 'Reports & Analytics', icon: '📈' },
    { id: 'qr-code', name: 'My QR Code', icon: '🆔' },
    { id: 'settings', name: 'Settings', icon: '⚙️' }
  ];

  const classes = [
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

  const recentActivities = [
    { id: 1, type: 'Grade Posted', description: 'CS201 - Assignment 3 grades posted', time: '2 hours ago', icon: '📝' },
    { id: 2, type: 'Attendance Taken', description: 'CS401 - Machine Learning class attendance', time: '1 day ago', icon: '📋' },
    { id: 3, type: 'Announcement', description: 'CS301 - Midterm exam schedule updated', time: '2 days ago', icon: '📢' },
    { id: 4, type: 'Resource Added', description: 'CS201 - New lecture slides uploaded', time: '3 days ago', icon: '📁' }
  ];

  const upcomingTasks = [
    { id: 1, task: 'Grade CS401 Midterm Exams', deadline: 'Due Tomorrow', priority: 'high' },
    { id: 2, task: 'Prepare CS201 Lecture Notes', deadline: 'Due in 2 days', priority: 'medium' },
    { id: 3, task: 'Review CS301 Project Proposals', deadline: 'Due in 3 days', priority: 'medium' },
    { id: 4, task: 'Submit Grade Reports', deadline: 'Due in 1 week', priority: 'low' }
  ];

  const quickActions = [
    { id: 'start-scanner', name: 'Start QR Scanner', icon: '📱', color: 'from-blue-600 to-indigo-600' },
    { id: 'take-attendance', name: 'Take Attendance', icon: '✅', color: 'from-green-600 to-emerald-600' },
    { id: 'view-schedule', name: 'Today\'s Classes', icon: '📅', color: 'from-purple-600 to-pink-600' },
    { id: 'post-grades', name: 'Post Grades', icon: '📊', color: 'from-orange-600 to-red-600' },
    { id: 'send-announcement', name: 'Send Announcement', icon: '📢', color: 'from-cyan-600 to-blue-600' },
    { id: 'view-reports', name: 'View Reports', icon: '📈', color: 'from-yellow-600 to-orange-600' }
  ];

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

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

        {/* User Profile */}
        <div className="p-4 sm:p-6 border-b border-slate-700/50">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 sm:h-12 sm:w-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-sm sm:text-base">{lecturerData.avatar}</span>
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-white font-semibold text-sm sm:text-base truncate">{lecturerData.name}</h3>
              <p className="text-slate-400 text-xs sm:text-sm truncate">{lecturerData.title}</p>
              <p className="text-slate-500 text-xs truncate">{lecturerData.department}</p>
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
              <button
                onClick={() => setShowQRCode(true)}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-2 sm:px-4 py-2 rounded-lg transition-colors flex items-center space-x-1 sm:space-x-2"
              >
                <span className="text-sm">📱</span>
                <span className="hidden sm:inline text-sm">Show ID</span>
              </button>
              
              <div className="text-right">
                <p className="text-white font-semibold text-sm sm:text-base">{lecturerData.title}</p>
                <p className="text-slate-400 text-xs sm:text-sm hidden sm:block">{lecturerData.department}</p>
              </div>
              
              <div className="h-8 w-8 sm:h-10 sm:w-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm sm:text-base">{lecturerData.avatar}</span>
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
                      <p className="text-slate-400 text-xs sm:text-sm">Total Classes</p>
                      <p className="text-xl sm:text-2xl font-bold text-white">{classes.length}</p>
                      <p className="text-blue-400 text-xs sm:text-sm">This semester</p>
                    </div>
                    <div className="h-10 w-10 sm:h-12 sm:w-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-lg sm:text-xl">📚</span>
                    </div>
                  </div>
                </div>

                <div className="card-hover bg-slate-800/50 backdrop-blur-sm p-4 sm:p-6 rounded-2xl border border-slate-700/50">
                  <div className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="text-slate-400 text-xs sm:text-sm">Total Students</p>
                      <p className="text-xl sm:text-2xl font-bold text-white">{classes.reduce((sum, cls) => sum + cls.students, 0)}</p>
                      <p className="text-green-400 text-xs sm:text-sm">Across all classes</p>
                    </div>
                    <div className="h-10 w-10 sm:h-12 sm:w-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-lg sm:text-xl">👥</span>
                    </div>
                  </div>
                </div>

                <div className="card-hover bg-slate-800/50 backdrop-blur-sm p-4 sm:p-6 rounded-2xl border border-slate-700/50">
                  <div className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="text-slate-400 text-xs sm:text-sm">Avg Attendance</p>
                      <p className="text-xl sm:text-2xl font-bold text-white">{Math.round(classes.reduce((sum, cls) => sum + cls.attendance, 0) / classes.length)}%</p>
                      <p className="text-yellow-400 text-xs sm:text-sm">This month</p>
                    </div>
                    <div className="h-10 w-10 sm:h-12 sm:w-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-lg sm:text-xl">📋</span>
                    </div>
                  </div>
                </div>

                <div className="card-hover bg-slate-800/50 backdrop-blur-sm p-4 sm:p-6 rounded-2xl border border-slate-700/50">
                  <div className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="text-slate-400 text-xs sm:text-sm">Pending Tasks</p>
                      <p className="text-xl sm:text-2xl font-bold text-white">{upcomingTasks.length}</p>
                      <p className="text-purple-400 text-xs sm:text-sm">To complete</p>
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
                    {recentActivities.map((activity) => (
                      <div key={activity.id} className="flex items-center space-x-3 p-3 bg-slate-700/30 rounded-lg hover:bg-slate-700/50 transition-colors">
                        <div className="h-8 w-8 rounded-full bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                          <span className="text-blue-400">{activity.icon}</span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-white font-medium text-sm sm:text-base truncate">{activity.type}</p>
                          <p className="text-slate-400 text-xs sm:text-sm truncate">{activity.description}</p>
                        </div>
                        <span className="text-slate-500 text-xs flex-shrink-0">{activity.time}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Upcoming Tasks */}
                <div className="card-hover bg-slate-800/50 backdrop-blur-sm p-4 sm:p-6 rounded-2xl border border-slate-700/50">
                  <h3 className="text-base sm:text-lg font-bold text-white mb-4">Upcoming Tasks</h3>
                  <div className="space-y-3">
                    {upcomingTasks.map((task) => (
                      <div key={task.id} className="p-3 bg-slate-700/30 rounded-lg hover:bg-slate-700/50 transition-colors">
                        <div className="flex justify-between items-start">
                          <div className="min-w-0 flex-1">
                            <p className="text-white font-medium text-sm sm:text-base truncate">{task.task}</p>
                            <p className="text-slate-400 text-xs sm:text-sm">{task.deadline}</p>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium flex-shrink-0 ml-2 ${
                            task.priority === 'high' ? 'bg-red-900/30 text-red-400' :
                            task.priority === 'medium' ? 'bg-yellow-900/30 text-yellow-400' :
                            'bg-green-900/30 text-green-400'
                          }`}>
                            {task.priority}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'qr-scanner' && (
            <div className="space-y-6">
              <div className="card-hover bg-slate-800/50 backdrop-blur-sm p-6 rounded-2xl border border-slate-700/50">
                <h2 className="text-xl font-bold text-white mb-6">QR Code Scanner</h2>
                
                {!isScanning ? (
                  <div className="text-center">
                    <div className="h-32 w-32 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                      <svg className="h-16 w-16 text-white" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 013.75 9.375v-4.5zM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 01-1.125-1.125v-4.5zM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0113.5 9.375v-4.5z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 6.75h.75v.75h-.75v-.75zM6.75 16.5h.75v.75h-.75v-.75zM16.5 6.75h.75v.75h-.75v-.75zM13.5 13.5H8.25v1.5H13.5V13.5zM13.5 16.5H8.25V18H13.5v-1.5zM16.5 13.5h1.5V18h-1.5v-4.5z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">Scan Student QR Codes</h3>
                    <p className="text-slate-300 mb-6">Use your camera to scan student QR codes for attendance tracking</p>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                      <div className="bg-slate-700/30 rounded-lg p-4">
                        <h4 className="text-white font-medium mb-2">Select Course</h4>
                        <select className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white text-sm">
                          <option value="">Choose a course...</option>
                          {classes.map(course => (
                            <option key={course.id} value={course.code}>{course.code} - {course.name}</option>
                          ))}
                        </select>
                      </div>
                      <div className="bg-slate-700/30 rounded-lg p-4">
                        <h4 className="text-white font-medium mb-2">Session Type</h4>
                        <select className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white text-sm">
                          <option value="lecture">Lecture</option>
                          <option value="lab">Lab Session</option>
                          <option value="tutorial">Tutorial</option>
                          <option value="exam">Exam</option>
                        </select>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => setIsScanning(true)}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
                    >
                      Start Scanning
                    </button>
                  </div>
                ) : (
                  <div>
                    <div className="bg-slate-900 rounded-lg p-6 mb-6">
                      <div className="aspect-video bg-gradient-to-br from-slate-700 to-slate-800 rounded-lg flex items-center justify-center mb-4">
                        <div className="text-center">
                          <div className="animate-pulse">
                            <div className="h-32 w-32 border-4 border-blue-500 border-dashed rounded-lg mx-auto mb-4 flex items-center justify-center">
                              <svg className="h-16 w-16 text-blue-400" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 013.75 9.375v-4.5zM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 01-1.125-1.125v-4.5zM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0113.5 9.375v-4.5z" />
                              </svg>
                            </div>
                          </div>
                          <p className="text-white font-medium">Camera Active - Point at QR Code</p>
                          <p className="text-slate-400 text-sm">Position student QR codes within the frame</p>
                        </div>
                      </div>
                      
                      <div className="flex justify-center space-x-4">
                        <button
                          onClick={() => {
                            // Simulate scanning a student
                            const newStudent = {
                              id: Date.now(),
                              name: `Student ${scannedStudents.length + 1}`,
                              studentId: `STU${Math.random().toString().substr(2, 6)}`,
                              time: new Date().toLocaleTimeString()
                            };
                            setScannedStudents([...scannedStudents, newStudent]);
                          }}
                          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
                        >
                          Simulate Scan
                        </button>
                        <button
                          onClick={() => setIsScanning(false)}
                          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
                        >
                          Stop Scanning
                        </button>
                      </div>
                    </div>
                    
                    {scannedStudents.length > 0 && (
                      <div className="bg-slate-700/30 rounded-lg p-4">
                        <h4 className="text-white font-medium mb-3">Scanned Students ({scannedStudents.length})</h4>
                        <div className="space-y-2 max-h-40 overflow-y-auto">
                          {scannedStudents.map(student => (
                            <div key={student.id} className="flex justify-between items-center bg-slate-600/50 rounded p-2">
                              <div>
                                <span className="text-white font-medium">{student.name}</span>
                                <span className="text-slate-400 text-sm ml-2">({student.studentId})</span>
                              </div>
                              <span className="text-green-400 text-sm">{student.time}</span>
                            </div>
                          ))}
                        </div>
                        <button
                          onClick={() => {
                            setScannedStudents([]);
                            setIsScanning(false);
                          }}
                          className="mt-4 w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-2 rounded-lg hover:from-green-700 hover:to-emerald-700 transition-colors"
                        >
                          Save Attendance ({scannedStudents.length} students)
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeSection === 'attendance' && (
            <div className="space-y-6">
              <div className="card-hover bg-slate-800/50 backdrop-blur-sm p-6 rounded-2xl border border-slate-700/50">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-white">Attendance Management</h2>
                  <button
                    onClick={() => setActiveSection('qr-scanner')}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-colors"
                  >
                    Take New Attendance
                  </button>
                </div>
                
                {/* Attendance Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                  <div className="bg-slate-700/30 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-green-400">93.1%</div>
                    <div className="text-slate-400 text-sm">Average Attendance</div>
                  </div>
                  <div className="bg-slate-700/30 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-blue-400">{attendanceRecords.length}</div>
                    <div className="text-slate-400 text-sm">Sessions Recorded</div>
                  </div>
                  <div className="bg-slate-700/30 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-purple-400">115</div>
                    <div className="text-slate-400 text-sm">Total Students</div>
                  </div>
                </div>
                
                {/* Recent Attendance Records */}
                <div>
                  <h3 className="text-lg font-bold text-white mb-4">Recent Attendance Records</h3>
                  <div className="space-y-3">
                    {attendanceRecords.map(record => (
                      <div key={record.id} className="bg-slate-700/30 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="text-white font-medium">{record.courseName}</h4>
                            <p className="text-slate-400 text-sm">{record.courseCode} • {new Date(record.date).toLocaleDateString()}</p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            record.percentage >= 90 ? 'bg-green-900/30 text-green-400' :
                            record.percentage >= 80 ? 'bg-yellow-900/30 text-yellow-400' :
                            'bg-red-900/30 text-red-400'
                          }`}>
                            {record.percentage.toFixed(1)}%
                          </span>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="text-slate-400">Present: </span>
                            <span className="text-green-400 font-medium">{record.present}</span>
                          </div>
                          <div>
                            <span className="text-slate-400">Absent: </span>
                            <span className="text-red-400 font-medium">{record.absent}</span>
                          </div>
                          <div>
                            <span className="text-slate-400">Total: </span>
                            <span className="text-white font-medium">{record.totalStudents}</span>
                          </div>
                        </div>
                        <div className="mt-3 flex space-x-2">
                          <button className="text-blue-400 hover:text-blue-300 text-sm">View Details</button>
                          <button className="text-green-400 hover:text-green-300 text-sm">Export</button>
                          <button className="text-purple-400 hover:text-purple-300 text-sm">Send Report</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'courses' && (
            <div className="space-y-6">
              <div className="card-hover bg-slate-800/50 backdrop-blur-sm p-6 rounded-2xl border border-slate-700/50">
                <h2 className="text-xl font-bold text-white mb-6">Weekly Course Schedule</h2>
                
                {/* Today's Classes */}
                <div className="mb-8">
                  <h3 className="text-lg font-bold text-white mb-4">Today's Classes</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {todaysClasses.map(classItem => (
                      <div key={classItem.id} className="bg-slate-700/30 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="text-white font-medium">{classItem.course}</h4>
                            <p className="text-slate-400 text-sm">{classItem.time} • {classItem.room}</p>
                          </div>
                          <span className="px-2 py-1 bg-blue-900/30 text-blue-400 rounded text-xs">
                            {classItem.students} students
                          </span>
                        </div>
                        <div className="flex space-x-2 mt-3">
                          <button 
                            onClick={() => setActiveSection('qr-scanner')}
                            className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-3 rounded text-sm transition-colors"
                          >
                            Take Attendance
                          </button>
                          <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded text-sm transition-colors">
                            View Details
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Weekly Schedule */}
                <div>
                  <h3 className="text-lg font-bold text-white mb-4">Complete Weekly Schedule</h3>
                  <div className="space-y-4">
                    {classes.map(course => (
                      <div key={course.id} className="bg-slate-700/30 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h4 className="text-white font-semibold">{course.name}</h4>
                            <p className="text-slate-400 text-sm">{course.code} • {course.room}</p>
                          </div>
                          <button
                            onClick={() => setSelectedCourse(course)}
                            className="text-blue-400 hover:text-blue-300 text-sm"
                          >
                            View Details →
                          </button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                          {course.weeklySchedule.map((session, index) => (
                            <div key={index} className="bg-slate-600/50 rounded p-3">
                              <div className="font-medium text-white text-sm">{session.day}</div>
                              <div className="text-slate-300 text-xs">{session.time}</div>
                              <div className="text-slate-400 text-xs mt-1">{session.topic}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
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

          {/* Other sections placeholder */}
          {!['overview', 'qr-scanner', 'attendance', 'courses', 'qr-code'].includes(activeSection) && (
            <div className="card-hover bg-slate-800/50 backdrop-blur-sm p-8 rounded-2xl border border-slate-700/50 text-center">
              <div className="text-6xl mb-4">
                {menuItems.find(item => item.id === activeSection)?.icon}
              </div>
              <h2 className="text-2xl font-bold text-white mb-4 capitalize">
                {activeSection.replace('-', ' ')}
              </h2>
              <p className="text-slate-300">This section is coming soon! We're working hard to bring you amazing features for faculty management.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}