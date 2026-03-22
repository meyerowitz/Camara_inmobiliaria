import React from 'react';

interface DashboardCardProps {
  children: React.ReactNode;
  title: string;
  icon?: React.ElementType;
  actionText?: string;
  actionIcon?: React.ElementType;
  onAction?: () => void;
}

const DashboardCard = ({
  children,
  title,
  icon: Icon,
  actionText,
  actionIcon: ActionIcon,
  onAction,
}: DashboardCardProps) => (
  <div className="bg-white rounded-2xl shadow-sm border border-emerald-100/60 overflow-hidden flex flex-col hover:shadow-md transition-shadow">
    {/* Card header */}
    <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/40">
      <div className="flex items-center gap-2.5">
        {Icon && <Icon size={17} className="text-emerald-600" />}
        <h3 className="font-bold text-[#022c22] text-sm uppercase tracking-wider">{title}</h3>
      </div>
      {actionText && (
        <button
          onClick={onAction}
          className="text-[10px] font-bold text-emerald-600 hover:text-emerald-800 hover:underline uppercase tracking-widest flex items-center gap-1 transition-colors"
        >
          {actionText}
          {ActionIcon && <ActionIcon size={11} />}
        </button>
      )}
    </div>
    <div className="p-6 flex-grow">{children}</div>
  </div>
);

export default DashboardCard;
