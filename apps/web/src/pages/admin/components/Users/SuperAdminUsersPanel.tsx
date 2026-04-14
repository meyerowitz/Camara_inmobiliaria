import React, { useState, useEffect } from 'react'
import { API_URL } from '@/config/env'
import { useAuth } from '@/context/AuthContext'

interface UserAdmin {
  id: number
  email: string
  rol: string
  activo: number
  creado_en: string
}

const SuperAdminUsersPanel = () => {
  const { token, user } = useAuth()
  const [users, setUsers] = useState<UserAdmin[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [newEmail, setNewEmail] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [newRol, setNewRol] = useState('admin')

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const res = await fetch(`${API_URL}/api/users`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      if (data.success) {
        // Filramos para mostrar solo admin y super_admin
        setUsers(data.data.filter((u: UserAdmin) => ['admin', 'super_admin'].includes(u.rol)))
      }
    } catch (err) {
      setError('Error al obtener administradores')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de eliminar a este administrador? Esta acción es irreversible.')) return

    try {
      const res = await fetch(`${API_URL}/api/users/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      if (data.success) {
        setUsers(users.filter(u => u.id !== id))
      } else {
        alert(data.message)
      }
    } catch (err) {
      alert('Error de conexión')
    }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch(`${API_URL}/api/users`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ email: newEmail, password: newPassword, rol: newRol })
      })
      const data = await res.json()
      if (data.success) {
        setIsModalOpen(false)
        setNewEmail('')
        setNewPassword('')
        fetchUsers() // Refresh list
      } else {
        alert(data.message)
      }
    } catch (err) {
      alert('Error de conexión')
    }
  }

  const toggleActive = async (userObj: UserAdmin) => {
    if (userObj.id === user?.id) {
       alert("No puedes desactivar tu propia cuenta activa en esta sesión");
       return;
    }
    try {
      const res = await fetch(`${API_URL}/api/users/${userObj.id}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ activo: userObj.activo ? 0 : 1 })
      })
      const data = await res.json()
      if (data.success) {
        setUsers(users.map(u => u.id === userObj.id ? { ...u, activo: u.activo ? 0 : 1 } : u))
      } else {
        alert(data.message)
      }
    } catch (err) {
      alert('Error al cambiar estado')
    }
  }

  if (loading) return <div className="p-8">Cargando administradores...</div>

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="flex px-8 py-5 items-center justify-between border-b border-slate-100">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-800">
            Administradores del Sistema
          </h2>
          <p className="text-sm text-slate-500 font-medium">Gestión exclusiva para super administradores</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-[#00D084] hover:bg-emerald-500 text-white px-5 py-2 rounded-xl text-sm font-bold shadow-sm transition-colors"
        >
          + Nuevo Admin
        </button>
      </div>

      <div className="flex-1 overflow-auto p-8">
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase tracking-wider">
                <th className="px-6 py-4 font-bold">Usuario</th>
                <th className="px-6 py-4 font-bold">Rol</th>
                <th className="px-6 py-4 font-bold">Estado</th>
                <th className="px-6 py-4 font-bold">Creación</th>
                <th className="px-6 py-4 font-bold text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                     <span className="font-semibold text-slate-700">{u.email}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded inline-flex text-xs font-bold leading-5 ${u.rol === 'super_admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                      {u.rol}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button 
                      onClick={() => toggleActive(u)}
                      className={`px-3 py-1 rounded-full text-xs font-bold transition-colors ${u.activo ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' : 'bg-red-100 text-red-700 hover:bg-red-200'}`}
                    >
                      {u.activo ? 'Activo' : 'Inactivo'}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-slate-500 font-medium">
                     {new Date(u.creado_en).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right space-x-3">
                     <button 
                       onClick={() => handleDelete(u.id)}
                       disabled={u.id === user?.id}
                       className="text-red-400 hover:text-red-600 font-medium disabled:opacity-30 transition-colors"
                     >
                       Eliminar
                     </button>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                   <td colSpan={5} className="text-center py-8 text-slate-500">Ningún administrador encontrado... algo anda mal.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden relative animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
               <div>
                 <h3 className="text-lg font-bold text-slate-800">Registrar Administrador</h3>
                 <p className="text-xs text-slate-500 font-medium tracking-wide">Crea una nueva credencial segura</p>
               </div>
               <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
               </button>
            </div>
            
            <form onSubmit={handleCreate} className="p-6 space-y-4">
               <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 ml-1">Correo Electrónico</label>
                  <input
                    type="email"
                    required
                    value={newEmail}
                    onChange={e => setNewEmail(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-[#00D084]/20 focus:border-[#00D084] focus:bg-white transition-all placeholder:text-slate-400 text-slate-800"
                    placeholder="ejemplo@ciebo.org.ve"
                  />
               </div>
               
               <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 ml-1">Contraseña</label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-[#00D084]/20 focus:border-[#00D084] focus:bg-white transition-all placeholder:text-slate-400 text-slate-800"
                    placeholder="Min. 6 caracteres"
                  />
               </div>

               <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 ml-1">Asignar Rol</label>
                  <select 
                     value={newRol} 
                     onChange={e => setNewRol(e.target.value)}
                     className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-[#00D084]/20 focus:border-[#00D084] focus:bg-white transition-all text-slate-800"
                  >
                     <option value="admin">Administrador Regular</option>
                     <option value="super_admin">[Peligro] Super Administrador</option>
                  </select>
               </div>

               <div className="pt-2">
                 <button type="submit" className="w-full py-3.5 bg-[#00D084] hover:bg-emerald-500 text-white rounded-xl font-bold text-sm shadow-lg shadow-emerald-500/20 transition-all hover:-translate-y-0.5">
                   Crear Credencial
                 </button>
               </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default SuperAdminUsersPanel
