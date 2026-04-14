/**
 * migrate-academia.ts — Migración de módulo académico.
 *
 * Cambios:
 *  1. Añade columna `programa_codigo` a la tabla `cursos`
 *     Permite vincular una cohorte real a su programa (PADI, PEGI, PREANI, CIBIR o libre)
 *  2. Añade columna `tipo_inscripcion` a `inscripciones_cursos`
 *     Distingue: 'programa' (preinscripción libre, id_curso NULL) vs 'cohorte' (curso específico)
 *  3. Actualiza filas existentes para rellenar `tipo_inscripcion` basado en `id_curso`
 *  4. Añade columna `precio` a `cursos` para mostrar en el panel
 *  5. Añade columnas `actualizado_en` y `creado_en` a `cursos` para auditoría
 *
 * Idempotente: todos los ALTER TABLE están envueltos en try/catch.
 *
 * Uso:
 *   pnpm tsx src/config/migrate-academia.ts
 */

import { db } from '../lib/db.js'

async function migrate() {
  console.log('▶ Iniciando migración del módulo académico...\n')

  // ── 1. programa_codigo en cursos ─────────────────────────────────────────
  console.log('1. Agregando columna programa_codigo a cursos...')
  try {
    await db.execute(`ALTER TABLE cursos ADD COLUMN programa_codigo TEXT DEFAULT NULL`)
    console.log('   ✓ Columna programa_codigo creada.')
  } catch (e: any) {
    if (e.message?.includes('duplicate column') || e.message?.includes('already exists')) {
      console.log('   ⚠ La columna programa_codigo ya existe, omitida.')
    } else throw e
  }

  // ── 2. precio en cursos ──────────────────────────────────────────────────
  console.log('2. Agregando columna precio a cursos...')
  try {
    await db.execute(`ALTER TABLE cursos ADD COLUMN precio TEXT DEFAULT NULL`)
    console.log('   ✓ Columna precio creada.')
  } catch (e: any) {
    if (e.message?.includes('duplicate column') || e.message?.includes('already exists')) {
      console.log('   ⚠ La columna precio ya existe, omitida.')
    } else throw e
  }

  // ── 3. creado_en en cursos ───────────────────────────────────────────────
  console.log('3. Agregando columna creado_en a cursos...')
  try {
    await db.execute(`ALTER TABLE cursos ADD COLUMN creado_en TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ','now'))`)
    console.log('   ✓ Columna creado_en creada.')
  } catch (e: any) {
    if (e.message?.includes('duplicate column') || e.message?.includes('already exists')) {
      console.log('   ⚠ La columna creado_en ya existe, omitida.')
    } else throw e
  }

  // ── 4. actualizado_en en cursos ──────────────────────────────────────────
  console.log('4. Agregando columna actualizado_en a cursos...')
  try {
    await db.execute(`ALTER TABLE cursos ADD COLUMN actualizado_en TEXT DEFAULT NULL`)
    console.log('   ✓ Columna actualizado_en creada.')
  } catch (e: any) {
    if (e.message?.includes('duplicate column') || e.message?.includes('already exists')) {
      console.log('   ⚠ La columna actualizado_en ya existe, omitida.')
    } else throw e
  }

  // ── 5. tipo_inscripcion en inscripciones_cursos ──────────────────────────
  console.log('5. Agregando columna tipo_inscripcion a inscripciones_cursos...')
  try {
    await db.execute(`ALTER TABLE inscripciones_cursos ADD COLUMN tipo_inscripcion TEXT NOT NULL DEFAULT 'cohorte'`)
    console.log('   ✓ Columna tipo_inscripcion creada.')
  } catch (e: any) {
    if (e.message?.includes('duplicate column') || e.message?.includes('already exists')) {
      console.log('   ⚠ La columna tipo_inscripcion ya existe, omitida.')
    } else throw e
  }

  // ── 6. Rellenar tipo_inscripcion en filas existentes ────────────────────
  console.log('6. Actualizando tipo_inscripcion en filas existentes...')
  const resProg = await db.execute(
    `UPDATE inscripciones_cursos SET tipo_inscripcion = 'programa' WHERE id_curso IS NULL AND programa_codigo IS NOT NULL`
  )
  const resCohorte = await db.execute(
    `UPDATE inscripciones_cursos SET tipo_inscripcion = 'cohorte' WHERE id_curso IS NOT NULL`
  )
  console.log(`   ✓ Preinscripciones de programa marcadas: ${resProg.rowsAffected}`)
  console.log(`   ✓ Inscripciones de cohorte marcadas: ${resCohorte.rowsAffected}`)

  // ── 7. Crear instructor por defecto si no existe ─────────────────────────
  console.log('7. Verificando instructor por defecto (id=1)...')
  const instCheck = await db.execute(`SELECT id_instructor FROM instructores WHERE id_instructor = 1 LIMIT 1`)
  if (instCheck.rows.length === 0) {
    await db.execute(
      `INSERT INTO instructores (nombre, especialidad, activo) VALUES ('Por asignar', 'General', 1)`
    )
    console.log('   ✓ Instructor por defecto creado.')
  } else {
    console.log('   ⚠ Instructor por defecto ya existe, omitido.')
  }

  // ── Resumen ──────────────────────────────────────────────────────────────
  console.log('\n✅ Migración completada con éxito.\n')

  const { rows } = await db.execute(
    `SELECT name FROM sqlite_master WHERE type='table' ORDER BY name`
  )
  console.log('Tablas actuales:')
  for (const row of rows) console.log(`  · ${row.name}`)
}

migrate().catch((err) => {
  console.error('\n❌ Error durante la migración:', err)
  process.exit(1)
})
