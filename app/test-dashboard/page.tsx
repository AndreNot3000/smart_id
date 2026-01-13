"use client";

import Link from "next/link";
import { useState } from "react";

// Define the Event type
type Event = {
  id: number;
  title: string;
  date: string;
  time: string;
  location: string;
  description: string;
  speakers: string[];
  category: string;
  registrationRequired: boolean;
  capacity: number;
  registered: number;
};

export default function TestDashboard() {
  const [activeSection, setActiveSection] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [showBarcode, setShowBarcode] = useState(false);
  const [darkMode, setDarkMode] = useState(true);

  const studentData = {
    name: 'Raymond Reddington',
    id: 'STU123456789',
    email: 'john.doe@university.edu',
    university: 'Harvard University',
    course: 'Computer Science',
    year: 'Junior',
    semester: '2nd Semester',
    walletBalance: 24550.00,
    cgpa: 3.75,
    avatar: 'JD',
    barcode: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjgwIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iODAiIGZpbGw9IndoaXRlIi8+PHJlY3QgeD0iMCIgeT0iMCIgd2lkdGg9IjMiIGhlaWdodD0iNjAiIGZpbGw9ImJsYWNrIi8+PHJlY3QgeD0iOCIgeT0iMCIgd2lkdGg9IjIiIGhlaWdodD0iNjAiIGZpbGw9ImJsYWNrIi8+PHJlY3QgeD0iMTYiIHk9IjAiIHdpZHRoPSI0IiBoZWlnaHQ9IjYwIiBmaWxsPSJibGFjayIvPjx0ZXh0IHg9IjEwMCIgeT0iNzUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtZmFtaWx5PSJtb25vc3BhY2UiIGZvbnQtc2l6ZT0iOCIgZmlsbD0iYmxhY2siPlNUVTEyMzQ1Njc4OTwvdGV4dD48L3N2Zz4='
  };

  const menuItems = [
    { id: 'overview', name: 'Overview', icon: '📊' },
    { id: 'wallet', name: 'Wallet', icon: '💳' },
    { id: 'profile', name: 'Profile', icon: '👤' },
    { id: 'history', name: 'Account History', icon: '📋' },
    { id: 'attendance', name: 'Attendance', icon: '📅' },
    { id: 'cgpa', name: 'CGPA Calculator', icon: '🧮' },
    { id: 'lecturers', name: 'Lecturers', icon: '👨‍🏫' },
    { id: 'events', name: 'Events', icon: '🎉' },
    { id: 'rewards', name: 'Rewards', icon: '🏆' },
    { id: 'map', name: 'Campus Map', icon: '🗺️' },
    { id: 'information', name: 'Information', icon: 'ℹ️' },
    { id: 'qr-code', name: 'My QR Code', icon: '📱' },
    { id: 'settings', name: 'Settings', icon: '⚙️' },
    { id: 'help', name: 'Help & FAQ', icon: '❓' }
  ];

  const recentTransactions = [
    { id: 1, type: 'Meal Purchase', amount: -1250.00, location: 'Student Cafeteria', time: '2 hours ago', status: 'completed' },
    { id: 2, type: 'Library Fine', amount: -500.00, location: 'Main Library', time: '1 day ago', status: 'completed' },
    { id: 3, type: 'Wallet Top-up', amount: +5000.00, location: 'Online', time: '3 days ago', status: 'completed' },
    { id: 4, type: 'Parking Fee', amount: -800.00, location: 'Lot B', time: '5 days ago', status: 'pending' }
  ];

  const upcomingEvents = [
    { 
      id: 1, 
      title: 'Tech Conference 2024', 
      date: 'Jan 15, 2024', 
      time: '9:00 AM - 5:00 PM',
      location: 'Main Auditorium',
      description: 'Join us for the biggest tech conference of the year featuring industry leaders, workshops, and networking opportunities.',
      speakers: ['Dr. Sarah Johnson', 'Mark Chen', 'Prof. David Wilson'],
      category: 'Technology',
      registrationRequired: true,
      capacity: 500,
      registered: 342
    },
    { 
      id: 2, 
      title: 'Career Fair', 
      date: 'Jan 20, 2024', 
      time: '10:00 AM - 4:00 PM',
      location: 'Student Center',
      description: 'Meet with top employers and explore internship and job opportunities across various industries.',
      speakers: ['HR Representatives from 50+ companies'],
      category: 'Career',
      registrationRequired: false,
      capacity: 1000,
      registered: 756
    },
    { 
      id: 3, 
      title: 'Sports Day', 
      date: 'Jan 25, 2024', 
      time: '8:00 AM - 6:00 PM',
      location: 'Sports Complex',
      description: 'Annual sports competition featuring various games, competitions, and fun activities for all students.',
      speakers: ['Coach Mike Thompson', 'Athletic Director'],
      category: 'Sports',
      registrationRequired: true,
      capacity: 800,
      registered: 234
    }
  ];

  const attendanceData = [
    { subject: 'Data Structures', attended: 28, total: 30, percentage: 93.3 },
    { subject: 'Web Development', attended: 25, total: 28, percentage: 89.3 },
    { subject: 'Database Systems', attended: 22, total: 26, percentage: 84.6 },
    { subject: 'Software Engineering', attended: 24, total: 27, percentage: 88.9 }
  ];

  const quickActions = [
    { id: 'show-id', name: 'Show Digital ID', icon: '📱', color: 'from-blue-600 to-purple-600' },
    { id: 'add-funds', name: 'Add Funds', icon: '💰', color: 'from-green-600 to-emerald-600' },
    { id: 'book-room', name: 'Book Study Room', icon: '📚', color: 'from-orange-600 to-red-600' },
    { id: 'report-issue', name: 'Report Issue', icon: '🚨', color: 'from-purple-600 to-pink-600' },
    { id: 'meal-plan', name: 'Meal Plan', icon: '🍽️', color: 'from-yellow-600 to-orange-600' },
    { id: 'transport', name: 'Campus Shuttle', icon: '🚌', color: 'from-indigo-600 to-blue-600' }
  ];

  const handleQuickAction = (actionId: string) => {
    if (actionId === 'show-id') {
      setShowBarcode(true);
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

      {/* Barcode Modal */}
      {showBarcode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-slate-800 rounded-2xl p-8 max-w-md w-full border border-slate-700">
            <div className="text-center">
              <h3 className="text-xl font-bold text-white mb-4">Digital Student ID</h3>
              <div className="bg-white rounded-lg p-4 mb-4">
                <img src={studentData.barcode} alt="Student Barcode" className="w-full h-auto" />
              </div>
              <div className="space-y-2 text-left">
                <div className="flex justify-between">
                  <span className="text-slate-400">Name:</span>
                  <span className="text-white">{studentData.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">ID:</span>
                  <span className="text-white font-mono">{studentData.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Course:</span>
                  <span className="text-white">{studentData.course}</span>
                </div>
              </div>
              <button
                onClick={() => setShowBarcode(false)}
                className="mt-6 w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Event Details Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-slate-800 rounded-2xl p-8 max-w-2xl w-full border border-slate-700 max-h-96 overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-2xl font-bold text-white">{selectedEvent.title}</h3>
              <button
                onClick={() => setSelectedEvent(null)}
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
                  <p className="text-slate-400 text-sm">Date & Time</p>
                  <p className="text-white">{selectedEvent.date}</p>
                  <p className="text-slate-300">{selectedEvent.time}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-sm">Location</p>
                  <p className="text-white">{selectedEvent.location}</p>
                </div>
              </div>
              
              <div>
                <p className="text-slate-400 text-sm mb-2">Description</p>
                <p className="text-slate-300">{selectedEvent.description}</p>
              </div>
              
              <div>
                <p className="text-slate-400 text-sm mb-2">Speakers</p>
                <div className="flex flex-wrap gap-2">
                  {selectedEvent.speakers.map((speaker: string, index: number) => (
                    <span key={index} className="bg-slate-700 text-slate-300 px-3 py-1 rounded-full text-sm">
                      {speaker}
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-slate-400 text-sm">Category</p>
                  <span className="inline-block bg-blue-900/30 text-blue-400 px-3 py-1 rounded-full text-sm">
                    {selectedEvent.category}
                  </span>
                </div>
                <div>
                  <p className="text-slate-400 text-sm">Registration</p>
                  <p className="text-white">{selectedEvent.registrationRequired ? 'Required' : 'Not Required'}</p>
                </div>
              </div>
              
              <div className="bg-slate-700/30 rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-slate-400">Registration Progress</span>
                  <span className="text-white">{selectedEvent.registered}/{selectedEvent.capacity}</span>
                </div>
                <div className="w-full bg-slate-600 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
                    style={{ width: `${(selectedEvent.registered / selectedEvent.capacity) * 100}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="flex gap-3">
                <button className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white py-2 rounded-lg hover:from-green-700 hover:to-emerald-700 transition-colors">
                  Register Now
                </button>
                <button className="flex-1 border border-slate-600 text-slate-300 py-2 rounded-lg hover:bg-slate-700/50 transition-colors">
                  Add to Calendar
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
              <span className="text-white font-bold text-sm sm:text-base">{studentData.avatar}</span>
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-white font-semibold text-sm sm:text-base truncate">{studentData.name}</h3>
              <p className="text-slate-400 text-xs sm:text-sm truncate">{studentData.course}</p>
              <p className="text-slate-500 text-xs truncate">{studentData.semester}</p>
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
            
            {/* Mobile Layout */}
            <div className="flex items-center space-x-2 sm:space-x-4">
              {/* Show ID Button */}
              <button
                onClick={() => setShowBarcode(true)}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-2 sm:px-4 py-2 rounded-lg transition-colors flex items-center space-x-1 sm:space-x-2"
              >
                <span className="text-sm">📱</span>
                <span className="hidden sm:inline text-sm">Show ID</span>
              </button>
              
              {/* Stats - Hidden on very small screens, compact on small screens */}
              <div className="hidden xs:flex items-center space-x-2 sm:space-x-4">
                <div className="text-right">
                  <p className="text-white font-semibold text-sm sm:text-base">₦{studentData.walletBalance.toLocaleString()}</p>
                  <p className="text-slate-400 text-xs sm:text-sm hidden sm:block">Balance</p>
                </div>
                <div className="text-right">
                  <p className="text-white font-semibold text-sm sm:text-base">{studentData.cgpa}</p>
                  <p className="text-slate-400 text-xs sm:text-sm hidden sm:block">CGPA</p>
                </div>
              </div>
              
              {/* Avatar */}
              <div className="h-8 w-8 sm:h-10 sm:w-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm sm:text-base">{studentData.avatar}</span>
              </div>
            </div>
          </div>
          
          {/* Mobile Stats Row - Shows on very small screens */}
          <div className="flex xs:hidden justify-center space-x-6 mt-3 pt-3 border-t border-slate-700/50">
            <div className="text-center">
              <p className="text-white font-semibold text-sm">₦{studentData.walletBalance.toLocaleString()}</p>
              <p className="text-slate-400 text-xs">Balance</p>
            </div>
            <div className="text-center">
              <p className="text-white font-semibold text-sm">{studentData.cgpa}</p>
              <p className="text-slate-400 text-xs">CGPA</p>
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
                    <h2 className="text-xl font-bold text-white mb-2">Welcome back, {studentData.name}! 👋</h2>
                    <p className="text-slate-300">Here's your campus overview for today.</p>
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
                      <p className="text-slate-400 text-xs sm:text-sm">Wallet Balance</p>
                      <p className="text-xl sm:text-2xl font-bold text-white truncate">₦{studentData.walletBalance.toLocaleString()}</p>
                      <p className="text-green-400 text-xs sm:text-sm">+₦5,000 this week</p>
                    </div>
                    <div className="h-10 w-10 sm:h-12 sm:w-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-lg sm:text-xl">💳</span>
                    </div>
                  </div>
                </div>

                <div className="card-hover bg-slate-800/50 backdrop-blur-sm p-4 sm:p-6 rounded-2xl border border-slate-700/50">
                  <div className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="text-slate-400 text-xs sm:text-sm">Current CGPA</p>
                      <p className="text-xl sm:text-2xl font-bold text-white">{studentData.cgpa}</p>
                      <p className="text-blue-400 text-xs sm:text-sm">Target: 4.0</p>
                    </div>
                    <div className="h-10 w-10 sm:h-12 sm:w-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-lg sm:text-xl">📚</span>
                    </div>
                  </div>
                </div>

                <div className="card-hover bg-slate-800/50 backdrop-blur-sm p-4 sm:p-6 rounded-2xl border border-slate-700/50">
                  <div className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="text-slate-400 text-xs sm:text-sm">Attendance</p>
                      <p className="text-xl sm:text-2xl font-bold text-white">89%</p>
                      <p className="text-yellow-400 text-xs sm:text-sm">Above average</p>
                    </div>
                    <div className="h-10 w-10 sm:h-12 sm:w-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-lg sm:text-xl">📅</span>
                    </div>
                  </div>
                </div>

                <div className="card-hover bg-slate-800/50 backdrop-blur-sm p-4 sm:p-6 rounded-2xl border border-slate-700/50">
                  <div className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="text-slate-400 text-xs sm:text-sm">Rewards Points</p>
                      <p className="text-xl sm:text-2xl font-bold text-white">1,250</p>
                      <p className="text-purple-400 text-xs sm:text-sm">+50 today</p>
                    </div>
                    <div className="h-10 w-10 sm:h-12 sm:w-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-lg sm:text-xl">🏆</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Activity & Upcoming Events */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
                {/* Recent Transactions */}
                <div className="card-hover bg-slate-800/50 backdrop-blur-sm p-4 sm:p-6 rounded-2xl border border-slate-700/50">
                  <h3 className="text-base sm:text-lg font-bold text-white mb-4">Recent Transactions</h3>
                  <div className="space-y-3">
                    {recentTransactions.map((transaction) => (
                      <div key={transaction.id} className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg hover:bg-slate-700/50 transition-colors">
                        <div className="flex items-center space-x-3 min-w-0 flex-1">
                          <div className={`h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                            transaction.status === 'completed' ? 'bg-green-900/30' : 'bg-yellow-900/30'
                          }`}>
                            <span className={transaction.status === 'completed' ? 'text-green-400' : 'text-yellow-400'}>
                              {transaction.status === 'completed' ? '✓' : '⏳'}
                            </span>
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-white font-medium text-sm sm:text-base truncate">{transaction.type}</p>
                            <p className="text-slate-400 text-xs sm:text-sm truncate">{transaction.location} • {transaction.time}</p>
                          </div>
                        </div>
                        <div className={`font-bold text-sm sm:text-base flex-shrink-0 ${transaction.amount > 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {transaction.amount > 0 ? '+' : ''}₦{Math.abs(transaction.amount).toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Upcoming Events */}
                <div className="card-hover bg-slate-800/50 backdrop-blur-sm p-4 sm:p-6 rounded-2xl border border-slate-700/50">
                  <h3 className="text-base sm:text-lg font-bold text-white mb-4">Upcoming Events</h3>
                  <div className="space-y-3">
                    {upcomingEvents.map((event) => (
                      <div 
                        key={event.id} 
                        className="p-3 bg-slate-700/30 rounded-lg hover:bg-slate-700/50 transition-colors cursor-pointer touch-manipulation"
                        onClick={() => setSelectedEvent(event)}
                      >
                        <div className="flex justify-between items-start">
                          <div className="min-w-0 flex-1">
                            <p className="text-white font-medium text-sm sm:text-base truncate">{event.title}</p>
                            <p className="text-slate-400 text-xs sm:text-sm truncate">{event.date} • {event.location}</p>
                          </div>
                          <span className="text-blue-400 text-xs sm:text-sm flex-shrink-0 ml-2">View Details →</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'events' && (
            <div className="space-y-6">
              <div className="card-hover bg-slate-800/50 backdrop-blur-sm p-6 rounded-2xl border border-slate-700/50">
                <h2 className="text-xl font-bold text-white mb-6">Campus Events</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                  {upcomingEvents.map((event) => (
                    <div 
                      key={event.id}
                      className="bg-slate-700/30 rounded-lg p-4 hover:bg-slate-700/50 transition-colors cursor-pointer"
                      onClick={() => setSelectedEvent(event)}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          event.category === 'Technology' ? 'bg-blue-900/30 text-blue-400' :
                          event.category === 'Career' ? 'bg-green-900/30 text-green-400' :
                          'bg-orange-900/30 text-orange-400'
                        }`}>
                          {event.category}
                        </span>
                        <span className="text-slate-400 text-sm">Click for details</span>
                      </div>
                      <h3 className="text-white font-semibold mb-2">{event.title}</h3>
                      <p className="text-slate-300 text-sm mb-3">{event.description.substring(0, 100)}...</p>
                      <div className="space-y-1">
                        <p className="text-slate-400 text-sm">📅 {event.date}</p>
                        <p className="text-slate-400 text-sm">📍 {event.location}</p>
                        <p className="text-slate-400 text-sm">👥 {event.registered}/{event.capacity} registered</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeSection === 'qr-code' && (
            <div className="space-y-6">
              <div className="card-hover bg-slate-800/50 backdrop-blur-sm p-6 sm:p-8 rounded-2xl border border-slate-700/50">
                <div className="text-center">
                  <h2 className="text-xl sm:text-2xl font-bold text-white mb-6">My Digital ID</h2>
                  <div className="bg-white rounded-lg p-4 sm:p-6 max-w-sm mx-auto mb-6">
                    <img src={studentData.barcode} alt="Student Barcode" className="w-full h-auto" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md mx-auto text-left">
                    <div>
                      <p className="text-slate-400 text-sm">Name</p>
                      <p className="text-white font-medium text-sm sm:text-base truncate">{studentData.name}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 text-sm">Student ID</p>
                      <p className="text-white font-mono text-sm sm:text-base">{studentData.id}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 text-sm">Course</p>
                      <p className="text-white text-sm sm:text-base truncate">{studentData.course}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 text-sm">Year</p>
                      <p className="text-white text-sm sm:text-base">{studentData.year}</p>
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

          {activeSection === 'attendance' && (
            <div className="space-y-6">
              <div className="card-hover bg-slate-800/50 backdrop-blur-sm p-6 rounded-2xl border border-slate-700/50">
                <h2 className="text-xl font-bold text-white mb-6">Attendance Overview</h2>
                <div className="space-y-4">
                  {attendanceData.map((subject, index) => (
                    <div key={index} className="p-4 bg-slate-700/30 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="text-white font-medium">{subject.subject}</h3>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          subject.percentage >= 90 ? 'bg-green-900/30 text-green-400' :
                          subject.percentage >= 80 ? 'bg-yellow-900/30 text-yellow-400' :
                          'bg-red-900/30 text-red-400'
                        }`}>
                          {subject.percentage.toFixed(1)}%
                        </span>
                      </div>
                      <div className="flex justify-between text-sm text-slate-400 mb-2">
                        <span>Attended: {subject.attended}</span>
                        <span>Total: {subject.total}</span>
                      </div>
                      <div className="w-full bg-slate-600 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            subject.percentage >= 90 ? 'bg-green-500' :
                            subject.percentage >= 80 ? 'bg-yellow-500' :
                            'bg-red-500'
                          }`}
                          style={{ width: `${subject.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Other sections placeholder */}
          {!['overview', 'events', 'qr-code', 'attendance'].includes(activeSection) && (
            <div className="card-hover bg-slate-800/50 backdrop-blur-sm p-8 rounded-2xl border border-slate-700/50 text-center">
              <div className="text-6xl mb-4">
                {menuItems.find(item => item.id === activeSection)?.icon}
              </div>
              <h2 className="text-2xl font-bold text-white mb-4 capitalize">
                {activeSection.replace('-', ' ')}
              </h2>
              <p className="text-slate-300">This section is coming soon! We're working hard to bring you amazing features.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}