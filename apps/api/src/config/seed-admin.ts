/**
 * seed-admin.ts — Crea el primer usuario administrador del sistema.
 * Ejecutar UNA SOLA VEZ con: npx tsx src/config/seed-admin.ts (desde apps/api)
 *
 * Cambia el email y la contraseña antes de ejecutar en producción.
 */

import bcrypt from 'bcryptjs'
import { db } from '../lib/db.js'

async function seedAdmin() {
  console.log('Creando usuario administrador...\n')

  const email    = 'admin@admin.com'
  const password = 'admin'  // ⚠️ CAMBIAR EN PRODUCCIÓN

  const passwordHash = await bcrypt.hash(password, 10)

  try {
    // Borrar usuario admin existente por email o id (limpieza para re-siembra)
    await db.execute({
      sql: `DELETE FROM users WHERE email = ?`,
      args: [email]
    })

    // Insertar super admin
    await db.execute({
      sql: `
        INSERT INTO users (email, password_hash, rol, roles, activo) 
        VALUES (?, ?, ?, ?, ?)
      `,
      args: [email, passwordHash, 'super_admin', '["super_admin"]', 1]
    })
    console.log(`✓ Super Administrador creado: ${email}`)
    console.log(`  Contraseña inicial:   ${password}`)
    console.log('\n⚠️  CAMBIA LA CONTRASEÑA EN EL PRIMER INICIO DE SESIÓN\n')
  } catch (err) {
    console.error('Error creando administrador:', err)
    process.exit(1)
  }
}

seedAdmin()
