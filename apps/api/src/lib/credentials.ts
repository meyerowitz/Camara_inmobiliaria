import bcrypt from 'bcryptjs'
import { db } from './db.js'

/**
 * Genera credenciales de acceso para un afiliado recién aprobado.
 * Crea una fila en `users` con rol='afiliado' y devuelve la contraseña
 * en texto plano.
 *
 * @param idAgremiado - ID del agremiado al que se le asignan las credenciales
 * @param email       - Email del agremiado (será su usuario de acceso)
 * @returns           - Contraseña generada en texto plano (uso temporal)
 */
export async function generarCredenciales(
  idAgremiado: number,
  email: string
): Promise<string> {
  // Contraseña genérica: CIEBO- + 6 últimos dígitos del timestamp
  const rawPassword = `CIEBO-${Date.now().toString().slice(-6)}`
  const passwordHash = await bcrypt.hash(rawPassword, 10)

  await db.execute({
    sql: `INSERT OR IGNORE INTO users (email, password_hash, rol, id_agremiado)
          VALUES (?, ?, 'afiliado', ?)`,
    args: [email, passwordHash, idAgremiado],
  })

  return rawPassword
}

/**
 * Regenera las credenciales de un usuario existente (reset de contraseña).
 * Devuelve la nueva contraseña en texto plano.
 */
export async function resetCredenciales(userId: number): Promise<string> {
  const rawPassword = `CIEBO-${Date.now().toString().slice(-6)}`
  const passwordHash = await bcrypt.hash(rawPassword, 10)

  await db.execute({
    sql: `UPDATE users SET password_hash = ? WHERE id = ?`,
    args: [passwordHash, userId],
  })

  return rawPassword
}
