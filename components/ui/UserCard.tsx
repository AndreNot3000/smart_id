interface UserCardProps {
  user: {
    id: number;
    name: string;
    email?: string;
    department?: string;
    status: string;
    [key: string]: any;
  };
  onClick?: (user: any) => void;
  userType: 'student' | 'lecturer' | 'admin';
  additionalInfo?: { label: string; value: string }[];
}

export default function UserCard({ user, onClick, userType, additionalInfo = [] }: UserCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-900/30 text-green-400';
      case 'pending':
        return 'bg-yellow-900/30 text-yellow-400';
      case 'suspended':
        return 'bg-red-900/30 text-red-400';
      default:
        return 'bg-slate-900/30 text-slate-400';
    }
  };

  const getUserIcon = () => {
    switch (userType) {
      case 'student':
        return '🎓';
      case 'lecturer':
        return '👨‍🏫';
      case 'admin':
        return '👨‍💼';
      default:
        return '👤';
    }
  };

  return (
    <div 
      className="bg-slate-700/30 rounded-lg p-4 hover:bg-slate-700/50 transition-colors cursor-pointer touch-manipulation"
      onClick={() => onClick?.(user)}
    >
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center space-x-3">
          <div className="h-8 w-8 bg-slate-600 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-slate-300">{getUserIcon()}</span>
          </div>
          <div>
            <h3 className="text-white font-semibold text-sm sm:text-base">{user.name}</h3>
            {user.email && (
              <p className="text-slate-400 text-xs sm:text-sm truncate">{user.email}</p>
            )}
          </div>
        </div>
        <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(user.status)}`}>
          {user.status}
        </span>
      </div>
      
      {additionalInfo.length > 0 && (
        <div className="space-y-2 text-xs sm:text-sm">
          {additionalInfo.map((info, index) => (
            <div key={index} className="flex justify-between">
              <span className="text-slate-400">{info.label}:</span>
              <span className="text-white">{info.value}</span>
            </div>
          ))}
        </div>
      )}
      
      {onClick && (
        <div className="mt-3 pt-3 border-t border-slate-600 text-right">
          <span className="text-slate-400 text-xs">Click for details →</span>
        </div>
      )}
    </div>
  );
}