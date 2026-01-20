"use client";

import Link from "next/link";

interface MenuItem {
  id: string;
  name: string;
  icon: string;
}

interface UserData {
  name: string;
  avatar: string;
  role?: string;
  title?: string;
  department?: string;
  permissions?: string;
}

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  menuItems: MenuItem[];
  activeSection: string;
  onSectionChange: (section: string) => void;
  userData: UserData;
  userType: 'student' | 'lecturer' | 'admin';
}

export default function Sidebar({
  isOpen,
  onClose,
  menuItems,
  activeSection,
  onSectionChange,
  userData,
  userType
}: SidebarProps) {
  const getAvatarColor = () => {
    switch (userType) {
      case 'student':
        return 'from-blue-500 to-purple-600';
      case 'lecturer':
        return 'from-blue-500 to-purple-600';
      case 'admin':
        return 'from-red-500 to-orange-600';
      default:
        return 'from-blue-500 to-purple-600';
    }
  };

  const getActiveColor = () => {
    switch (userType) {
      case 'student':
        return 'from-blue-600 to-purple-600';
      case 'lecturer':
        return 'from-blue-600 to-purple-600';
      case 'admin':
        return 'from-red-600 to-orange-600';
      default:
        return 'from-blue-600 to-purple-600';
    }
  };

  return (
    <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-800/95 backdrop-blur-sm border-r border-slate-700/50 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
      <div className="flex items-center justify-between p-6 border-b border-slate-700/50">
        <Link href="/" className="flex items-center space-x-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <span className="text-white font-bold text-sm">ID</span>
          </div>
          <span className="text-xl font-bold text-white">Campus ID</span>
        </Link>
        <button 
          onClick={onClose}
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
          <div className={`h-10 w-10 sm:h-12 sm:w-12 bg-gradient-to-br ${getAvatarColor()} rounded-full flex items-center justify-center flex-shrink-0`}>
            <span className="text-white font-bold text-sm sm:text-base">{userData.avatar}</span>
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-white font-semibold text-sm sm:text-base truncate">{userData.name}</h3>
            <p className="text-slate-400 text-xs sm:text-sm truncate">
              {userData.role || userData.title}
            </p>
            <p className="text-slate-500 text-xs truncate">
              {userData.department || userData.permissions}
            </p>
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
                  onSectionChange(item.id);
                  onClose();
                }}
                className={`w-full flex items-center space-x-3 px-3 sm:px-4 py-3 sm:py-3 rounded-lg text-left transition-colors touch-manipulation ${
                  activeSection === item.id
                    ? `bg-gradient-to-r ${getActiveColor()} text-white`
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
  );
}