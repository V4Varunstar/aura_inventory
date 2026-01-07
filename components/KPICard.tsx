import React from 'react';
import { KPIData } from '../types';

interface KPICardProps {
  data: KPIData;
  className?: string;
  onClick?: () => void;
}

const KPICard: React.FC<KPICardProps> = ({ data, className = '', onClick }) => {
  const { title, value, change, changeType, icon, iconColorClass, iconBgClass, changeLabel } = data;

  const changeColorClass = changeType === 'positive' ? 'text-emerald-500' 
                         : changeType === 'negative' ? 'text-red-500' 
                         : 'text-orange-500';

  const trendIcon = changeType === 'positive' ? 'trending_up'
                  : changeType === 'negative' ? 'trending_down'
                  : 'trending_flat';
  
  const hoverBorderClass = changeType === 'positive' ? 'hover:border-primary/50' 
                         : changeType === 'negative' ? 'hover:border-red-500/50' 
                         : 'hover:border-orange-500/50';

  return (
    <div
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={(e) => {
        if (!onClick) return;
        if (e.key === 'Enter' || e.key === ' ') onClick();
      }}
      className={`p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200/70 dark:border-gray-800 shadow-sm flex flex-col justify-between h-32 ${hoverBorderClass} transition-colors ${onClick ? 'cursor-pointer' : 'cursor-default'} group ${className}`}
    >
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
        <span
          className={`material-symbols-outlined ${iconColorClass} ${iconBgClass} p-2 rounded-full text-[20px] border border-gray-200/70 dark:border-white/10`}
        >
          {icon}
        </span>
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
        <p className={`text-xs font-medium ${changeColorClass} flex items-center gap-1 mt-1`}>
          <span className="material-symbols-outlined text-[16px]">{trendIcon}</span>
          {change} {changeLabel}
        </p>
      </div>
    </div>
  );
};

export default KPICard;