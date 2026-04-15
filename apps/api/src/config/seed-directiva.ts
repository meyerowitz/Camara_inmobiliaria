/**
 * seed-directiva.ts — Siembra miembros de junta directiva históricos.
 *
 * Uso (desde apps/api):
 *   pnpm exec tsx src/config/seed-directiva.ts
 *
 * Comportamiento:
 * - No elimina la tabla ni desactiva el CMS dinámico.
 * - Inserta miembros faltantes.
 * - Si ya existe mismo nombre + cargo, actualiza foto/orden/activo.
 */

import { db } from '../lib/db.js'

type DirectivaSeed = {
  nombre: string
  cargo: string
  foto_url: string
  orden: number
  activo: number
}

const directivaHistorica: DirectivaSeed[] = [
  { nombre: 'Francisco Piñango', cargo: 'Presidente', foto_url: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=400&h=400', orden: 1, activo: 1 },
  { nombre: 'Zulay Amaya', cargo: 'Vice-Presidente', foto_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400&h=400', orden: 2, activo: 1 },
  { nombre: 'Margaret Vásquez', cargo: 'Directora General', foto_url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=400&h=400', orden: 3, activo: 1 },
  { nombre: 'Romelina Rodríguez', cargo: 'Directora de Finanzas', foto_url: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=400&h=400', orden: 4, activo: 1 },
  { nombre: 'Margot Castro', cargo: 'Directora de Asuntos Legales', foto_url: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&q=80&w=400&h=400', orden: 5, activo: 1 },
  { nombre: 'Pedro Vallenilla', cargo: 'Director de Comunicaciones', foto_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=400&h=400', orden: 6, activo: 1 },
  { nombre: 'Graciela Ledezma', cargo: 'Director de Formación', foto_url: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&q=80&w=400&h=400', orden: 7, activo: 1 },
  { nombre: 'Yorjharry Vicent', cargo: 'Director de Eventos', foto_url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=400&h=400', orden: 8, activo: 1 },
  { nombre: 'Rina Centeno', cargo: 'Directora de Responsabilidad Social', foto_url: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=400&h=400', orden: 9, activo: 1 },
  { nombre: 'Pedro Castro', cargo: 'Director de Relaciones Interinstitucionales', foto_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400&h=400', orden: 10, activo: 1 },
]

async function seedDirectiva() {
  console.log('Sembrando junta directiva historica...\n')

  let inserted = 0
  let updated = 0

  for (const miembro of directivaHistorica) {
    const existing = await db.execute({
      sql: `SELECT id FROM cms_directiva WHERE nombre = ? AND cargo = ? LIMIT 1`,
      args: [miembro.nombre, miembro.cargo],
    })

    if (existing.rows.length > 0) {
      const id = existing.rows[0].id
      await db.execute({
        sql: `UPDATE cms_directiva
              SET foto_url = ?, orden = ?, activo = ?
              WHERE id = ?`,
        args: [miembro.foto_url, miembro.orden, miembro.activo, id as number],
      })
      updated++
      continue
    }

    await db.execute({
      sql: `INSERT INTO cms_directiva (nombre, cargo, foto_url, orden, activo)
            VALUES (?, ?, ?, ?, ?)`,
      args: [miembro.nombre, miembro.cargo, miembro.foto_url, miembro.orden, miembro.activo],
    })
    inserted++
  }

  console.log(`OK. Insertados: ${inserted}, actualizados: ${updated}`)
}

seedDirectiva().catch((error) => {
  console.error('Error en seed de directiva:', error)
  process.exit(1)
})

