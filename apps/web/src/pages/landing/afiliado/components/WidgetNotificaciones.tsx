import React from 'react';
import { Bell, AlertTriangle, Gavel } from 'lucide-react';
import DashboardCard from '@/pages/landing/afiliado/components/DashboardCard';
import { SkeletonNotification } from '@/components/Skeleton';

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
  loading?: boolean;
}

const WidgetNotificaciones = ({
  notifications = DEFAULT_NOTIFICATIONS,
  onMarkRead,
  loading = false,
}: WidgetNotificacionesProps) => (
  <DashboardCard title="Alertas y Avisos" icon={Bell} actionText="Marcar como leídas" onAction={onMarkRead}>
    <div className="space-y-3">
      {loading ? (
        <>
          <SkeletonNotification />
          <SkeletonNotification />
          <SkeletonNotification />
        </>
      ) : (
        <>
          {notifications.map((notif, i) => (
            <div
              key={i}
              className="flex gap-3 p-3.5 rounded-xl transition-colors cursor-pointer group"
              style={{ backgroundColor: 'var(--color-bg-subtle)', border: '1px solid var(--color-border)' }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--color-border-accent)';
                (e.currentTarget as HTMLDivElement).style.backgroundColor = 'var(--color-accent-subtle)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--color-border)';
                (e.currentTarget as HTMLDivElement).style.backgroundColor = 'var(--color-bg-subtle)';
              }}
            >
              {/* Side bar indicator */}
              <div
                className="mt-0.5 w-1 flex-shrink-0 rounded-full"
                style={{ backgroundColor: notif.type === 'danger' ? 'var(--color-danger)' : 'var(--color-accent)' }}
              />
              <div className="flex-grow min-w-0">
                <h4 className="font-extrabold text-sm leading-tight truncate" style={{ color: 'var(--color-text-base)' }}>
                  {notif.title}
                </h4>
                <p className="text-xs mt-1 leading-relaxed line-clamp-2" style={{ color: 'var(--color-text-muted)' }}>
                  {notif.desc}
                </p>
                <span className="text-[9px] font-bold uppercase mt-2 block tracking-wider" style={{ color: 'var(--color-text-faint)' }}>
                  {notif.time}
                </span>
              </div>
            </div>
          ))}

          <button
            className="w-full text-center py-2 text-xs font-bold uppercase tracking-widest mt-2 transition-colors"
            style={{ color: 'var(--color-text-faint)' }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-accent-hover)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--color-text-faint)')}
          >
            Ver todas las notificaciones
          </button>
        </>
      )}
    </div>
  </DashboardCard>
);

export default WidgetNotificaciones;
