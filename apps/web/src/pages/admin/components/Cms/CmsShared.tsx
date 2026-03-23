import React from 'react'

export const API = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3000'

export const api = {
  get: (path: string) => fetch(`${API}${path}`).then(r => r.json()),
  post: (path: string, body: any) => fetch(`${API}${path}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }).then(r => r.json()),
  put: (path: string, body: any) => fetch(`${API}${path}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }).then(r => r.json()),
  delete: (path: string) => fetch(`${API}${path}`, { method: 'DELETE' }).then(r => r.json()),
}

export const FormField = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="flex flex-col gap-1">
    <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">{label}</label>
    {children}
  </div>
)

export const Input = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input
    {...props}
    className="text-sm rounded-xl border border-gray-200 px-3 py-2 text-slate-700 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-[#00D084]/40 focus:border-[#00D084] transition-all"
  />
)

export const Textarea = (props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => (
  <textarea
    {...props}
    rows={3}
    className="text-sm rounded-xl border border-gray-200 px-3 py-2 text-slate-700 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-[#00D084]/40 focus:border-[#00D084] transition-all resize-none"
  />
)

export const BtnPrimary = ({ onClick, children, disabled }: any) => (
  <button onClick={onClick} disabled={disabled} className="px-4 py-2 rounded-xl bg-[#00D084] text-white text-xs font-semibold hover:bg-[#00B870] transition-colors disabled:opacity-50">
    {children}
  </button>
)

export const BtnDanger = ({ onClick, children }: any) => (
  <button onClick={onClick} className="px-3 py-1.5 rounded-xl bg-red-50 text-red-500 text-xs font-semibold hover:bg-red-100 transition-colors">
    {children}
  </button>
)

export const BtnSecondary = ({ onClick, children }: any) => (
  <button onClick={onClick} className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-600 text-xs font-semibold hover:bg-slate-200 transition-colors">
    {children}
  </button>
)

export const Loading = () => (
  <div className="flex items-center justify-center h-32 text-xs text-slate-400 font-semibold uppercase tracking-widest">Cargando...</div>
)

export function ListDetail<T extends { id?: any }>({
  items,
  loading,
  renderRow,
  renderDetail,
  renderForm,
  onNew,
  selectedId,
  setSelectedId,
}: {
  items: T[]
  loading: boolean
  renderRow: (item: T, selected: boolean) => React.ReactNode
  renderDetail: (item: T) => React.ReactNode
  renderForm: () => React.ReactNode
  onNew: () => void
  selectedId: any
  setSelectedId: (id: any) => void
}) {
  const selected = items.find(i => String(i.id) === String(selectedId)) ?? null

  return (
    <div className="flex h-full overflow-hidden">
      {/* List */}
      <div className={['flex flex-col bg-white border-r border-gray-100 overflow-hidden flex-shrink-0 w-full sm:w-[280px] md:w-[320px]', selected ? 'hidden sm:flex' : 'flex'].join(' ')}>
        <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
          {loading ? <Loading /> : items.map(item => (
            <button key={item.id} onClick={() => setSelectedId(item.id)} className={['w-full text-left px-4 py-3 transition-colors', String(selectedId) === String(item.id) ? 'bg-[#E9FAF4]' : 'hover:bg-slate-50'].join(' ')}>
              {renderRow(item, String(selectedId) === String(item.id))}
            </button>
          ))}
          {!loading && items.length === 0 && (
            <p className="text-xs text-slate-400 text-center py-10">Sin registros</p>
          )}
        </div>
        <div className="p-4 border-t border-gray-100">
          <button onClick={onNew} className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#00D084] text-white text-sm font-semibold hover:bg-[#00B870] transition-colors">
            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
            Nuevo
          </button>
        </div>
      </div>

      {/* Detail */}
      <div className={['flex-1 min-w-0 bg-gray-50 overflow-y-auto', selected || selectedId === 'new' ? 'flex flex-col' : 'hidden sm:flex sm:flex-col'].join(' ')}>
        {selectedId === 'new' || selected ? (
          <div className="p-5">
            {selectedId === 'new' ? renderForm() : selected && renderDetail(selected)}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-slate-300">
            <svg viewBox="0 0 24 24" className="w-12 h-12" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            <p className="text-sm font-medium">Selecciona un elemento</p>
          </div>
        )}
      </div>
    </div>
  )
}
