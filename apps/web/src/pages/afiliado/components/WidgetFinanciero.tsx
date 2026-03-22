import React from 'react';
import { CreditCard, Download } from 'lucide-react';
import DashboardCard from './DashboardCard';

interface WidgetFinancieroProps {
  balanceUsd?: string;
  cuotasPendientes?: string;
  proximoVencimiento?: string;
  onGenerarSolvencia?: () => void;
}

const WidgetFinanciero = ({
  balanceUsd = '$150.00',
  cuotasPendientes = '2 Meses',
  proximoVencimiento = '23/05/2026',
  onGenerarSolvencia,
}: WidgetFinancieroProps) => (
  <DashboardCard
    title="Contabilidad y Solvencias"
    icon={CreditCard}
    actionText="Ver historial de pagos"
  >
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-8 py-4">
      {/* Balance */}
      <div className="space-y-1">
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Balance Actual (USD)</p>
        <div className="flex items-baseline gap-2">
          <span className="text-4xl sm:text-5xl font-black text-[#022c22]">{balanceUsd}</span>
          <span className="text-slate-400 font-bold text-base uppercase">Neto</span>
        </div>
      </div>
      {/* Details */}
      <div className="flex-grow max-w-xs space-y-3">
        <div className="flex justify-between items-center text-sm">
          <span className="text-slate-500 font-medium">Cuotas Pendientes:</span>
          <span className="font-black text-[#022c22] bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-md text-xs">
            {cuotasPendientes}
          </span>
        </div>
        <div className="flex justify-between items-center text-sm">
          <span className="text-slate-500 font-medium">Próximo Vencimiento:</span>
          <span className="font-bold text-emerald-600">{proximoVencimiento}</span>
        </div>
      </div>
    </div>
    <div className="mt-6">
      <button
        onClick={onGenerarSolvencia}
        className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-black py-3.5 px-8 rounded-xl shadow-lg shadow-emerald-900/20 flex items-center justify-center gap-3 transition-all hover:-translate-y-0.5 active:scale-[0.98]"
      >
        <Download size={17} />
        Generar Solvencia Automática
      </button>
    </div>
  </DashboardCard>
);

export default WidgetFinanciero;
