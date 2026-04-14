import React, { useState } from 'react'
import { createPortal } from 'react-dom'
import { useAuth } from '@/context/AuthContext'
import ForgotPasswordModal from '@/pages/landing/components/ForgotPasswordModal'

export default function LoginModal({ onClose }: { onClose: () => void }) {
  const { login } = useAuth()
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)
  const [showForgot, setShowForgot] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
      onClose()          // cerrar modal tras login exitoso
    } catch (err: any) {
      setError(err.message || 'Credenciales incorrectas')
    } finally {
      setLoading(false)
    }
  }

  const modalContent = (
    <div className='fixed inset-0 z-[100] flex items-center justify-center p-4'>
      <div
        className='absolute inset-0 bg-black/60 backdrop-blur-sm'
        onClick={onClose}
      />
      <div className='relative bg-white w-full max-w-md p-10 rounded-[2.5rem] shadow-2xl text-center'>
        {/* Botón cerrar */}
        <button
          onClick={onClose}
          className='absolute top-6 right-6 text-gray-400 hover:text-emerald-600 transition'
          type='button'
        >
          <svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M6 18L18 6M6 6l12 12' />
          </svg>
        </button>

        <h2 className='text-gray-600 text-lg mb-10 leading-snug'>
          Ingresa tus datos aquí.
        </h2>

        <form className='space-y-6' onSubmit={handleSubmit}>
          {/* Email */}
          <div className='text-left'>
            <div className='relative'>
              <input
                id='login-email'
                type='email'
                placeholder='Correo:'
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className='w-full px-6 py-4 border border-gray-400 rounded-full text-gray-700 focus:outline-none focus:border-emerald-500 transition-colors'
              />
            </div>
          </div>

          {/* Contraseña */}
          <div className='text-left'>
            <div className='relative'>
              <input
                id='login-password'
                type='password'
                placeholder='Contraseña:'
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                className='w-full px-6 py-4 border border-gray-400 rounded-full text-gray-700 focus:outline-none focus:border-emerald-500 transition-colors'
              />
            </div>
          </div>

          {/* Mensaje de error */}
          {error && (
            <p className='text-red-500 text-sm font-medium bg-red-50 px-4 py-2 rounded-xl'>
              {error}
            </p>
          )}

          <div className='pt-2'>
            <button
              type='button'
              onClick={() => setShowForgot(true)}
              className='text-blue-700 hover:underline text-sm font-medium'
            >
              Olvidé mi contraseña
            </button>
          </div>

          <div className='pt-6'>
            <button
               type='submit'
               disabled={loading}
               className='px-10 py-3 border-2 border-emerald-400 text-emerald-500 rounded-full font-bold hover:bg-emerald-500 hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed'
            >
              {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )

  return (
    <>
      {createPortal(modalContent, document.body)}
      {showForgot && (
        <ForgotPasswordModal onClose={() => setShowForgot(false)} />
      )}
    </>
  )
}
