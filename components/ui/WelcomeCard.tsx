interface WelcomeCardProps {
  userName: string;
  message: string;
  rightContent?: {
    label: string;
    value: string;
    subtitle?: string;
  };
}

export default function WelcomeCard({ userName, message, rightContent }: WelcomeCardProps) {
  return (
    <div className="card-hover bg-slate-800/50 backdrop-blur-sm p-6 rounded-2xl border border-slate-700/50">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-white mb-2">Welcome back, {userName}! 👋</h2>
          <p className="text-slate-300">{message}</p>
        </div>
        {rightContent && (
          <div className="text-right">
            <p className="text-slate-400 text-sm">{rightContent.label}</p>
            <p className="text-white font-semibold">{rightContent.value}</p>
            {rightContent.subtitle && (
              <p className="text-slate-400 text-xs">{rightContent.subtitle}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}