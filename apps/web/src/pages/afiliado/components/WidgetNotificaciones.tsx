import React from 'react';
import { Bell, AlertTriangle, Gavel } from 'lucide-react';
import DashboardCard from './DashboardCard';

interface Notification {
  type: 'danger' | 'info';
  icon: React.ElementType;
  title: string;
  desc: string;
  time: string;
}

const DEFAULT_NOTIFICATIONS: Notification[] = [
  {
    type: 'danger',
    icon: AlertTriangle,
    title: 'Tu cuota vence en 3 días',
    desc: 'Evita recargos por mora pagando antes del 23 de mayo.',
    time: 'Hace 2 horas',
  },
  {
    type: 'info',
    icon: Gavel,
    title: 'Tribunal Disciplinario',
    desc: 'Se ha registrado una actualización en tu caso #TD-2024-05.',
    time: 'Ayer',
  },
  {
    type: 'info',
    icon: Bell,
    title: 'Asamblea General CIEBO',
    desc: 'Nueva invitación para la sesión extraordinaria de junio.',
    time: 'Hace 2 días',
  },
];

interface WidgetNotificacionesProps {
  notifications?: Notification[];
  onMarkRead?: () => void;
}

const WidgetNotificaciones = ({
  notifications = DEFAULT_NOTIFICATIONS,
  onMarkRead,
}: WidgetNotificacionesProps) => (
  <DashboardCard
    title="Alertas y Avisos"
    icon={Bell}
    actionText="Marcar como leídas"
    onAction={onMarkRead}
  >
    <div className="space-y-3">
      {notifications.map((notif, i) => (
        <div
          key={i}
          className="flex gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-100 hover:border-emerald-100 hover:bg-emerald-50/30 transition-colors cursor-pointer group"
        >
          <div
            className={`mt-0.5 w-1 flex-shrink-0 rounded-full ${notif.type === 'danger' ? 'bg-red-500' : 'bg-emerald-500'}`}
          />
          <div className="flex-grow min-w-0">
            <h4 className="font-extrabold text-slate-800 text-sm leading-tight group-hover:text-emerald-700 transition-colors truncate">
              {notif.title}
            </h4>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed line-clamp-2">{notif.desc}</p>
            <span className="text-[9px] font-bold text-slate-400 uppercase mt-2 block tracking-wider">
              {notif.time}
            </span>
          </div>
        </div>
      ))}
      <button className="w-full text-center py-2 text-xs font-bold text-slate-400 hover:text-emerald-600 transition-colors uppercase tracking-widest mt-2">
        Ver todas las notificaciones
      </button>
    </div>
  </DashboardCard>
);

export default WidgetNotificaciones;
