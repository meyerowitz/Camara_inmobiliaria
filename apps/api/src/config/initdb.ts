/**
 * initdb.ts — Inicialización del esquema de base de datos en Turso/LibSQL.
 *
 * Uso:
 *   pnpm tsx src/config/initdb.ts
 *
 * Reinicio completo (borra todas las tablas de usuario y recrea el esquema):
 *   INITDB_RESET=1 pnpm tsx src/config/initdb.ts
 */

import { db } from '../lib/db.js'
import bcrypt from 'bcryptjs'
import fs from 'fs'
import path from 'path'

const statements = [
  // ──────────────────────────────────────────────────────────
  // ACTIVAR FOREIGN KEYS 
  // ──────────────────────────────────────────────────────────
  `PRAGMA foreign_keys = ON`,

  // ===========================================================
  // FASE 1 — MÓDULO DE AFILIACIÓN (WORKFLOW CIBIR)
  // ===========================================================
  `CREATE TABLE IF NOT EXISTS agremiados (
    id_agremiado                INTEGER     PRIMARY KEY,
    codigo_cibir                TEXT        UNIQUE,
    tipo_afiliado               TEXT        NOT NULL DEFAULT 'Natural'
                                CHECK (tipo_afiliado IN ('Natural', 'Corporativo')),
    razon_social                TEXT,
    cedula_rif_tipo             TEXT        NOT NULL DEFAULT 'V'
                                CHECK (cedula_rif_tipo IN ('V', 'J', 'E', 'G', 'P')),
    cedula_rif                  TEXT        UNIQUE NOT NULL,
    nombres                     TEXT,
    apellidos                   TEXT,
    -- Columna generada automáticamente para evitar desincronización
    nombre_completo             TEXT        GENERATED ALWAYS AS (
                                  CASE WHEN tipo_afiliado = 'Corporativo'
                                    THEN razon_social
                                    ELSE nombres || ' ' || apellidos
                                  END
                                ) VIRTUAL,
    cedula_personal             TEXT,
    email                       TEXT        UNIQUE NOT NULL,
    direccion                   TEXT,
    telefono                    TEXT,
    fecha_nacimiento            TEXT,
    nivel_academico             TEXT,
    notas                       TEXT,
    estatus                     TEXT        NOT NULL DEFAULT '1_PREINSCRIPCION'
                                CHECK (estatus IN (
                                  '1_PREINSCRIPCION',
                                  '2_EXPEDIENTE',
                                  '3_ENTREVISTA',
                                  '4_VERIFICACION',
                                  '5_CIBIR',
                                  '6_INSCRIPCION',
                                  'Requiere Acción',
                                  'Afiliado',
                                  'Moroso',
                                  'Suspendido',
                                  'Rechazado'
                                )),
    cibir_convalidado           INTEGER     NOT NULL DEFAULT 0
                                CHECK (cibir_convalidado IN (0, 1)),
    inscripcion_pagada          INTEGER     NOT NULL DEFAULT 0 
                                CHECK (inscripcion_pagada IN (0, 1)),
    -- CORPORATIVO: empresa que agrupa a otros afiliados (autoreferencia)
    id_agremiado_corp           INTEGER     REFERENCES agremiados(id_agremiado) ON DELETE SET NULL,
    -- REPRESENTANTE LEGAL: obligatorio para Corporativo, apunta a un afiliado Natural
    id_representante_legal      INTEGER     REFERENCES agremiados(id_agremiado) ON DELETE SET NULL,
    fecha_registro              TEXT        NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ','now')),
    fecha_ultimo_cambio_estatus TEXT,
    actualizado_en              TEXT,
    -- Redes sociales y web (usadas tanto por Natural como Corporativo)
    instagram                   TEXT,
    facebook                    TEXT,
    linkedin                    TEXT,
    twitter                     TEXT,
    website                     TEXT,
    logo_url                    TEXT,       -- Foto de perfil (Natural) o logo (Corporativo)
    banner_url                  TEXT,       -- Imagen de portada (para ambos tipos)
    activo                      INTEGER     NOT NULL DEFAULT 1 
                                CHECK (activo IN (0, 1)),
    CONSTRAINT chk_email_formato CHECK (email LIKE '%@%.%'),
    -- Integridad de nombres según tipo
    CONSTRAINT chk_nombres_tipo CHECK (
      (tipo_afiliado IN ('Natural', 'Corporativo') AND nombres IS NOT NULL AND apellidos IS NOT NULL) OR
      (tipo_afiliado = 'Corporativo' AND razon_social IS NOT NULL)
    ),
    -- Representante legal
    CONSTRAINT chk_rep_legal_corporativo CHECK (
      tipo_afiliado IN ('Natural', 'Corporativo')
    ),
    CONSTRAINT fk_agremiado_rep_legal
      FOREIGN KEY (id_representante_legal) REFERENCES agremiados(id_agremiado) ON DELETE SET NULL
  )`,

  `CREATE TABLE IF NOT EXISTS agremiados_datos_empresa (
    id_dato_empresa     INTEGER PRIMARY KEY,
    id_agremiado        INTEGER UNIQUE NOT NULL REFERENCES agremiados(id_agremiado) ON DELETE CASCADE,
    razon_social        TEXT NOT NULL,
    rif                 TEXT NOT NULL UNIQUE,
    direccion           TEXT,
    telefono            TEXT,
    email               TEXT,
    website             TEXT
  )`,

  `CREATE INDEX IF NOT EXISTS idx_agremiados_estatus ON agremiados(estatus)`,
  `CREATE INDEX IF NOT EXISTS idx_agremiados_cedula ON agremiados(cedula_rif)`,
  `CREATE INDEX IF NOT EXISTS idx_agremiados_corp ON agremiados(id_agremiado_corp)`,
  `CREATE INDEX IF NOT EXISTS idx_agremiados_email ON agremiados(email)`,

  // ── Documentos Adjuntos (Expediente Digital) ──
  `CREATE TABLE IF NOT EXISTS documentos_adjuntos (
    id_documento      INTEGER     PRIMARY KEY,
    entidad_tipo      TEXT        NOT NULL CHECK (entidad_tipo IN ('Agremiado', 'Curso', 'Denuncia', 'Legal')),
    entidad_id        INTEGER     NOT NULL,
    nombre_documento  TEXT        NOT NULL,
    url_documento     TEXT        NOT NULL,
    tipo_archivo      TEXT,       -- PDF, JPG, etc.
    fecha_subida      TEXT        NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ','now'))
  )`,

  `CREATE INDEX IF NOT EXISTS idx_docs_entidad ON documentos_adjuntos(entidad_tipo, entidad_id)`,

  // ── Invitaciones corporativas (links reutilizables para afiliados individuales) ──
  `CREATE TABLE IF NOT EXISTS invitaciones_corporativas (
    id_invitacion     INTEGER  PRIMARY KEY,
    id_agremiado_corp INTEGER  NOT NULL REFERENCES agremiados(id_agremiado) ON DELETE CASCADE,
    token             TEXT     UNIQUE NOT NULL,
    nombre_empresa    TEXT     NOT NULL,
    activo            INTEGER  NOT NULL DEFAULT 1
                      CHECK (activo IN (0, 1)),
    fecha_expiracion  TEXT,
    creado_en         TEXT     NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ','now'))
  )`,

  `CREATE INDEX IF NOT EXISTS idx_invitaciones_corp ON invitaciones_corporativas(id_agremiado_corp)`,
  `CREATE INDEX IF NOT EXISTS idx_invitaciones_token ON invitaciones_corporativas(token)`,

  // ===========================================================
  // FASE 1.5 — ESTUDIANTES (REGULARES / NO NECESARIAMENTE CIBIR)
  // ===========================================================
  `CREATE TABLE IF NOT EXISTS estudiantes (
    id_estudiante     INTEGER     PRIMARY KEY,
    -- Vínculo directo a la cuenta de usuario (estudiante puede iniciar sesión)
    id_user           INTEGER     REFERENCES users(id) ON DELETE SET NULL,
    -- Si el estudiante es agremiado, lo vinculamos (opcional)
    id_agremiado      INTEGER,
    cedula_rif_tipo   TEXT        NOT NULL DEFAULT 'V'
                      CHECK (cedula_rif_tipo IN ('V', 'J', 'E', 'G', 'P')),
    cedula_rif        TEXT,
    nombres           TEXT,
    apellidos         TEXT,
    razon_social      TEXT,
    nombre_completo   TEXT        NOT NULL,
    email             TEXT        NOT NULL UNIQUE,
    telefono          TEXT,
    programa_interes  TEXT,
    nivel_profesional TEXT        CHECK (nivel_profesional IS NULL OR nivel_profesional IN ('Bachiller','TSU','Universitario','Postgrado')),
    es_corredor_inmobiliario INTEGER CHECK (es_corredor_inmobiliario IS NULL OR es_corredor_inmobiliario IN (0, 1)),
    tipo              TEXT        NOT NULL DEFAULT 'Regular' CHECK (tipo IN ('Regular','Invitado','Agremiado','Afiliado','Corporativo')),
    creado_en         TEXT        NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ','now')),
    actualizado_en    TEXT,
    CONSTRAINT fk_estudiante_agremiado FOREIGN KEY (id_agremiado) REFERENCES agremiados(id_agremiado) ON DELETE SET NULL,
    CONSTRAINT fk_estudiante_user FOREIGN KEY (id_user) REFERENCES users(id) ON DELETE SET NULL
  )`,

  `CREATE INDEX IF NOT EXISTS idx_estudiantes_email ON estudiantes(email)`,
  `CREATE INDEX IF NOT EXISTS idx_estudiantes_cedula ON estudiantes(cedula_rif)`,
  `CREATE INDEX IF NOT EXISTS idx_estudiantes_user ON estudiantes(id_user)`,

  `CREATE TABLE IF NOT EXISTS verificaciones_email (
    id          INTEGER  PRIMARY KEY,
    email       TEXT     NOT NULL,
    codigo      TEXT     NOT NULL,
    expira_en   INTEGER  NOT NULL,
    usado       INTEGER  DEFAULT 0
  )`,

  // ===========================================================
  // FASE 2 — MÓDULO ACADÉMICO (CURSOS Y PAGOS)
  // ===========================================================
  `CREATE TABLE IF NOT EXISTS instructores (
    id_instructor     INTEGER     PRIMARY KEY,
    nombre            TEXT        NOT NULL,
    especialidad      TEXT,
    perfil            TEXT,
    email             TEXT,
    telefono          TEXT,
    activo            INTEGER     DEFAULT 1
  )`,

  `CREATE TABLE IF NOT EXISTS cursos (
    id_curso          INTEGER     PRIMARY KEY,
    titulo            TEXT        NOT NULL,
    slug              TEXT        UNIQUE NOT NULL,
    descripcion       TEXT,
    contenido         TEXT,       -- Markdown o HTML
    categoria         TEXT        CHECK (categoria IN ('Taller', 'Diplomado', 'Certificación', 'Webinar')),
    id_instructor     INTEGER     REFERENCES instructores(id_instructor),
    precio_miembro    REAL        DEFAULT 0,
    precio_publico    REAL        DEFAULT 0,
    fecha_inicio      TEXT,
    fecha_fin         TEXT,
    modalidad         TEXT        CHECK (modalidad IN ('Presencial', 'Online', 'Híbrido')),
    estatus           TEXT        DEFAULT 'Borrador' CHECK (estatus IN ('Borrador', 'Publicado', 'Finalizado', 'Cancelado')),
    imagen_url        TEXT,
    banner_url        TEXT,
    cupos_totales     INTEGER,
    cupos_disponibles INTEGER,
    destacado         INTEGER     DEFAULT 0,
    creado_en         TEXT        NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ','now')),
    actualizado_en    TEXT
  )`,

  `CREATE TABLE IF NOT EXISTS inscripciones_cursos (
    id_inscripcion    INTEGER     PRIMARY KEY,
    id_curso          INTEGER     NOT NULL REFERENCES cursos(id_curso) ON DELETE CASCADE,
    id_estudiante     INTEGER     NOT NULL REFERENCES estudiantes(id_estudiante) ON DELETE CASCADE,
    fecha_inscripcion TEXT        NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ','now')),
    metodo_pago       TEXT,       -- Transferencia, Pago Móvil, Zelle, etc.
    referencia_pago   TEXT,
    monto_pagado      REAL,
    estado_pago       TEXT        DEFAULT 'Pendiente' CHECK (estado_pago IN ('Pendiente', 'Verificando', 'Pagado', 'Rechazado')),
    estatus_academico TEXT        DEFAULT 'Inscrito' CHECK (estatus_academico IN ('Inscrito', 'Cursando', 'Aprobado', 'Reprobado', 'Retirado')),
    certificado_url   TEXT,
    notas             TEXT,
    UNIQUE(id_curso, id_estudiante)
  )`,

  // ===========================================================
  // FASE 3 — MÓDULO LEGAL (DENUNCIAS Y REGLAMENTOS)
  // ===========================================================
  `CREATE TABLE IF NOT EXISTS denuncias (
    id_denuncia       INTEGER     PRIMARY KEY,
    id_denunciante    INTEGER     REFERENCES users(id), -- Puede ser nulo para denuncias anónimas o externas
    nombre_denunciante TEXT,
    email_denunciante TEXT,
    tipo_denuncia     TEXT        NOT NULL CHECK (tipo_denuncia IN ('Ética', 'Ejercicio Ilegal', 'Inmobiliaria', 'Otros')),
    asunto            TEXT        NOT NULL,
    descripcion       TEXT        NOT NULL,
    estatus           TEXT        DEFAULT 'Recibida' CHECK (estatus IN ('Recibida', 'En Revisión', 'Investigación', 'Resuelta', 'Desestimada')),
    fecha_creacion    TEXT        NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ','now')),
    ultima_actualizacion TEXT
  )`,

  `CREATE TABLE IF NOT EXISTS evidencias_legales (
    id_evidencia      INTEGER     PRIMARY KEY,
    id_denuncia       INTEGER     NOT NULL REFERENCES denuncias(id_denuncia) ON DELETE CASCADE,
    nombre_archivo    TEXT,
    url_archivo       TEXT        NOT NULL,
    creado_en         TEXT        NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ','now'))
  )`,

  `CREATE INDEX IF NOT EXISTS idx_evidencias_denuncia ON evidencias_legales(id_denuncia)`,

  `CREATE TABLE IF NOT EXISTS planes_gestion (
    id_plan           INTEGER     PRIMARY KEY,
    titulo            TEXT        NOT NULL,
    periodo           TEXT,       -- Ej: "2024-2025"
    archivo_url       TEXT        NOT NULL,
    activo            INTEGER     DEFAULT 1
  )`,

  `CREATE TABLE IF NOT EXISTS actas_y_convocatorias (
    id_acta           INTEGER     PRIMARY KEY,
    tipo              TEXT        NOT NULL CHECK (tipo IN ('Acta Asamblea', 'Convocatoria', 'Circular', 'Reglamento')),
    titulo            TEXT        NOT NULL,
    fecha_publicacion TEXT        NOT NULL,
    archivo_url       TEXT        NOT NULL
  )`,

  // ===========================================================
  // CMS — CONTENIDO DINÁMICO
  // ===========================================================
  `CREATE TABLE IF NOT EXISTS cms_noticias (
    id_noticia        INTEGER     PRIMARY KEY,
    titulo            TEXT        NOT NULL,
    slug              TEXT        UNIQUE NOT NULL,
    resumen           TEXT,
    contenido         TEXT,
    imagen_url        TEXT,
    categoria         TEXT,
    fecha_publicacion TEXT        DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ','now')),
    publicado         INTEGER     DEFAULT 0
  )`,

  `CREATE TABLE IF NOT EXISTS cms_cursos (
    id_cms_curso      INTEGER     PRIMARY KEY,
    titulo            TEXT        NOT NULL,
    slug              TEXT        UNIQUE NOT NULL,
    descripcion_corta TEXT,
    modalidad         TEXT,
    precio            REAL,
    imagen_url        TEXT,
    publicado         INTEGER     DEFAULT 1
  )`,

  `CREATE TABLE IF NOT EXISTS cms_convenios (
    id_convenio       INTEGER     PRIMARY KEY,
    nombre            TEXT        NOT NULL,
    descripcion       TEXT,
    logo_url          TEXT,
    link_web          TEXT,
    activo            INTEGER     DEFAULT 1
  )`,

  `CREATE TABLE IF NOT EXISTS cms_directiva (
    id_miembro        INTEGER     PRIMARY KEY,
    nombre            TEXT        NOT NULL,
    cargo             TEXT        NOT NULL,
    periodo           TEXT,
    foto_url          TEXT,
    orden             INTEGER     DEFAULT 0
  )`,

  `CREATE TABLE IF NOT EXISTS cms_hitos (
    id_hito           INTEGER     PRIMARY KEY,
    año               TEXT        NOT NULL,
    titulo            TEXT        NOT NULL,
    descripcion       TEXT,
    orden             INTEGER     DEFAULT 0
  )`,

  `CREATE TABLE IF NOT EXISTS cms_normativas (
    id_normativa      INTEGER     PRIMARY KEY,
    titulo            TEXT        NOT NULL,
    tipo              TEXT        CHECK (tipo IN ('Ley', 'Reglamento', 'Código')),
    archivo_url       TEXT        NOT NULL,
    orden             INTEGER     DEFAULT 0
  )`,

  `CREATE TABLE IF NOT EXISTS cms_configuracion (
    clave             TEXT        PRIMARY KEY,
    valor             TEXT,
    grupo             TEXT
  )`,

  `CREATE TABLE IF NOT EXISTS cms_paginas (
    id_pagina         INTEGER     PRIMARY KEY,
    slug              TEXT        UNIQUE NOT NULL,
    titulo            TEXT        NOT NULL,
    contenido         TEXT,
    meta_title        TEXT,
    meta_desc         TEXT,
    actualizado_en    TEXT        DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ','now'))
  )`,

  `CREATE INDEX IF NOT EXISTS idx_cms_paginas_actualizado ON cms_paginas(actualizado_en)`,

  // ===========================================================
  // SEGURIDAD Y USUARIOS
  // ===========================================================
  `CREATE TABLE IF NOT EXISTS users (
    id                INTEGER     PRIMARY KEY,
    email             TEXT        UNIQUE NOT NULL,
    password          TEXT        NOT NULL,
    role              TEXT        NOT NULL DEFAULT 'User' CHECK (role IN ('Admin', 'Moderator', 'Editor', 'User', 'Student')),
    activo            INTEGER     DEFAULT 1,
    creado_en         TEXT        NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ','now')),
    actualizado_en    TEXT
  )`
]

async function run() {
  console.log('--- TURSO DB INITIALIZATION ---')

  const reset = process.env.INITDB_RESET === '1'

  if (reset) {
    console.log('  ⚠ RESET MODE: Dropping all tables...')
    // En SQLite, debemos borrar en orden inverso o desactivar FKs
    await db.execute(`PRAGMA foreign_keys = OFF`)
    
    // Obtener todas las tablas
    const tables = await db.execute("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'")
    for (const row of tables.rows) {
      await db.execute(`DROP TABLE IF EXISTS ${row.name}`)
      console.log(`    · Dropped ${row.name}`)
    }
    
    await db.execute(`PRAGMA foreign_keys = ON`)
  }

  // Ejecutar statements de creación
  for (const sql of statements) {
    try {
      await db.execute(sql)
      const label = sql.substring(0, 50).replace(/\\n/g, ' ') + '...'
      console.log(`  · OK: ${label}`)
    } catch (e: any) {
      console.error(`  · ERROR en statement: ${sql.substring(0, 50)}...`)
      console.error(`    ${e.message}`)
    }
  }

  console.log('\n--- SEEDING INITIAL DATA ---')

  // 1. Admin User
  const adminEmail = 'admin@admin.com'
  const hashedPassword = await bcrypt.hash('admin123', 10)
  try {
    await db.execute({
      sql: `INSERT INTO users (email, password, role) VALUES (?, ?, ?)`,
      args: [adminEmail, hashedPassword, 'Admin']
    })
    console.log(`  · Admin user ${adminEmail} created.`)
  } catch (e) {
    console.log(`  · User ${adminEmail} already exists.`)
  }

  // 2. Instructor inicial
  try {
    await db.execute({
      sql: `INSERT INTO instructores (id_instructor, nombre, especialidad) VALUES (?, ?, ?)`,
      args: [1, 'Instructor Global', 'General']
    })
    console.log(`  · Instructor 1 created.`)
  } catch (e) {
    console.log(`  · Instructor 1 already exists.`)
  }

  // 3. Convenios iniciales
  const convenios = [
    {
      nombre: 'Universidad Católica Andrés Bello (UCAB)',
      descripcion: 'Convenio de cooperación académica para diplomados y certificaciones inmobiliarias.',
      link_web: 'https://www.ucab.edu.ve/'
    },
    {
      nombre: 'Banco Mercantil',
      descripcion: 'Alianza estratégica para facilitar el acceso a servicios financieros de nuestros agremiados.',
      link_web: 'https://www.mercantilbanco.com/'
    }
  ]

  for (const conv of convenios) {
    try {
      await db.execute({
        sql: `INSERT INTO cms_convenios (nombre, descripcion, link_web) VALUES (?, ?, ?)`,
        args: [conv.nombre, conv.descripcion, conv.link_web]
      })
      console.log(`  · Convenio ${conv.nombre} created.`)
    } catch (e) {
      // console.log(`  · Convenio ${conv.nombre} already exists.`)
    }
  }

  // 4. Afiliados (desde JSON)
  const seedPath = path.join(process.cwd(), 'apps/api/src/config/afiliados_seed.json')
  if (fs.existsSync(seedPath)) {
    try {
      const seedData = JSON.parse(fs.readFileSync(seedPath, 'utf8'))
      for (const a of seedData) {
        try {
          // Extraer tipo y número de la cédula original (V-12345678 -> V, 12345678)
          let tipo = 'V'
          let numero = a.cedula_rif || ''
          
          if (numero.includes('-')) {
            const parts = numero.split('-')
            tipo = parts[0].toUpperCase()
            numero = parts.slice(1).join('-')
          } else if (/^[VJEGP]/i.test(numero)) {
            tipo = numero[0].toUpperCase()
            numero = numero.substring(1)
          }

          await db.execute({
            sql: `INSERT INTO agremiados (id_agremiado, codigo_cibir, tipo_afiliado, nombres, apellidos, razon_social, cedula_rif_tipo, cedula_rif, email, telefono, nivel_academico, estatus, notas) 
                  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            args: [
              a.id_agremiado ?? null, 
              a.id_agremiado ? String(a.id_agremiado) : null,
              a.tipo_afiliado ?? 'Natural',
              a.nombres ?? null, 
              a.apellidos ?? null, 
              a.razon_social ?? null,
              tipo,
              numero,
              a.email ?? null, 
              a.telefono ?? null,
              a.nivel_academico ?? null, 
              'Afiliado', 
              a.notas ?? null
            ]
          })
          
          if (a.razon_social) {
            await db.execute({
              sql: `INSERT INTO agremiados_datos_empresa (id_agremiado, razon_social, rif) VALUES (?, ?, ?)`,
              args: [a.id_agremiado ?? null, a.razon_social ?? null, 'PROV-' + a.id_agremiado]
            })
          }
        } catch (e) {
          // Ignorar duplicados o errores de inserción individual
        }
      }
      console.log(`  · Seeded ${seedData.length} affiliates.`)
    } catch (err) {
      console.error('  · Error seeding affiliates:', err)
    }
  }

  console.log('\nDB Initialization complete!\n')
}

run().catch(console.error)