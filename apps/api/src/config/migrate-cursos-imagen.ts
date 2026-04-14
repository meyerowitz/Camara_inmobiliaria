import { db } from '../lib/db.js'

async function migrate() {
  console.log('▶ Iniciando migración de cursos (imagen_url)...\n')

  console.log('1. Agregando columna imagen_url a cursos...')
  try {
    await db.execute(`ALTER TABLE cursos ADD COLUMN imagen_url TEXT DEFAULT NULL`)
    console.log('   ✓ Columna imagen_url creada.')
  } catch (e: any) {
    if (e.message?.includes('duplicate column') || e.message?.includes('already exists')) {
      console.log('   ⚠ La columna imagen_url ya existe, omitida.')
    } else throw e
  }

  // Marcar los cursos actuales con estatus Finalizado a Cerrado para alinear los estatus en caso de que existan en front end con "Finalizado" (la db soporta Abierto, Cerrado, En curso)
  console.log('2. Alineando estatus de cursos (Finalizado -> Cerrado)...')
  try {
    await db.execute(`UPDATE cursos SET estatus = 'Cerrado' WHERE estatus = 'Finalizado'`)
    console.log('   ✓ Estatus alineado.')
  } catch (e: any) {
    console.log('   ⚠ Omitido: ' + e)
  }

  console.log('\n✅ Migración completada con éxito.\n')
}

migrate().catch((err) => {
  console.error('\n❌ Error durante la migración:', err)
  process.exit(1)
})
