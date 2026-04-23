import { Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { db } from '../lib/db.js'
import { env } from '../config/env.js'
import type { JwtPayload, UserRole } from '../middlewares/auth.middleware.js'

/**
 * Parsea el campo `roles` de la DB (puede venir como JSON string o como string simple).
 */
function parseRoles(rolesField: unknown, rolFallback: unknown): UserRole[] {
  if (typeof rolesField === 'string' && rolesField.startsWith('[')) {
    try {
      return JSON.parse(rolesField) as UserRole[]
    } catch {
      // fall through
    }
  }
  if (typeof rolesField === 'string' && rolesField.length > 0) {
    return [rolesField as UserRole]
  }
  if (typeof rolFallback === 'string' && rolFallback.length > 0) {
    return [rolFallback as UserRole]
  }
  return ['afiliado']
}

/**
 * POST /api/auth/login
 * Autentica al usuario con email + contraseña.
 * Devuelve un JWT con array de roles.
 */
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      res.status(400).json({ success: false, message: 'Email y contraseña son requeridos' })
      return
    }

    // Buscar usuario por email (incluyendo campo roles)
    const result = await db.execute({
      sql: `SELECT id, email, password_hash, rol, roles, id_agremiado, activo FROM users WHERE email = ?`,
      args: [email],
    })

    const user = result.rows[0]

    if (!user) {
      res.status(401).json({ success: false, message: 'Credenciales incorrectas' })
      return
    }

    if (!user.activo) {
      res.status(403).json({ success: false, message: 'Cuenta desactivada. Contacta al administrador.' })
      return
    }

    // Verificar contraseña
    const passwordMatch = await bcrypt.compare(password, user.password_hash as string)
    if (!passwordMatch) {
      res.status(401).json({ success: false, message: 'Credenciales incorrectas' })
      return
    }

    const roles = parseRoles(user.roles, user.rol)

    // El rol primario (para retrocompatibilidad) es el "más alto" en jerarquía
    const rolPrimary: UserRole = roles.includes('super_admin')
      ? 'super_admin'
      : roles.includes('admin')
        ? 'admin'
        : 'afiliado'

    // Generar JWT
    const payload: JwtPayload = {
      id: user.id as number,
      email: user.email as string,
      rol: rolPrimary,
      roles,
      id_agremiado: user.id_agremiado as number | null,
    }

    const token = jwt.sign(payload, env.JWT_SECRET, {
      expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'],
    })

    res.status(200).json({
      success: true,
      token,
      user: payload,
    })
  } catch (error) {
    console.error('Error en login:', error)
    res.status(500).json({ success: false, message: 'Error interno del servidor' })
  }
}

/**
 * GET /api/auth/me
 * Devuelve los datos del usuario autenticado (requiere JWT válido).
 */
export const getMe = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.user!

    const result = await db.execute({
      sql: `
        SELECT 
          u.id, u.email, u.rol, u.roles, u.id_agremiado, u.activo, u.creado_en,
          e.nombre_completo, e.cedula_rif, e.telefono, e.nivel_profesional, e.es_corredor_inmobiliario, e.tipo as estudiante_tipo
        FROM users u
        LEFT JOIN estudiantes e ON e.email = u.email
        WHERE u.id = ?
      `,
      args: [id],
    })

    const user = result.rows[0] as any
    if (!user) {
      res.status(404).json({ success: false, message: 'Usuario no encontrado' })
      return
    }

    const roles = parseRoles(user.roles, user.rol)
    res.status(200).json({ success: true, user: { ...user, roles } })
  } catch (error) {
    console.error('Error en getMe:', error)
    res.status(500).json({ success: false, message: 'Error interno del servidor' })
  }
}

/**
 * POST /api/auth/forgot-password
 * Recibe el email, genera un token y envía correo para restablecer contraseña.
 */
export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body

    if (!email) {
      res.status(400).json({ success: false, message: 'El email es requerido' })
      return
    }

    const result = await db.execute({
      sql: `SELECT id, email FROM users WHERE email = ? AND activo = 1`,
      args: [email.trim().toLowerCase()],
    })

    const successMsg = 'Si el correo existe en nuestro sistema, te enviaremos un enlace para restablecer tu contraseña.'

    if (result.rows.length === 0) {
      // Por seguridad, no revela si el usuario existe o no
      res.status(200).json({ success: true, message: successMsg })
      return
    }

    const user = result.rows[0] as any
    // Generar token
    const { randomBytes } = await import('crypto')
    const token = randomBytes(32).toString('hex')
    // Expira en 1 hora
    const expira = new Date(Date.now() + 60 * 60 * 1000).toISOString()

    await db.execute({
      sql: `UPDATE users SET reset_token = ?, reset_token_expira = ? WHERE id = ?`,
      args: [token, expira, user.id],
    })

    const { enviarCorreoOlvideContrasena } = await import('../lib/email.js')
    try {
      await enviarCorreoOlvideContrasena(user.email, token)
    } catch (err) {
      console.error('Error enviando correo de forgotPassword:', err)
      // Aun así respondemos 200 para no dar pistas
    }

    res.status(200).json({ success: true, message: successMsg })
  } catch (error) {
    console.error('Error en forgotPassword:', error)
    res.status(500).json({ success: false, message: 'Error interno del servidor' })
  }
}

/**
 * POST /api/auth/reset-password
 * Valida el token y establece la nueva contraseña (flujo olvidé mi contraseña/reset admin).
 * Body: { token, password }
 */
export const resetPasswordWithToken = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token, password } = req.body

    if (!token || !password) {
      res.status(400).json({ success: false, message: 'Token y contraseña son requeridos' })
      return
    }
    if (password.length < 8) {
      res.status(400).json({ success: false, message: 'La contraseña debe tener al menos 8 caracteres' })
      return
    }

    // SQLite/Turso datetime logic handled softly by node.js date comparison
    // we fetch expira and parse to Date
    const result = await db.execute({
      sql: `SELECT id, email, reset_token_expira FROM users WHERE reset_token = ?`,
      args: [token],
    })

    if (result.rows.length === 0) {
      res.status(404).json({ success: false, message: 'El enlace no es válido o ya fue utilizado.' })
      return
    }

    const user = result.rows[0] as any
    if (new Date(user.reset_token_expira) < new Date()) {
      res.status(400).json({ success: false, message: 'El enlace ha expirado. Solicita un nuevo enlace.' })
      return
    }

    const passwordHash = await bcrypt.hash(password, 10)

    await db.execute({
      sql: `UPDATE users SET password_hash = ?, reset_token = NULL, reset_token_expira = NULL, activo = 1 WHERE id = ?`,
      args: [passwordHash, user.id],
    })

    res.status(200).json({
      success: true,
      message: 'Contraseña actualizada correctamente. Ya puedes iniciar sesión.',
      email: user.email
    })
  } catch (error) {
    console.error('Error en resetPasswordWithToken:', error)
    res.status(500).json({ success: false, message: 'Error interno del servidor' })
  }
}


/**
 * POST /api/auth/setup-initial-password
 * Valida el token de configuración inicial y establece la contraseña definitiva.
 */
export const setupInitialPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token, password } = req.body

    if (!token || !password) {
      res.status(400).json({ success: false, message: 'Token y contraseña son requeridos' })
      return
    }

    if (password.length < 8) {
      res.status(400).json({ success: false, message: 'La contraseña debe tener al menos 8 caracteres' })
      return
    }

    // Buscar usuario con ese token y que no haya expirado
    const result = await db.execute({
      sql: `SELECT id FROM users 
            WHERE reset_token = ? 
            AND reset_token_expira > datetime('now', 'localtime')`,
      args: [token],
    })

    // Nota: datetime('now', 'localtime') en SQLite depende de la zona horaria del servidor. 
    // Usamos strftime('%Y-%m-%dT%H:%M:%SZ','now') o similar para consistencia ISO.
    // Dado que guardamos en ISO en el controller de afiliados, comparemos strings:

    const resultFix = await db.execute({
      sql: `SELECT id, email FROM users WHERE reset_token = ?`,
      args: [token],
    })

    const user = resultFix.rows[0]
    if (!user) {
      res.status(404).json({ success: false, message: 'Token inválido o no encontrado' })
      return
    }

    // Verificar expiración (ISO compare)
    const { id, email } = user as any
    const userWithExp = await db.execute({
      sql: `SELECT reset_token_expira FROM users WHERE id = ?`,
      args: [id]
    })
    const exp = userWithExp.rows[0].reset_token_expira as string
    if (new Date(exp) < new Date()) {
      res.status(400).json({ success: false, message: 'El enlace ha expirado. Contacta al administrador.' })
      return
    }

    const passwordHash = await bcrypt.hash(password, 10)

    // Actualizar contraseña y limpiar token
    await db.execute({
      sql: `UPDATE users 
            SET password_hash = ?, reset_token = NULL, reset_token_expira = NULL, activo = 1
            WHERE id = ?`,
      args: [passwordHash, id],
    })

    res.status(200).json({
      success: true,
      message: 'Contraseña establecida exitosamente. Ya puedes iniciar sesión.',
      email
    })
  } catch (error) {
    console.error('Error en setupInitialPassword:', error)
    res.status(500).json({ success: false, message: 'Error interno del servidor' })
  }
}

/**
 * POST /api/auth/logout
 * No-op — el cliente elimina el token de localStorage.
 */
export const logout = (_req: Request, res: Response): void => {
  res.status(200).json({ success: true, message: 'Sesión cerrada' })
}
