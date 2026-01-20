"use client";

interface HeaderStats {
  label: string;
  value: string;
}

interface UserData {
  avatar: string;
}

interface DashboardHeaderProps {
  title: string;
  onMenuClick: () => void;
  onActionClick?: () => void;
  actionLabel?: string;
  actionIcon?: string;
  stats?: HeaderStats[];
  userData: UserData;
  userType: 'student' | 'lecturer' | 'admin';
}

export default function DashboardHeader({
  title,
  onMenuClick,
  onActionClick,
  actionLabel,
  actionIcon,
  stats = [],
  userData,
  userType
}: DashboardHeaderProps) {
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

  return (
    <header className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700/50 px-4 sm:px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <button
            onClick={onMenuClick}
            className="lg:hidden text-slate-400 hover:text-white p-1"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          </button>
          <h1 className="text-lg sm:text-2xl font-bold text-white capitalize truncate">{title}</h1>
        </div>
        
        <div className="flex items-center space-x-2 sm:space-x-4">
          {/* Action Button */}
          {onActionClick && actionLabel && (
            <button
              onClick={onActionClick}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-2 sm:px-4 py-2 rounded-lg transition-colors flex items-center space-x-1 sm:space-x-2"
            >
              {actionIcon && <span className="text-sm">{actionIcon}</span>}
              <span className="hidden sm:inline text-sm">{actionLabel}</span>
            </button>
          )}
          
          {/* Stats */}
          <div className="hidden xs:flex items-center space-x-2 sm:space-x-4">
            {stats.map((stat, index) => (
              <div key={index} className="text-right">
                <p className="text-white font-semibold text-sm sm:text-base">{stat.value}</p>
                <p className="text-slate-400 text-xs sm:text-sm hidden sm:block">{stat.label}</p>
              </div>
            ))}
          </div>
          
          {/* Avatar */}
          <div className={`h-8 w-8 sm:h-10 sm:w-10 bg-gradient-to-br ${getAvatarColor()} rounded-full flex items-center justify-center`}>
            <span className="text-white font-bold text-sm sm:text-base">{userData.avatar}</span>
          </div>
        </div>
      </div>
      
      {/* Mobile Stats Row */}
      {stats.length > 0 && (
        <div className="flex xs:hidden justify-center space-x-6 mt-3 pt-3 border-t border-slate-700/50">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <p className="text-white font-semibold text-sm">{stat.value}</p>
              <p className="text-slate-400 text-xs">{stat.label}</p>
            </div>
          ))}
        </div>
      )}
    </header>
  );
}