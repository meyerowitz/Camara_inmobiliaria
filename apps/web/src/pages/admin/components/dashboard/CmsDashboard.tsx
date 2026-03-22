import React from 'react'
import StatCard from './StatCard'
import QuickActionButton from './QuickActionButton'
import CashFlowChart from './CashFlowChart'
import RecentTransactionsTable from './RecentTransactionsTable'
import NetProfitCard from './NetProfitCard'

const Icon = {
  balance: (
    <svg viewBox="0 0 24 24" className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="1" x2="12" y2="23" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  ),
  income: (
    <svg viewBox="0 0 24 24" className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
      <polyline points="17 6 23 6 23 12" />
    </svg>
  ),
  expense: (
    <svg viewBox="0 0 24 24" className="w-5 h-5 text-rose-400" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 18 13.5 8.5 8.5 13.5 1 6" />
      <polyline points="17 18 23 18 23 12" />
    </svg>
  ),
  savings: (
    <svg viewBox="0 0 24 24" className="w-5 h-5 text-violet-400" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1" />
      <path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4" />
    </svg>
  ),
  plus: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  ),
  minus: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  ),
}

const CmsDashboard = () => {
  return (
    <div className="flex flex-col gap-4 sm:gap-6 p-4 sm:p-6 max-w-screen-xl">

      {/* ── Page heading ── */}
      <div className="flex items-start sm:items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900">Panel Financiero</h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Resumen de flujo de caja y actividad reciente — Marzo 2026
          </p>
        </div>
        <button
          style={{ backgroundColor: 'var(--color-admin-accent)', color: 'var(--color-text-on-accent)' }}
          className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-colors shadow-sm whitespace-nowrap"
        >
          {Icon.plus}
          <span className="hidden xs:inline sm:inline">Nueva Transacción</span>
          <span className="xs:hidden sm:hidden">Nueva</span>
        </button>
      </div>

      {/* ── Stat cards — 2 cols on mobile, 4 on sm+ ── */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          label="Balance Total"
          value="$124,500"
          change="+4.6%"
          changePositive
          icon={Icon.balance}
          iconBg="bg-emerald-50"
        />
        <StatCard
          label="Ingresos"
          value="$28,400"
          change="+9%"
          changePositive
          icon={Icon.income}
          iconBg="bg-blue-50"
        />
        <StatCard
          label="Gastos"
          value="$12,150"
          change="-1.9%"
          changePositive={false}
          icon={Icon.expense}
          iconBg="bg-rose-50"
        />
        <StatCard
          label="Ahorro Neto"
          value="$16,250"
          change="+81%"
          changePositive
          icon={Icon.savings}
          iconBg="bg-violet-50"
        />
      </div>

      {/* ── Main content: chart + table (left) · sidebar (right) ── */}
      <div className="flex flex-col lg:flex-row gap-4">

        {/* Left: Cash Flow chart + Recent Transactions */}
        <div className="flex-1 min-w-0 flex flex-col gap-4">
          <CashFlowChart />
          <RecentTransactionsTable />
        </div>

        {/* Right sidebar: Quick Actions + Net Profit */}
        <div className="flex flex-col gap-4 w-full lg:w-[220px] xl:w-[240px] flex-shrink-0">

          {/* Quick Actions */}
          <div className="bg-white rounded-2xl p-4 border border-gray-100 flex flex-col gap-2">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">Acciones Rápidas</h3>
            <QuickActionButton label="Registrar Ingreso" icon={Icon.plus} variant="primary" />
            <QuickActionButton label="Registrar Gasto" icon={Icon.minus} variant="danger" />
          </div>

          {/* Net Profit */}
          <NetProfitCard
            value="$16,250"
            change="+81%"
            changePositive
            incomePercent={81}
            expensePercent={63}
          />
        </div>
      </div>
    </div>
  )
}

export default CmsDashboard
