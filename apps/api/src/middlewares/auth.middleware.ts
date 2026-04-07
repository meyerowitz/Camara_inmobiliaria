import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { env } from '../config/env.js'

export type UserRole = 'admin' | 'afiliado' | 'super_admin'

export interface JwtPayload {
  id: number
  email: string
  roles: UserRole[]          // ← array de roles (nuevo)
  rol: UserRole              // ← mantenemos para compatibilidad temporal
  id_agremiado: number | null
}

// Extend Express Request to include the decoded user
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload
    }
  }
}

/**
 * Middleware que verifica el JWT en el header Authorization.
 * Si es válido, inyecta `req.user` con el payload decodificado.
 */
export const requireAuth = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization

  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ success: false, message: 'Token de acceso requerido' })
    return
  }

  const token = authHeader.split(' ')[1]

  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as JwtPayload
    // Retrocompatibilidad: si el token viejo no tiene `roles`, lo generamos del `rol`
    if (!payload.roles) {
      payload.roles = [payload.rol]
    }
    req.user = payload
    next()
  } catch (err) {
    res.status(401).json({ success: false, message: 'Token inválido o expirado' })
  }
}

/**
 * Middleware de autorización por rol.
 * Usa el array `roles` del JWT.
 * super_admin siempre tiene acceso donde se requiera `admin`.
 */
export const requireRole = (...allowedRoles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'No autenticado' })
      return
    }

    const userRoles = req.user.roles ?? [req.user.rol]

    // super_admin tiene herencia sobre admin
    const effectiveAllowed = allowedRoles.includes('admin')
      ? [...allowedRoles, 'super_admin' as UserRole]
      : allowedRoles

    const hasAccess = userRoles.some(r => effectiveAllowed.includes(r))

    if (!hasAccess) {
      res.status(403).json({ success: false, message: 'Acceso denegado: permisos insuficientes' })
      return
    }
    next()
  }
}

/** Helpers de conveniencia */
export const hasRole = (user: JwtPayload, role: UserRole): boolean => {
  const roles = user.roles ?? [user.rol]
  return roles.includes(role)
}

export const isSuperAdmin = (user: JwtPayload): boolean => hasRole(user, 'super_admin')
export const isAdmin      = (user: JwtPayload): boolean => hasRole(user, 'admin') || hasRole(user, 'super_admin')
export const isAfiliado   = (user: JwtPayload): boolean => hasRole(user, 'afiliado')
