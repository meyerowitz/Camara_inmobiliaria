/**
 * seed-preinscripciones.ts
 * Inserta datos de prueba en la BD:
 *   - 4 estudiantes ficticios
 *   - 2 preinscripciones por cada programa (CIBIR, PADI, PEGI, PREANI)
 *   - Estatus variados: Preinscrito, Inscrito, Rechazado
 *
 * Uso:
 *   pnpm tsx src/config/seed-preinscripciones.ts
 */

import { db } from '../lib/db.js'

const now = () => new Date().toISOString()

// ── Estudiantes ficticios ──────────────────────────────────────────────────────
const ESTUDIANTES = [
  { nombre: 'Luis Martínez',    email: 'luis.martinez@test.com',    cedula: 'V-14.808.080', telefono: '+58 424 1234567' },
  { nombre: 'Zulay Amaya',      email: 'zulay.amaya@test.com',      cedula: 'V-18.384.839', telefono: '+58 414 9876543' },
  { nombre: 'Carlos Herrera',   email: 'carlos.herrera@test.com',   cedula: 'V-21.556.112', telefono: '+58 426 5551234' },
  { nombre: 'María Rodríguez',  email: 'maria.rodriguez@test.com',  cedula: 'V-16.990.321', telefono: '+58 412 3339988' },
  { nombre: 'Jorge Salcedo',    email: 'jorge.salcedo@test.com',     cedula: 'V-20.111.444', telefono: '+58 416 7774455' },
  { nombre: 'Andreina Pérez',   email: 'andreina.perez@test.com',   cedula: 'V-25.333.777', telefono: '+58 424 8882211' },
  { nombre: 'Ramón Castillo',   email: 'ramon.castillo@test.com',   cedula: 'V-12.667.999', telefono: '+58 414 1112233' },
  { nombre: 'Elena Gutiérrez',  email: 'elena.gutierrez@test.com',  cedula: 'V-19.445.888', telefono: '+58 412 6665544' },
]

// ── Preinscripciones por programa (2 por cada uno, estatus variados) ──────────
// Índice del array ESTUDIANTES (0-7) → programa → estatus
const PREINSCRIPCIONES: Array<{ estudianteIdx: number; programa: string; estatus: string }> = [
  // CIBIR
  { estudianteIdx: 0, programa: 'CIBIR', estatus: 'Preinscrito' },
  { estudianteIdx: 1, programa: 'CIBIR', estatus: 'Inscrito' },
  // PADI
  { estudianteIdx: 2, programa: 'PADI', estatus: 'Preinscrito' },
  { estudianteIdx: 3, programa: 'PADI', estatus: 'Rechazado' },
  // PEGI
  { estudianteIdx: 4, programa: 'PEGI', estatus: 'Preinscrito' },
  { estudianteIdx: 5, programa: 'PEGI', estatus: 'Inscrito' },
  // PREANI
  { estudianteIdx: 6, programa: 'PREANI', estatus: 'Preinscrito' },
  { estudianteIdx: 7, programa: 'PREANI', estatus: 'Rechazado' },
]

async function seed() {
  console.log('▶ Insertando datos de prueba de preinscripciones...\n')

  // ── 1. Insertar / actualizar estudiantes ─────────────────────────────────────
  const estudianteIds: number[] = []

  for (const est of ESTUDIANTES) {
    // Upsert por email
    const existing = await db.execute({
      sql: `SELECT id_estudiante FROM estudiantes WHERE email = ? LIMIT 1`,
      args: [est.email],
    })

    let id: number
    if (existing.rows.length > 0) {
      id = existing.rows[0].id_estudiante as number
      console.log(`  ⚠  Estudiante ya existe: ${est.nombre} (id=${id})`)
    } else {
      const ins = await db.execute({
        sql: `INSERT INTO estudiantes (cedula_rif, nombre_completo, email, telefono, tipo)
              VALUES (?, ?, ?, ?, 'Regular') RETURNING id_estudiante`,
        args: [est.cedula, est.nombre, est.email, est.telefono],
      })
      id = ins.rows[0].id_estudiante as number
      console.log(`  ✓ Estudiante creado: ${est.nombre} (id=${id})`)
    }
    estudianteIds.push(id)
  }

  console.log()

  // ── 2. Insertar preinscripciones ─────────────────────────────────────────────
  let insertadas = 0
  let omitidas   = 0

  for (const p of PREINSCRIPCIONES) {
    const idEst = estudianteIds[p.estudianteIdx]
    const nombre = ESTUDIANTES[p.estudianteIdx].nombre

    // Verificar si ya existe
    const dup = await db.execute({
      sql: `SELECT id_inscripcion FROM inscripciones_cursos
            WHERE id_estudiante = ? AND programa_codigo = ? AND id_curso IS NULL LIMIT 1`,
      args: [idEst, p.programa],
    })

    if (dup.rows.length > 0) {
      console.log(`  ⚠  Ya existe: ${nombre} → ${p.programa} (omitida)`)
      omitidas++
      continue
    }

    await db.execute({
      sql: `INSERT INTO inscripciones_cursos
              (id_estudiante, id_curso, programa_codigo, tipo_inscripcion, estatus, creado_en, actualizado_en)
            VALUES (?, NULL, ?, 'programa', ?, ?, ?)`,
      args: [idEst, p.programa, p.estatus, now(), now()],
    })
    console.log(`  ✓ Preinscripción: ${nombre.padEnd(22)} → ${p.programa.padEnd(7)} [${p.estatus}]`)
    insertadas++
  }

  // ── Resumen ──────────────────────────────────────────────────────────────────
  console.log(`
✅ Seed completado.
   Preinscripciones insertadas : ${insertadas}
   Omitidas (ya existían)       : ${omitidas}
`)

  // ── Verificación rápida ──────────────────────────────────────────────────────
  const resumen = await db.execute(`
    SELECT ic.programa_codigo, ic.estatus, COUNT(*) as total
    FROM inscripciones_cursos ic
    WHERE ic.id_curso IS NULL AND ic.programa_codigo IS NOT NULL
    GROUP BY ic.programa_codigo, ic.estatus
    ORDER BY ic.programa_codigo, ic.estatus
  `)

  console.log('📊 Estado actual de preinscripciones (por programa):')
  console.log('  Programa  Estatus       Total')
  console.log('  ──────────────────────────────')
  for (const r of resumen.rows) {
    const prog = String(r.programa_codigo).padEnd(8)
    const est  = String(r.estatus).padEnd(14)
    console.log(`  ${prog}  ${est}  ${r.total}`)
  }
  console.log()
}

seed().catch(err => {
  console.error('\n❌ Error durante el seed:', err)
  process.exit(1)
})
