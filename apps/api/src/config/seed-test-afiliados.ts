import { db } from '../lib/db.js'
import bcrypt from 'bcryptjs'

async function seed() {
  console.log('🌱 Sembrando afiliados de prueba...')

  const passwordHash = await bcrypt.hash('password123', 10)

  try {
    // 1. AFILIADO NATURAL (INDEPENDIENTE)
    console.log('  · Insertando Afiliado Natural...')
    const resNatural = await db.execute({
      sql: `INSERT INTO agremiados (tipo_afiliado, nombre_completo, email, cedula_rif, estatus, inscripcion_pagada)
            VALUES ('Natural', 'Juan Perez Test', 'natural@test.com', 'V-12345678', '9_AFILIACION', 1)
            RETURNING id_agremiado`,
      args: []
    })
    const idNatural = resNatural.rows[0].id_agremiado

    await db.execute({
      sql: `INSERT INTO users (email, password_hash, rol, roles, id_agremiado)
            VALUES ('natural@test.com', ?, 'afiliado', '["afiliado"]', ?)`,
      args: [passwordHash, idNatural]
    })

    // 2. AFILIADO JURIDICO (CORPORATIVO)
    console.log('  · Insertando Afiliado Jurídico...')
    const resJuridico = await db.execute({
      sql: `INSERT INTO agremiados (tipo_afiliado, nombre_completo, razon_social, representante_legal, email, cedula_rif, estatus, inscripcion_pagada)
            VALUES ('Juridico', 'Inmobiliaria Test C.A.', 'Inmobiliaria Test C.A.', 'Representante Legal Test', 'empresa@test.com', 'J-12345678', '9_AFILIACION', 1)
            RETURNING id_agremiado`,
      args: []
    })
    const idJuridico = resJuridico.rows[0].id_agremiado

    await db.execute({
      sql: `INSERT INTO users (email, password_hash, rol, roles, id_agremiado)
            VALUES ('empresa@test.com', ?, 'afiliado', '["afiliado"]', ?)`,
      args: [passwordHash, idJuridico]
    })

    console.log('\n✅ Afiliados insertados correctamente.')
    console.log('\n--------------------------------------')
    console.log('CREDENCIALES DE PRUEBA:')
    console.log('--------------------------------------')
    console.log('AFILIADO INDEPENDIENTE:')
    console.log('  Email: natural@test.com')
    console.log('  Pass:  password123')
    console.log('--------------------------------------')
    console.log('AFILIADO CORPORATIVO:')
    console.log('  Email: empresa@test.com')
    console.log('  Pass:  password123')
    console.log('--------------------------------------')

  } catch (error) {
    console.error('❌ Error al sembrar:', error)
  }
}

seed()
