"use client";

import Link from "next/link";
import { useState } from "react";

export default function AdminDashboard() {
  const [activeSection, setActiveSection] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedInstitution, setSelectedInstitution] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [userModalType, setUserModalType] = useState('create');

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

  const institutionData = {
    name: 'Harvard University',
    domain: 'harvard.edu',
    totalStudents: 15420,
    totalLecturers: 892,
    totalDepartments: 12,
    totalCourses: 2840,
    activeEnrollments: 45600,
    currentSemester: 'Fall 2024',
    academicYear: '2024-2025'
  };

  const departments = [
    {
      id: 1,
      name: 'Computer Science',
      head: 'Dr. Sarah Johnson',
      students: 2450,
      lecturers: 85,
      courses: 120,
      budget: 2500000
    },
    {
      id: 2,
      name: 'Mathematics',
      head: 'Prof. David Wilson',
      students: 1890,
      lecturers: 62,
      courses: 95,
      budget: 1800000
    },
    {
      id: 3,
      name: 'Physics',
      head: 'Dr. Emily Chen',
      students: 1650,
      lecturers: 58,
      courses: 88,
      budget: 2200000
    },
    {
      id: 4,
      name: 'Business Administration',
      head: 'Prof. Michael Brown',
      students: 3200,
      lecturers: 95,
      courses: 150,
      budget: 3100000
    }
  ];

  const recentStudents = [
    {
      id: 1,
      name: 'John Smith',
      studentId: 'STU123456789',
      email: 'john.smith@harvard.edu',
      department: 'Computer Science',
      year: 'Junior',
      status: 'active',
      enrollmentDate: '2024-01-10',
      gpa: 3.75
    },
    {
      id: 2,
      name: 'Emily Johnson',
      studentId: 'STU987654321',
      email: 'emily.johnson@harvard.edu',
      department: 'Mathematics',
      year: 'Sophomore',
      status: 'active',
      enrollmentDate: '2024-01-12',
      gpa: 3.92
    },
    {
      id: 3,
      name: 'Michael Davis',
      studentId: 'STU456789123',
      email: 'michael.davis@harvard.edu',
      department: 'Physics',
      year: 'Senior',
      status: 'active',
      enrollmentDate: '2024-01-08',
      gpa: 3.68
    }
  ];

  const recentLecturers = [
    {
      id: 1,
      name: 'Dr. Sarah Johnson',
      facultyId: 'FAC123456789',
      email: 'sarah.johnson@harvard.edu',
      department: 'Computer Science',
      position: 'Associate Professor',
      status: 'active',
      joinDate: '2020-08-15',
      courses: 3
    },
    {
      id: 2,
      name: 'Prof. David Wilson',
      facultyId: 'FAC987654321',
      email: 'david.wilson@harvard.edu',
      department: 'Mathematics',
      position: 'Professor',
      status: 'active',
      joinDate: '2018-01-10',
      courses: 2
    },
    {
      id: 3,
      name: 'Dr. Emily Chen',
      facultyId: 'FAC456789123',
      email: 'emily.chen@harvard.edu',
      department: 'Physics',
      position: 'Assistant Professor',
      status: 'pending',
      joinDate: '2024-01-14',
      courses: 1
    }
  ];

  const pendingApprovals = [
    {
      id: 1,
      type: 'Student Enrollment',
      name: 'Alex Thompson',
      department: 'Computer Science',
      requestDate: '2024-01-14',
      priority: 'medium'
    },
    {
      id: 2,
      type: 'Course Addition',
      name: 'Advanced Machine Learning',
      department: 'Computer Science',
      requestDate: '2024-01-13',
      priority: 'high'
    },
    {
      id: 3,
      type: 'Grade Change Request',
      name: 'Database Systems - John Smith',
      department: 'Computer Science',
      requestDate: '2024-01-12',
      priority: 'low'
    }
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

      {/* User Modal */}
      {showUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-slate-800 rounded-2xl p-8 max-w-2xl w-full border border-slate-700 max-h-96 overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-2xl font-bold text-white">
                {userModalType === 'create' ? 'Create New User' : 'Edit User'}
              </h3>
              <button
                onClick={() => setShowUserModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">First Name</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                    placeholder="John"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Last Name</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                    placeholder="Doe"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
                <input
                  type="email"
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                  placeholder="john.doe@university.edu"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">User Type</label>
                  <select className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white">
                    <option value="student">Student</option>
                    <option value="lecturer">Lecturer</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Institution</label>
                  <input
                    type="text"
                    value={institutionData.name}
                    disabled
                    className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded-lg text-slate-400"
                  />
                </div>
              </div>
              
              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowUserModal(false)}
                  className="flex-1 border border-slate-600 text-slate-300 py-2 rounded-lg hover:bg-slate-700/50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-colors"
                >
                  {userModalType === 'create' ? 'Create User' : 'Update User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Institution Details Modal */}
      {selectedInstitution && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-slate-800 rounded-2xl p-8 max-w-4xl w-full border border-slate-700 max-h-96 overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-2xl font-bold text-white">{selectedInstitution.name}</h3>
                <p className="text-slate-400">{selectedInstitution.domain}</p>
              </div>
              <button
                onClick={() => setSelectedInstitution(null)}
                className="text-slate-400 hover:text-white"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h4 className="text-white font-semibold mb-2">Subscription Details</h4>
                  <div className="bg-slate-700/30 rounded-lg p-4 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Plan:</span>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        selectedInstitution.plan === 'Enterprise' ? 'bg-purple-900/30 text-purple-400' :
                        selectedInstitution.plan === 'Professional' ? 'bg-blue-900/30 text-blue-400' :
                        'bg-green-900/30 text-green-400'
                      }`}>
                        {selectedInstitution.plan}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Monthly Revenue:</span>
                      <span className="text-green-400 font-semibold">₦{selectedInstitution.monthlyRevenue.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Status:</span>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        selectedInstitution.status === 'active' ? 'bg-green-900/30 text-green-400' :
                        selectedInstitution.status === 'trial' ? 'bg-yellow-900/30 text-yellow-400' :
                        'bg-red-900/30 text-red-400'
                      }`}>
                        {selectedInstitution.status}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-white font-semibold mb-2">Usage Statistics</h4>
                  <div className="bg-slate-700/30 rounded-lg p-4 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Students:</span>
                      <span className="text-white font-semibold">{selectedInstitution.students.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Lecturers:</span>
                      <span className="text-white font-semibold">{selectedInstitution.lecturers.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Join Date:</span>
                      <span className="text-slate-300">{new Date(selectedInstitution.joinDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Last Activity:</span>
                      <span className="text-slate-300">{new Date(selectedInstitution.lastActivity).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="text-white font-semibold mb-2">Features & Permissions</h4>
                <div className="bg-slate-700/30 rounded-lg p-4">
                  <div className="space-y-2">
                    {selectedInstitution.features.map((feature, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <svg className="h-4 w-4 text-green-400" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-slate-300 text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="mt-4 space-y-2">
                  <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition-colors">
                    View Detailed Analytics
                  </button>
                  <button className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg transition-colors">
                    Manage Subscription
                  </button>
                  <button className="w-full border border-slate-600 text-slate-300 py-2 rounded-lg hover:bg-slate-700/50 transition-colors">
                    Contact Institution
                  </button>
                </div>
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
                  <p className="text-white font-semibold text-sm">{institutionData.totalStudents.toLocaleString()}</p>
                  <p className="text-slate-400 text-xs">Students</p>
                </div>
                <div className="text-right">
                  <p className="text-white font-semibold text-sm">{institutionData.totalLecturers}</p>
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
                    <h2 className="text-xl font-bold text-white mb-2">Welcome back, {adminData.name}! 👋</h2>
                    <p className="text-slate-300">Here's your {institutionData.name} overview for today.</p>
                  </div>
                  <div className="text-right">
                    <p className="text-slate-400 text-sm">Academic Year</p>
                    <p className="text-white font-semibold">{institutionData.academicYear}</p>
                    <p className="text-slate-400 text-xs">{institutionData.currentSemester}</p>
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
                      <p className="text-xl sm:text-2xl font-bold text-white">{institutionData.totalStudents.toLocaleString()}</p>
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
                      <p className="text-xl sm:text-2xl font-bold text-white">{institutionData.totalLecturers}</p>
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
                      <p className="text-slate-400 text-xs sm:text-sm">Departments</p>
                      <p className="text-xl sm:text-2xl font-bold text-white">{institutionData.totalDepartments}</p>
                      <p className="text-purple-400 text-xs sm:text-sm">Across campus</p>
                    </div>
                    <div className="h-10 w-10 sm:h-12 sm:w-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-lg sm:text-xl">🏢</span>
                    </div>
                  </div>
                </div>

                <div className="card-hover bg-slate-800/50 backdrop-blur-sm p-4 sm:p-6 rounded-2xl border border-slate-700/50">
                  <div className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="text-slate-400 text-xs sm:text-sm">Active Courses</p>
                      <p className="text-xl sm:text-2xl font-bold text-white">{institutionData.totalCourses.toLocaleString()}</p>
                      <p className="text-cyan-400 text-xs sm:text-sm">This semester</p>
                    </div>
                    <div className="h-10 w-10 sm:h-12 sm:w-12 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-lg sm:text-xl">📚</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Activity & Pending Approvals */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
                {/* Recent Students */}
                <div className="card-hover bg-slate-800/50 backdrop-blur-sm p-4 sm:p-6 rounded-2xl border border-slate-700/50">
                  <h3 className="text-base sm:text-lg font-bold text-white mb-4">Recent Student Enrollments</h3>
                  <div className="space-y-3">
                    {recentStudents.map((student) => (
                      <div key={student.id} className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg hover:bg-slate-700/50 transition-colors">
                        <div className="flex items-center space-x-3 min-w-0 flex-1">
                          <div className="h-8 w-8 rounded-full bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                            <span className="text-blue-400">🎓</span>
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-white font-medium text-sm sm:text-base truncate">{student.name}</p>
                            <p className="text-slate-400 text-xs sm:text-sm truncate">{student.department} • {student.year}</p>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <span className="text-green-400 font-semibold text-sm">GPA: {student.gpa}</span>
                          <p className="text-slate-500 text-xs">{new Date(student.enrollmentDate).toLocaleDateString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Pending Approvals */}
                <div className="card-hover bg-slate-800/50 backdrop-blur-sm p-4 sm:p-6 rounded-2xl border border-slate-700/50">
                  <h3 className="text-base sm:text-lg font-bold text-white mb-4">Pending Approvals</h3>
                  <div className="space-y-3">
                    {pendingApprovals.map((item) => (
                      <div key={item.id} className="p-3 bg-slate-700/30 rounded-lg hover:bg-slate-700/50 transition-colors cursor-pointer">
                        <div className="flex justify-between items-start mb-2">
                          <div className="min-w-0 flex-1">
                            <p className="text-white font-medium text-sm sm:text-base truncate">{item.name}</p>
                            <p className="text-slate-400 text-xs sm:text-sm truncate">{item.type} • {item.department}</p>
                          </div>
                          <span className={`px-2 py-1 rounded text-xs font-medium flex-shrink-0 ml-2 ${
                            item.priority === 'high' ? 'bg-red-900/30 text-red-400' :
                            item.priority === 'medium' ? 'bg-yellow-900/30 text-yellow-400' :
                            'bg-green-900/30 text-green-400'
                          }`}>
                            {item.priority}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-slate-500 text-xs">{new Date(item.requestDate).toLocaleDateString()}</span>
                          <div className="flex space-x-2">
                            <button className="text-green-400 hover:text-green-300 text-xs">Approve</button>
                            <button className="text-red-400 hover:text-red-300 text-xs">Reject</button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'students' && (
            <div className="space-y-6">
              <div className="card-hover bg-slate-800/50 backdrop-blur-sm p-6 rounded-2xl border border-slate-700/50">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-white">Student Management</h2>
                  <button 
                    onClick={() => {
                      setShowUserModal(true);
                      setUserModalType('create');
                    }}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-colors"
                  >
                    Add New Student
                  </button>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                  {recentStudents.map((student) => (
                    <div 
                      key={student.id}
                      className="bg-slate-700/30 rounded-lg p-4 hover:bg-slate-700/50 transition-colors cursor-pointer"
                      onClick={() => setSelectedUser(student)}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="text-white font-semibold text-sm sm:text-base">{student.name}</h3>
                          <p className="text-slate-400 text-xs sm:text-sm">{student.studentId}</p>
                        </div>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          student.status === 'active' ? 'bg-green-900/30 text-green-400' :
                          'bg-yellow-900/30 text-yellow-400'
                        }`}>
                          {student.status}
                        </span>
                      </div>
                      
                      <div className="space-y-2 text-xs sm:text-sm">
                        <div className="flex justify-between">
                          <span className="text-slate-400">Department:</span>
                          <span className="text-white">{student.department}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Year:</span>
                          <span className="text-white">{student.year}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">GPA:</span>
                          <span className="text-green-400 font-semibold">{student.gpa}</span>
                        </div>
                      </div>
                      
                      <div className="mt-3 pt-3 border-t border-slate-600 flex justify-between items-center">
                        <span className="text-slate-400 text-xs">Enrolled: {new Date(student.enrollmentDate).toLocaleDateString()}</span>
                        <span className="text-slate-400 text-xs">View Details →</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeSection === 'departments' && (
            <div className="space-y-6">
              <div className="card-hover bg-slate-800/50 backdrop-blur-sm p-6 rounded-2xl border border-slate-700/50">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-white">Department Management</h2>
                  <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-colors">
                    Add New Department
                  </button>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                  {departments.map((department) => (
                    <div 
                      key={department.id}
                      className="bg-slate-700/30 rounded-lg p-6 hover:bg-slate-700/50 transition-colors cursor-pointer"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-white font-semibold text-lg">{department.name}</h3>
                          <p className="text-slate-400 text-sm">Head: {department.head}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-green-400 font-semibold">₦{(department.budget / 1000000).toFixed(1)}M</p>
                          <p className="text-slate-400 text-xs">Budget</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                          <p className="text-xl font-bold text-blue-400">{department.students.toLocaleString()}</p>
                          <p className="text-slate-400 text-xs">Students</p>
                        </div>
                        <div>
                          <p className="text-xl font-bold text-green-400">{department.lecturers}</p>
                          <p className="text-slate-400 text-xs">Lecturers</p>
                        </div>
                        <div>
                          <p className="text-xl font-bold text-purple-400">{department.courses}</p>
                          <p className="text-slate-400 text-xs">Courses</p>
                        </div>
                      </div>
                      
                      <div className="mt-4 flex space-x-2">
                        <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded text-sm transition-colors">
                          View Details
                        </button>
                        <button className="flex-1 border border-slate-600 text-slate-300 py-2 rounded text-sm hover:bg-slate-700/50 transition-colors">
                          Manage
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Other sections placeholder */}
          {!['overview', 'students', 'departments'].includes(activeSection) && (
            <div className="card-hover bg-slate-800/50 backdrop-blur-sm p-8 rounded-2xl border border-slate-700/50 text-center">
              <div className="text-6xl mb-4">
                {menuItems.find(item => item.id === activeSection)?.icon}
              </div>
              <h2 className="text-2xl font-bold text-white mb-4 capitalize">
                {activeSection.replace('-', ' ')}
              </h2>
              <p className="text-slate-300">This section is coming soon! We're building comprehensive admin tools for managing your Campus ID SaaS platform.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}