interface QuickAction {
  id: string;
  name: string;
  icon: string;
  color: string;
}

interface QuickActionsProps {
  actions: QuickAction[];
  onActionClick: (actionId: string) => void;
  title?: string;
}

export default function QuickActions({ 
  actions, 
  onActionClick, 
  title = "Quick Actions" 
}: QuickActionsProps) {
  return (
    <div className="card-hover bg-slate-800/50 backdrop-blur-sm p-6 rounded-2xl border border-slate-700/50">
      <h3 className="text-lg font-bold text-white mb-4">{title}</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {actions.map((action) => (
          <button
            key={action.id}
            onClick={() => onActionClick(action.id)}
            className={`btn-primary bg-gradient-to-r ${action.color} hover:scale-105 text-white p-3 sm:p-4 rounded-lg text-center transition-all duration-300 touch-manipulation`}
          >
            <div className="text-xl sm:text-2xl mb-2">{action.icon}</div>
            <div className="font-medium text-xs sm:text-sm">{action.name}</div>
          </button>
        ))}
      </div>
    </div>
  );
}