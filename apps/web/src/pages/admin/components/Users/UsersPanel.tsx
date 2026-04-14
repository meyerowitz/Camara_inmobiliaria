import React, { useState, useEffect, useMemo } from 'react'
import { UserPlus, RefreshCw, Shield, User, ToggleLeft, ToggleRight, KeyRound, Loader2, Search } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { API_URL } from '@/config/env'

interface SystemUser {
  id: number
  email: string
  rol: 'admin' | 'afiliado'
  activo: number
  creado_en: string
  id_agremiado: number | null
  nombre_completo: string | null
  codigo_cibir: string | null
}

interface CreateForm {
  email: string
  password: string
  rol: 'admin' | 'afiliado'
  id_agremiado: string
}

const EMPTY_FORM: CreateForm = { email: '', password: '', rol: 'afiliado', id_agremiado: '' }

type FiltroRol    = 'todos' | 'admin' | 'afiliado'
type FiltroActivo = 'todos' | 'activo' | 'inactivo'

export default function UsersPanel() {
  const { token } = useAuth()
  const [users, setUsers]       = useState<SystemUser[]>([])
  const [loading, setLoading]   = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm]         = useState<CreateForm>(EMPTY_FORM)
  const [saving, setSaving]     = useState(false)
  const [feedback, setFeedback] = useState<{ type: 'ok' | 'err'; msg: string } | null>(null)
  const [resetMsg, setResetMsg] = useState<Record<number, string>>({})

  // ── Filtros ────────────────────────────────────────────────────────────────
  const [search, setSearch]             = useState('')
  const [filtroRol, setFiltroRol]       = useState<FiltroRol>('todos')
  const [filtroActivo, setFiltroActivo] = useState<FiltroActivo>('todos')

  const authHeaders = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }

  const load = async () => {
    setLoading(true)
    try {
      const r = await fetch(`${API_URL}/api/users`, { headers: authHeaders })
      const d = await r.json()
      if (d.success) setUsers(d.data)
    } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  // ── Filtrado local ─────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return users.filter(u => {
      if (filtroRol !== 'todos' && u.rol !== filtroRol) return false
      if (filtroActivo === 'activo'   && !u.activo)   return false
      if (filtroActivo === 'inactivo' &&  u.activo)   return false
      if (q) {
        const hayMatch =
          u.email.toLowerCase().includes(q) ||
          (u.nombre_completo?.toLowerCase().includes(q) ?? false) ||
          (u.codigo_cibir?.toLowerCase().includes(q) ?? false)
        if (!hayMatch) return false
      }
      return true
    })
  }, [users, search, filtroRol, filtroActivo])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setFeedback(null)
    try {
      const r = await fetch(`${API_URL}/api/users`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({
          email:        form.email,
          password:     form.password,
          rol:          form.rol,
          id_agremiado: form.id_agremiado ? Number(form.id_agremiado) : null,
        }),
      })
      const d = await r.json()
      if (d.success) {
        setFeedback({ type: 'ok', msg: 'Usuario creado correctamente' })
        setForm(EMPTY_FORM)
        setShowForm(false)
        load()
      } else {
        setFeedback({ type: 'err', msg: d.message })
      }
    } finally { setSaving(false) }
  }

  const toggleActive = async (u: SystemUser) => {
    await fetch(`${API_URL}/api/users/${u.id}`, {
      method: 'PATCH',
      headers: authHeaders,
      body: JSON.stringify({ activo: !u.activo }),
    })
    load()
  }

  const handleReset = async (u: SystemUser) => {
    const r = await fetch(`${API_URL}/api/users/${u.id}/reset`, {
      method: 'POST', headers: authHeaders,
    })
    const d = await r.json()
    if (d.success) {
      setResetMsg(prev => ({ ...prev, [u.id]: 'Correo de restablecimiento enviado' }))
    } else {
      setResetMsg(prev => ({ ...prev, [u.id]: d.message || 'Error al restablecer' }))
    }
  }

  const filterBtnCls = (active: boolean) =>
    `px-3 py-1.5 rounded-full text-[11px] font-bold transition-colors border ${
      active
        ? 'bg-slate-800 border-slate-800 text-white'
        : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
    }`

  return (
    <div className='p-6 max-w-5xl mx-auto space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-2xl font-black text-slate-800'>Gestión de Usuarios</h1>
          <p className='text-sm text-slate-400 mt-1'>Administra las cuentas de acceso al sistema</p>
        </div>
        <div className='flex gap-3'>
          <button
            onClick={load}
            className='flex items-center gap-2 px-4 py-2 text-slate-500 border border-slate-200 rounded-xl text-sm hover:bg-slate-50 transition'
          >
            <RefreshCw size={15} /> Actualizar
          </button>
          <button
            onClick={() => { setShowForm(!showForm); setFeedback(null) }}
            className='flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-xl text-sm font-bold hover:bg-emerald-600 transition'
          >
            <UserPlus size={15} /> Nuevo usuario
          </button>
        </div>
      </div>

      {/* Feedback */}
      {feedback && (
        <div className={`px-4 py-3 rounded-xl text-sm font-medium ${feedback.type === 'ok' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'}`}>
          {feedback.msg}
        </div>
      )}

      {/* Create form */}
      {showForm && (
        <form
          onSubmit={handleCreate}
          className='bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-4'
        >
          <h2 className='text-sm font-bold text-slate-600 uppercase tracking-widest'>Nuevo Usuario</h2>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div>
              <label className='block text-xs font-semibold text-slate-500 mb-1'>Email</label>
              <input
                type='email' required
                value={form.email}
                onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                className='w-full border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-emerald-400'
                placeholder='correo@ejemplo.com'
              />
            </div>
            <div>
              <label className='block text-xs font-semibold text-slate-500 mb-1'>Contraseña inicial</label>
              <input
                type='text' required
                value={form.password}
                onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                className='w-full border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-emerald-400'
                placeholder='Mínimo 8 caracteres'
              />
            </div>
            <div>
              <label className='block text-xs font-semibold text-slate-500 mb-1'>Rol</label>
              <select
                value={form.rol}
                onChange={e => setForm(p => ({ ...p, rol: e.target.value as 'admin' | 'afiliado' }))}
                className='w-full border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-emerald-400'
              >
                <option value='afiliado'>Afiliado</option>
                <option value='admin'>Administrador</option>
              </select>
            </div>
            <div>
              <label className='block text-xs font-semibold text-slate-500 mb-1'>ID Agremiado (opcional)</label>
              <input
                type='number'
                value={form.id_agremiado}
                onChange={e => setForm(p => ({ ...p, id_agremiado: e.target.value }))}
                className='w-full border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-emerald-400'
                placeholder='Dejar vacío si no aplica'
              />
            </div>
          </div>
          <div className='flex justify-end gap-3 pt-2'>
            <button type='button' onClick={() => setShowForm(false)} className='px-5 py-2 text-sm text-slate-500 hover:text-slate-700'>
              Cancelar
            </button>
            <button
              type='submit' disabled={saving}
              className='px-6 py-2 bg-emerald-500 text-white rounded-xl text-sm font-bold hover:bg-emerald-600 disabled:opacity-50'
            >
              {saving ? <Loader2 size={15} className='animate-spin inline' /> : 'Crear usuario'}
            </button>
          </div>
        </form>
      )}

      {/* ── Filtros ──────────────────────────────────────────────────────────── */}
      <div className='bg-white border border-slate-100 rounded-2xl px-4 py-3 shadow-sm flex flex-wrap items-center gap-3'>
        {/* Búsqueda */}
        <div className='relative flex-1 min-w-[180px]'>
          <Search size={14} className='absolute left-3 top-1/2 -translate-y-1/2 text-slate-400' />
          <input
            type='text'
            placeholder='Buscar por email o agremiado...'
            value={search}
            onChange={e => setSearch(e.target.value)}
            className='w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-slate-50 text-slate-700 placeholder-slate-400 focus:outline-none focus:border-emerald-400 focus:bg-white transition-colors'
          />
        </div>

        {/* Filtro Rol */}
        <div className='flex items-center gap-1.5'>
          <span className='text-[10px] font-bold text-slate-400 uppercase tracking-wide mr-1'>Rol</span>
          {(['todos', 'admin', 'afiliado'] as FiltroRol[]).map(r => (
            <button key={r} onClick={() => setFiltroRol(r)} className={filterBtnCls(filtroRol === r)}>
              {r === 'todos' ? 'Todos' : r === 'admin' ? '🛡 Admin' : '👤 Afiliado'}
            </button>
          ))}
        </div>

        {/* Filtro Estado */}
        <div className='flex items-center gap-1.5'>
          <span className='text-[10px] font-bold text-slate-400 uppercase tracking-wide mr-1'>Estado</span>
          {(['todos', 'activo', 'inactivo'] as FiltroActivo[]).map(s => (
            <button key={s} onClick={() => setFiltroActivo(s)} className={filterBtnCls(filtroActivo === s)}>
              {s === 'todos' ? 'Todos' : s === 'activo' ? '✓ Activo' : '✗ Inactivo'}
            </button>
          ))}
        </div>

        {/* Contador */}
        <span className='ml-auto text-[11px] text-slate-400 font-medium whitespace-nowrap'>
          {filtered.length} de {users.length} usuario{users.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Table */}
      <div className='bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden'>
        {loading ? (
          <div className='flex justify-center py-16'>
            <Loader2 size={24} className='animate-spin text-emerald-500' />
          </div>
        ) : filtered.length === 0 ? (
          <p className='text-center py-16 text-slate-400 text-sm'>
            {users.length === 0 ? 'No hay usuarios registrados aún.' : 'Ningún usuario coincide con los filtros.'}
          </p>
        ) : (
          <table className='w-full text-sm'>
            <thead className='bg-slate-50 border-b border-slate-100'>
              <tr>
                {['Usuario', 'Rol', 'Agremiado', 'Estado', 'Acciones'].map(h => (
                  <th key={h} className={`px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider ${h === 'Acciones' ? 'text-right' : 'text-left'}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className='divide-y divide-slate-50'>
              {filtered.map(u => (
                <tr key={u.id} className='hover:bg-slate-50 transition'>
                  <td className='px-5 py-4'>
                    <p className='font-semibold text-slate-700'>{u.email}</p>
                    <p className='text-xs text-slate-400 mt-0.5'>
                      {new Date(u.creado_en).toLocaleDateString('es-VE')}
                    </p>
                    {resetMsg[u.id] && (
                      <p className={`text-xs font-bold mt-1 px-2 py-1 rounded-lg ${resetMsg[u.id].includes('Error') ? 'text-red-600 bg-red-50' : 'text-emerald-700 bg-emerald-50' }`}>
                        {resetMsg[u.id]}
                      </p>
                    )}
                  </td>
                  <td className='px-5 py-4'>
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                      u.rol === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-emerald-100 text-emerald-700'
                    }`}>
                      {u.rol === 'admin' ? <Shield size={11} /> : <User size={11} />}
                      {u.rol === 'admin' ? 'Admin' : 'Afiliado'}
                    </span>
                  </td>
                  <td className='px-5 py-4'>
                    {u.nombre_completo
                      ? <div>
                          <p className='text-slate-700 font-medium text-xs'>{u.nombre_completo}</p>
                          {u.codigo_cibir && <p className='text-slate-400 text-xs'>{u.codigo_cibir}</p>}
                        </div>
                      : <span className='text-slate-300 text-xs italic'>No vinculado</span>
                    }
                  </td>
                  <td className='px-5 py-4'>
                    <button onClick={() => toggleActive(u)} className='flex items-center gap-1.5'>
                      {u.activo
                        ? <ToggleRight size={22} className='text-emerald-500' />
                        : <ToggleLeft  size={22} className='text-slate-300' />
                      }
                      <span className={`text-xs font-medium ${u.activo ? 'text-emerald-600' : 'text-slate-400'}`}>
                        {u.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </button>
                  </td>
                  <td className='px-5 py-4 text-right'>
                    <button
                      onClick={() => handleReset(u)}
                      className='inline-flex items-center gap-1 px-3 py-1.5 border border-slate-200 text-slate-500 rounded-lg text-xs hover:bg-slate-100 transition'
                    >
                      <KeyRound size={12} /> Reset
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
