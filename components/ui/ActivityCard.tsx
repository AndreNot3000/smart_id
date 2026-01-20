interface Activity {
  id: number;
  type?: string;
  name?: string;
  title?: string;
  description?: string;
  time?: string;
  date?: string;
  status?: string;
  priority?: string;
  icon?: string;
  [key: string]: any;
}

interface ActivityCardProps {
  activities: Activity[];
  title: string;
  onItemClick?: (activity: Activity) => void;
  showActions?: boolean;
}

export default function ActivityCard({ 
  activities, 
  title, 
  onItemClick,
  showActions = false 
}: ActivityCardProps) {
  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'completed':
      case 'active':
        return 'bg-green-900/30 text-green-400';
      case 'pending':
      case 'in-progress':
        return 'bg-yellow-900/30 text-yellow-400';
      case 'failed':
      case 'suspended':
        return 'bg-red-900/30 text-red-400';
      default:
        return 'bg-blue-900/30 text-blue-400';
    }
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-900/30 text-red-400';
      case 'medium':
        return 'bg-yellow-900/30 text-yellow-400';
      case 'low':
        return 'bg-green-900/30 text-green-400';
      default:
        return 'bg-slate-900/30 text-slate-400';
    }
  };

  return (
    <div className="card-hover bg-slate-800/50 backdrop-blur-sm p-4 sm:p-6 rounded-2xl border border-slate-700/50">
      <h3 className="text-base sm:text-lg font-bold text-white mb-4">{title}</h3>
      <div className="space-y-3">
        {activities.map((activity) => (
          <div 
            key={activity.id} 
            className={`p-3 bg-slate-700/30 rounded-lg hover:bg-slate-700/50 transition-colors ${onItemClick ? 'cursor-pointer' : ''}`}
            onClick={() => onItemClick?.(activity)}
          >
            <div className="flex justify-between items-start mb-2">
              <div className="min-w-0 flex-1">
                <p className="text-white font-medium text-sm sm:text-base truncate">
                  {activity.title || activity.name || activity.type}
                </p>
                <p className="text-slate-400 text-xs sm:text-sm truncate">
                  {activity.description || activity.time || activity.date}
                </p>
              </div>
              {(activity.status || activity.priority) && (
                <span className={`px-2 py-1 rounded text-xs font-medium flex-shrink-0 ml-2 ${
                  activity.priority ? getPriorityColor(activity.priority) : getStatusColor(activity.status)
                }`}>
                  {activity.priority || activity.status}
                </span>
              )}
            </div>
            
            {showActions && (
              <div className="flex justify-between items-center">
                <span className="text-slate-500 text-xs">
                  {activity.time || activity.date}
                </span>
                <div className="flex space-x-2">
                  <button className="text-green-400 hover:text-green-300 text-xs">Approve</button>
                  <button className="text-red-400 hover:text-red-300 text-xs">Reject</button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}