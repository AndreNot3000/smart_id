interface StatsCardProps {
  title: string;
  value: string;
  subtitle: string;
  icon: string;
  iconColor: string;
  className?: string;
}

export default function StatsCard({
  title,
  value,
  subtitle,
  icon,
  iconColor,
  className = ""
}: StatsCardProps) {
  return (
    <div className={`card-hover bg-slate-800/50 backdrop-blur-sm p-4 sm:p-6 rounded-2xl border border-slate-700/50 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="min-w-0 flex-1">
          <p className="text-slate-400 text-xs sm:text-sm">{title}</p>
          <p className="text-xl sm:text-2xl font-bold text-white truncate">{value}</p>
          <p className="text-xs sm:text-sm truncate" style={{ color: subtitle.includes('+') ? '#10b981' : subtitle.includes('-') ? '#ef4444' : '#8b5cf6' }}>
            {subtitle}
          </p>
        </div>
        <div className={`h-10 w-10 sm:h-12 sm:w-12 bg-gradient-to-br ${iconColor} rounded-lg flex items-center justify-center flex-shrink-0`}>
          <span className="text-white text-lg sm:text-xl">{icon}</span>
        </div>
      </div>
    </div>
  );
}