import { db } from '../lib/db.js'

async function migrateRoles() {
  console.log('Iniciando migración de rol a roles JSON...')
  try {
    // 1. Agregar nueva columna 'roles'
    console.log('Agregando columna roles...')
    try {
      await db.execute(`ALTER TABLE users ADD COLUMN roles TEXT NOT NULL DEFAULT '["afiliado"]'`)
    } catch (e: any) {
      if (!e.message.includes('duplicate column')) {
        throw e
      }
      console.log('La columna roles ya existe, continuando...')
    }

    // 2. Migrar los datos de 'rol' a 'roles'
    console.log('Migrando datos...')
    await db.execute(`UPDATE users SET roles = '["' || rol || '"]' WHERE rol IS NOT NULL AND roles = '["afiliado"]'`)

    // 3. Ya no eliminaremos la columna 'rol' para evitar problemas de compatibilidad inmediatos,
    // pero la DB y el backend comenzarán a usar 'roles'.
    // Si tienes SQLite moderno, podrías hacer: await db.execute(`ALTER TABLE users DROP COLUMN rol`)
    // De momento lo ignoraremos.

    console.log('¡Migración de roles completada con éxito!')

  } catch (error) {
    console.error('Error durante la migración:', error)
  }
}

migrateRoles()
