/**
 * initdb.ts — Inicialización del esquema de base de datos en Turso/LibSQL.
 *
 * Adaptaciones MySQL → SQLite/LibSQL:
 *  - ENUM(...)         → TEXT CHECK (col IN (...))
 *  - AUTO_INCREMENT    → INTEGER PRIMARY KEY  (SQLite auto-incrementa PKs enteras)
 *  - BOOLEAN           → INTEGER  (0 = false, 1 = true)
 *  - YEAR              → INTEGER
 *  - DECIMAL(10,2)     → NUMERIC
 *  - VARCHAR / TEXT    → TEXT
 *  - TIMESTAMP / DATE  → TEXT  (formato ISO 8601)
 *  - PRAGMA foreign_keys = ON  (desactivado por defecto en SQLite)
 *
 * Uso:
 *   pnpm tsx src/config/initdb.ts
 *
 * Reinicio completo (borra todas las tablas de usuario y recrea el esquema):
 *   INITDB_RESET=1 pnpm tsx src/config/initdb.ts
 *   pnpm tsx src/config/initdb.ts --reset
 */

import { db } from '../lib/db.js'
import bcrypt from 'bcryptjs'

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
                                CHECK (tipo_afiliado IN ('Natural', 'Juridico')),
    razon_social                TEXT,
    cedula_rif                  TEXT        UNIQUE NOT NULL,
    nombres                     TEXT,
    apellidos                   TEXT,
    nombre_completo             TEXT        NOT NULL,
    cedula_personal             TEXT,
    email                       TEXT        UNIQUE NOT NULL,
    direccion                   TEXT,
    telefono                    TEXT,
    fecha_nacimiento            TEXT,
    nivel_academico             TEXT,
    notas                       TEXT,
    estatus                     TEXT        NOT NULL DEFAULT '1_SOLICITUD'
                                CHECK (estatus IN (
                                  '1_SOLICITUD','2_REQUISITOS','3_CONFIRMACION',
                                  '4_RECEPCION','5_ENTREVISTA','6_JUNTA_DIRECTIVA',
                                  '7_RESULTADO','8_FORMALIZACION','9_AFILIACION',
                                  'Moroso','Suspendido','Rechazado'
                                )),
    cibir_convalidado           INTEGER     NOT NULL DEFAULT 0
                                CHECK (cibir_convalidado IN (0, 1)),
    inscripcion_pagada          INTEGER     NOT NULL DEFAULT 0,
    -- Corporativo: afiliados individuales vinculados a esta empresa
    id_agremiado_corp           INTEGER     REFERENCES agremiados(id_agremiado) ON DELETE SET NULL,
    representante_legal         TEXT,
    fecha_registro              TEXT        NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ','now')),
    fecha_ultimo_cambio_estatus TEXT,
    url_cedula                  TEXT,
    url_titulo                  TEXT,
    url_cv                      TEXT,
    instagram                   TEXT,
    facebook                    TEXT,
    linkedin                    TEXT,
    twitter                     TEXT,
    website                     TEXT,
    CONSTRAINT chk_email_formato CHECK (email LIKE '%@%.%')
  )`,

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
    -- Si el estudiante es agremiado, lo vinculamos (opcional)
    id_agremiado      INTEGER,
    cedula_rif        TEXT,
    nombre_completo   TEXT        NOT NULL,
    email             TEXT        NOT NULL UNIQUE,
    telefono          TEXT,
    programa_interes  TEXT,
    nivel_profesional TEXT        CHECK (nivel_profesional IS NULL OR nivel_profesional IN ('Bachiller','TSU','Universitario','Postgrado')),
    es_corredor_inmobiliario INTEGER CHECK (es_corredor_inmobiliario IS NULL OR es_corredor_inmobiliario IN (0, 1)),
    tipo              TEXT        NOT NULL DEFAULT 'Regular' CHECK (tipo IN ('Regular','Invitado','Agremiado')),
    url_cedula        TEXT,
    url_titulo        TEXT,
    url_cv            TEXT,
    creado_en         TEXT        NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ','now')),
    CONSTRAINT fk_estudiante_agremiado FOREIGN KEY (id_agremiado) REFERENCES agremiados(id_agremiado) ON DELETE SET NULL
  )`,

  `CREATE INDEX IF NOT EXISTS idx_estudiantes_email ON estudiantes(email)`,
  `CREATE INDEX IF NOT EXISTS idx_estudiantes_cedula ON estudiantes(cedula_rif)`,

  `CREATE TABLE IF NOT EXISTS verificaciones_email (
    id          INTEGER  PRIMARY KEY,
    email       TEXT     NOT NULL,
    token       TEXT     NOT NULL UNIQUE,
    expira_en   TEXT     NOT NULL,
    usado       INTEGER  NOT NULL DEFAULT 0 CHECK (usado IN (0, 1)),
    creado_en   TEXT     NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ','now'))
  )`,

  `CREATE TABLE IF NOT EXISTS verificaciones_preinscripciones (
    id                  INTEGER  PRIMARY KEY,
    token_verificacion  TEXT     NOT NULL UNIQUE,
    email               TEXT     NOT NULL,
    nombre_completo     TEXT     NOT NULL,
    cedula_rif          TEXT,
    telefono            TEXT,
    programa_codigo     TEXT NOT NULL
                      CHECK (programa_codigo IN ('PADI','PEGI','PREANI','CIBIR', 'AFILIACION')),
    tipo_afiliado       TEXT NOT NULL DEFAULT 'Natural',
    -- Campos opcionales: solo aplican a personas naturales / no-corporativos
    nivel_profesional   TEXT
                      CHECK (nivel_profesional IS NULL OR nivel_profesional IN ('Bachiller','TSU','Universitario','Postgrado')),
    es_corredor_inmobiliario INTEGER
                      CHECK (es_corredor_inmobiliario IS NULL OR es_corredor_inmobiliario IN (0, 1)),
    -- Campos exclusivos para Corporativo
    razon_social        TEXT,
    representante_legal TEXT,
    url_cedula          TEXT,
    url_titulo          TEXT,
    url_cv              TEXT,
    id_agremiado_corp   INTEGER, -- Link a la empresa que invita
    fecha_expiracion    TEXT NOT NULL,
    creado_en           TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ','now'))
  )`,

  `CREATE INDEX IF NOT EXISTS idx_verif_preinsc_email_programa
    ON verificaciones_preinscripciones(email, programa_codigo)`,

  // ── Tabla de autenticación (usuarios del sistema) ───────────────────────────
  `CREATE TABLE IF NOT EXISTS users (
    id            INTEGER  PRIMARY KEY,
    email         TEXT     NOT NULL UNIQUE,
    password_hash TEXT     NOT NULL,
    rol           TEXT     NOT NULL DEFAULT 'estudiante',
    roles         TEXT     NOT NULL DEFAULT '["estudiante"]',
    id_agremiado  INTEGER  REFERENCES agremiados(id_agremiado) ON DELETE SET NULL,
    reset_token   TEXT,
    reset_token_expira TEXT,
    activo        INTEGER  NOT NULL DEFAULT 1 CHECK (activo IN (0, 1)),
    creado_en     TEXT     NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ','now'))
  )`,

  `CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)`,

  // ───────────────────────────────────────────────────────────────────────────
  // FASE 2 — ACADEMIA (CURSOS, COHORTES, INSCRIPCIONES)
  // ───────────────────────────────────────────────────────────────────────────
  `CREATE TABLE IF NOT EXISTS instructores (
    id_instructor       INTEGER     PRIMARY KEY,
    nombre              TEXT        NOT NULL,
    especialidad        TEXT,
    email               TEXT,
    activo              INTEGER     NOT NULL DEFAULT 1 CHECK (activo IN (0, 1))
  )`,

  `CREATE TABLE IF NOT EXISTS cursos (
    id_curso            INTEGER     PRIMARY KEY,
    id_instructor       INTEGER,
    nombre              TEXT        NOT NULL,
    descripcion         TEXT,
    programa_codigo     TEXT        CHECK (programa_codigo IN ('PADI','PEGI','PREANI','CIBIR','AFILIACION')),
    nivel_academico     TEXT,
    precio              REAL,
    imagen_url          TEXT,
    creado_en           TEXT        NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ','now')),
    actualizado_en      TEXT,
    cupos_totales       INTEGER     NOT NULL CHECK (cupos_totales > 0),
    cupos_disponibles   INTEGER     NOT NULL CHECK (cupos_disponibles >= 0),
    fecha_inicio        TEXT,
    fecha_fin           TEXT,
    estatus             TEXT        NOT NULL DEFAULT 'Abierto'
                        CHECK (estatus IN ('Abierto','Cerrado','En curso')),
    CONSTRAINT chk_cupos CHECK (cupos_disponibles <= cupos_totales),
    CONSTRAINT fk_curso_instructor
      FOREIGN KEY (id_instructor) REFERENCES instructores(id_instructor)
      ON DELETE RESTRICT ON UPDATE CASCADE
  )`,

  `CREATE INDEX IF NOT EXISTS idx_cursos_instructor ON cursos(id_instructor)`,
  `CREATE INDEX IF NOT EXISTS idx_cursos_estatus    ON cursos(estatus)`,

  `CREATE TABLE IF NOT EXISTS inscripciones_academicas (
    id_inscripcion      INTEGER     PRIMARY KEY,
    id_agremiado        INTEGER     NOT NULL,
    id_curso            INTEGER     NOT NULL,
    fecha_inscripcion   TEXT        NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ','now')),
    estatus             TEXT        NOT NULL DEFAULT 'Inscrito'
                        CHECK (estatus IN ('Inscrito','En curso','Completado','Abandonado')),
    CONSTRAINT uq_inscripcion UNIQUE (id_agremiado, id_curso),
    CONSTRAINT fk_inscripcion_agremiado
      FOREIGN KEY (id_agremiado) REFERENCES agremiados(id_agremiado)
      ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_inscripcion_curso
      FOREIGN KEY (id_curso) REFERENCES cursos(id_curso)
      ON DELETE RESTRICT ON UPDATE CASCADE
  )`,

  `CREATE INDEX IF NOT EXISTS idx_inscripciones_agremiado ON inscripciones_academicas(id_agremiado)`,
  `CREATE INDEX IF NOT EXISTS idx_inscripciones_curso     ON inscripciones_academicas(id_curso)`,

  // ── Inscripciones (estudiantes) — permite Preinscripción y control admin ─────
  `CREATE TABLE IF NOT EXISTS inscripciones_cursos (
    id_inscripcion     INTEGER     PRIMARY KEY,
    id_estudiante      INTEGER     NOT NULL,
    id_curso           INTEGER, -- si todavía es solo preinscripción por programa, puede ser NULL
    programa_codigo    TEXT,    -- 'PADI' | 'PEGI' | 'PREANI' | 'CIBIR' | 'AFILIACION' (catálogo público)
    tipo_inscripcion   TEXT      NOT NULL DEFAULT 'cohorte'
                      CHECK (tipo_inscripcion IN ('programa','cohorte')),
    estatus            TEXT      NOT NULL DEFAULT 'Preinscrito'
                      CHECK (estatus IN ('Preinscrito','Entrevista','Inscrito','Rechazado','Cancelado')),
    entrevista_fecha   TEXT,
    entrevista_hora    TEXT,
    entrevista_lugar   TEXT,
    entrevista_estatus TEXT      NOT NULL DEFAULT 'Pendiente'
                      CHECK (entrevista_estatus IN ('Pendiente','Realizada','Cancelada')),
    nota_admin         TEXT,
    asignado_por       INTEGER, -- users.id
    aprobado_por       INTEGER, -- users.id
    id_agremiado_corp  INTEGER, -- Link a la empresa (para AFILIACION_CORP)
    creado_en          TEXT      NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ','now')),
    actualizado_en     TEXT,
    pago_comprobante   TEXT,
    monto_pagado       REAL,
    referencia_pago    TEXT,
    completado         INTEGER   NOT NULL DEFAULT 0 CHECK (completado IN (0, 1)),
    CONSTRAINT fk_insc_estudiante
      FOREIGN KEY (id_estudiante) REFERENCES estudiantes(id_estudiante)
      ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_insc_curso
      FOREIGN KEY (id_curso) REFERENCES cursos(id_curso)
      ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_insc_asignado_por
      FOREIGN KEY (asignado_por) REFERENCES users(id)
      ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT fk_insc_aprobado_por
      FOREIGN KEY (aprobado_por) REFERENCES users(id)
      ON DELETE SET NULL ON UPDATE CASCADE
  )`,

  `CREATE TABLE IF NOT EXISTS convalidaciones_ciebo (
    id_convalidacion    INTEGER     PRIMARY KEY,
    id_estudiante       INTEGER     NOT NULL,
    modulo_numero       INTEGER     NOT NULL CHECK (modulo_numero BETWEEN 1 AND 5),
    estatus             TEXT        NOT NULL DEFAULT 'Convalidado'
                        CHECK (estatus IN ('Pendiente','Cursado','Convalidado')),
    fecha_registro      TEXT        NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ','now')),
    registrado_por      INTEGER,    -- users.id
    CONSTRAINT fk_conv_estudiante
      FOREIGN KEY (id_estudiante) REFERENCES estudiantes(id_estudiante)
      ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_conv_registrado_por
      FOREIGN KEY (registrado_por) REFERENCES users(id)
      ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT uq_convalidacion UNIQUE (id_estudiante, modulo_numero)
  )`,

  `CREATE TABLE IF NOT EXISTS certificados (
    id_certificado      INTEGER     PRIMARY KEY,
    id_agremiado        INTEGER     NOT NULL,
    id_curso            INTEGER     NOT NULL,
    codigo_verificacion TEXT        NOT NULL UNIQUE,
    url_descarga        TEXT,
    fecha_emision       TEXT        NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ','now')),
    CONSTRAINT fk_cert_agremiado FOREIGN KEY (id_agremiado) REFERENCES agremiados(id_agremiado) ON DELETE RESTRICT,
    CONSTRAINT fk_cert_curso FOREIGN KEY (id_curso) REFERENCES cursos(id_curso) ON DELETE RESTRICT
  )`,

  // ───────────────────────────────────────────────────────────────────────────
  // FASE 3 — ADMINISTRACIÓN, PAGOS Y SOLVENCIAS
  // ─────────────────────────────────────────────────────────────────────────
  `CREATE TABLE IF NOT EXISTS cuotas_contables (
    id_cuota            INTEGER     PRIMARY KEY,
    id_agremiado        INTEGER     NOT NULL,
    descripcion         TEXT        NOT NULL,
    monto               REAL        NOT NULL,
    fecha_vencimiento   TEXT,
    pagado              INTEGER     NOT NULL DEFAULT 0 CHECK (pagado IN (0, 1)),
    fecha_pago          TEXT,
    CONSTRAINT fk_cuota_agremiado FOREIGN KEY (id_agremiado) REFERENCES agremiados(id_agremiado) ON DELETE CASCADE
  )`,

  `CREATE TABLE IF NOT EXISTS transacciones_pagos (
    id_pago             INTEGER     PRIMARY KEY,
    id_agremiado        INTEGER     NOT NULL,
    monto               REAL        NOT NULL,
    metodo_pago         TEXT,
    referencia          TEXT,
    fecha_pago          TEXT        NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ','now')),
    url_comprobante     TEXT,
    estatus             TEXT        NOT NULL DEFAULT 'Pendiente'
                        CHECK (estatus IN ('Pendiente','Validado','Rechazado')),
    CONSTRAINT fk_pago_agremiado FOREIGN KEY (id_agremiado) REFERENCES agremiados(id_agremiado) ON DELETE CASCADE
  )`,

  `CREATE TABLE IF NOT EXISTS solvencias (
    id_solvencia        INTEGER     PRIMARY KEY,
    id_agremiado        INTEGER     NOT NULL,
    fecha_emision       TEXT        NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ','now')),
    fecha_expiracion    TEXT,
    codigo_verificacion TEXT        UNIQUE,
    CONSTRAINT fk_solvencia_agremiado FOREIGN KEY (id_agremiado) REFERENCES agremiados(id_agremiado) ON DELETE CASCADE
  )`,

  // ───────────────────────────────────────────────────────────────────────────
  // FASE 4 — TRIBUNAL DISCIPLINARIO (DENUNCIAS, EVIDENCIAS)
  // ─────────────────────────────────────────────────────────────────────────
  `CREATE TABLE IF NOT EXISTS denuncias (
    id_denuncia         INTEGER     PRIMARY KEY,
    id_denunciante      INTEGER,    -- puede ser agremiado o externo
    nombre_denunciante  TEXT,
    id_denunciado       INTEGER     NOT NULL, -- agremiado denunciado
    descripcion         TEXT        NOT NULL,
    fecha_denuncia      TEXT        NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ','now')),
    estatus             TEXT        NOT NULL DEFAULT 'Recibida'
                        CHECK (estatus IN ('Recibida','En Investigación','Cerrada','Sanción')),
    CONSTRAINT fk_denuncia_denunciado FOREIGN KEY (id_denunciado) REFERENCES agremiados(id_agremiado) ON DELETE CASCADE
  )`,

  `CREATE TABLE IF NOT EXISTS evidencias_legales (
    id_evidencia        INTEGER     PRIMARY KEY,
    id_denuncia         INTEGER     NOT NULL,
    titulo              TEXT,
    url_archivo         TEXT        NOT NULL,
    creado_en           TEXT        NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ','now')),
    CONSTRAINT fk_evidencia_denuncia FOREIGN KEY (id_denuncia) REFERENCES denuncias(id_denuncia) ON DELETE CASCADE
  )`,

  // ───────────────────────────────────────────────────────────────────────────
  // FASE 5 — GESTIÓN GREMIAL (PLANES, ACTAS)
  // ─────────────────────────────────────────────────────────────────────────
  `CREATE TABLE IF NOT EXISTS planes_gestion (
    id_plan             INTEGER     PRIMARY KEY,
    titulo              TEXT        NOT NULL,
    contenido           TEXT,
    periodo             TEXT,
    estatus             TEXT        NOT NULL DEFAULT 'Activo'
                        CHECK (estatus IN ('Activo','Finalizado'))
  )`,

  `CREATE TABLE IF NOT EXISTS actas_y_convocatorias (
    id_documento        INTEGER     PRIMARY KEY,
    titulo              TEXT        NOT NULL,
    tipo                TEXT        NOT NULL
                        CHECK (tipo IN ('Acta','Convocatoria')),
    url_archivo         TEXT,
    fecha_documento     TEXT        NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ','now')),
    publico             INTEGER     NOT NULL DEFAULT 1 CHECK (publico IN (0, 1))
  )`,

  // ───────────────────────────────────────────────────────────────────────────
  // FASE 6 — CMS Y PORTAL PÚBLICO
  // ─────────────────────────────────────────────────────────────────────────
  `CREATE TABLE IF NOT EXISTS cms_noticias (
    id_noticia      INTEGER  PRIMARY KEY,
    titulo          TEXT     NOT NULL,
    contenido       TEXT     NOT NULL,
    imagen_url      TEXT,
    publicado       INTEGER  NOT NULL DEFAULT 0 CHECK (publicado IN (0, 1)),
    creado_en       TEXT     NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ','now'))
  )`,

  `CREATE TABLE IF NOT EXISTS cms_cursos (
    id_cms_curso    INTEGER  PRIMARY KEY,
    id_curso        INTEGER  REFERENCES cursos(id_curso) ON DELETE CASCADE,
    slug            TEXT     UNIQUE NOT NULL,
    destacado       INTEGER  NOT NULL DEFAULT 0 CHECK (destacado IN (0, 1))
  )`,

  `CREATE TABLE IF NOT EXISTS cms_convenios (
    id_convenio     INTEGER  PRIMARY KEY,
    nombre_aliado   TEXT     NOT NULL,
    descripcion     TEXT,
    logo_url        TEXT,
    link_web        TEXT
  )`,

  `CREATE TABLE IF NOT EXISTS cms_directiva (
    id_miembro      INTEGER  PRIMARY KEY,
    nombre          TEXT     NOT NULL,
    cargo           TEXT     NOT NULL,
    foto_url        TEXT,
    orden           INTEGER  DEFAULT 0
  )`,

  `CREATE TABLE IF NOT EXISTS cms_hitos (
    id_hito         INTEGER  PRIMARY KEY,
    anio            INTEGER  NOT NULL,
    titulo          TEXT     NOT NULL,
    descripcion     TEXT
  )`,

  `CREATE TABLE IF NOT EXISTS cms_normativas (
    id_normativa    INTEGER  PRIMARY KEY,
    titulo          TEXT     NOT NULL,
    url_archivo     TEXT     NOT NULL,
    tipo            TEXT     CHECK (tipo IN ('Estatutos','Reglamento','Ley')),
    creado_en       TEXT     NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ','now'))
  )`,

  `CREATE TABLE IF NOT EXISTS cms_configuracion (
    clave         TEXT     PRIMARY KEY,
    valor         TEXT     NOT NULL,
    descripcion   TEXT
  )`,

  `CREATE TABLE IF NOT EXISTS cms_paginas (
    slug            TEXT     PRIMARY KEY,
    contenido       TEXT     NOT NULL,
    actualizado_en  TEXT     NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ','now'))
  )`,

  `CREATE INDEX IF NOT EXISTS idx_cms_paginas_actualizado ON cms_paginas(actualizado_en)`,

  // Migraciones manuales para campos de redes sociales (agremiados)
  `ALTER TABLE agremiados ADD COLUMN instagram TEXT`,
  `ALTER TABLE agremiados ADD COLUMN facebook TEXT`,
  `ALTER TABLE agremiados ADD COLUMN linkedin TEXT`,
  `ALTER TABLE agremiados ADD COLUMN twitter TEXT`,
  `ALTER TABLE agremiados ADD COLUMN website TEXT`,
  `ALTER TABLE agremiados ADD COLUMN activo INTEGER NOT NULL DEFAULT 1 CHECK (activo IN (0, 1))`
]

const RESET_SCHEMA =
  process.env.INITDB_RESET === '1' ||
  process.argv.includes('--reset') ||
  process.argv.includes('reset')

/** Orden: hijas primero (FK), para que DROP funcione aunque foreign_keys esté mal soportado en remoto. */
const DROP_TABLE_ORDER = [
  'certificados',
  'evidencias_legales',
  'transacciones_pagos',
  'inscripciones_cursos',
  'denuncias',
  'inscripciones_academicas',
  'cuotas_contables',
  'solvencias',
  'planes_gestion',
  'estudiantes',
  'users',
  'verificaciones_email',
  'verificaciones_preinscripciones',
  'cursos',
  'cms_noticias',
  'cms_cursos',
  'cms_convenios',
  'cms_directiva',
  'cms_hitos',
  'cms_normativas',
  'cms_configuracion',
  'cms_paginas',
  'actas_y_convocatorias',
  'agremiados',
  'instructores',
] as const

async function dropAllUserTables(): Promise<void> {
  console.log('INITDB_RESET: eliminando tablas existentes (PRAGMA foreign_keys=OFF)...\n')
  await db.execute('PRAGMA foreign_keys = OFF')
  for (const name of DROP_TABLE_ORDER) {
    const safe = name.replace(/"/g, '""')
    await db.execute({ sql: `DROP TABLE IF EXISTS "${safe}"`, args: [] })
    console.log(`  · dropped ${name}`)
  }
  // Cualquier tabla huérfana que no esté en la lista (p. ej. migraciones futuras)
  const { rows } = await db.execute({
    sql: `SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%'`,
    args: [],
  })
  for (const row of rows) {
    const name = String((row as unknown as { name: unknown }).name)
    if (DROP_TABLE_ORDER.includes(name as (typeof DROP_TABLE_ORDER)[number])) continue
    const safe = name.replace(/"/g, '""')
    await db.execute({ sql: `DROP TABLE IF EXISTS "${safe}"`, args: [] })
    console.log(`  · dropped ${name} (extra)`)
  }
  await db.execute('PRAGMA foreign_keys = ON')
  console.log('')
}

async function run(): Promise<void> {
  console.log('--- TURSO DB INITIALIZATION ---\n')

  if (RESET_SCHEMA) {
    await dropAllUserTables()
  }

  for (const sql of statements) {
    try {
      await db.execute(sql)
      const label = sql.trim().split('\n')[0].replace('`', '').trim()
      console.log(`  · OK: ${label.substring(0, 60)}${label.length > 60 ? '...' : ''}`)
    } catch (e: any) {
      if (e.message?.includes('already exists') || e.message?.includes('duplicate column name')) {
        // Ignorar si ya existe
      } else {
        console.warn(`  · FAIL: ${sql.substring(0, 50)}... -> ${e.message}`)
      }
    }
  }

  // SEMILLAS / DATOS INICIALES
  console.log('\n--- SEEDING INITIAL DATA ---')

  // 1. Admin inicial
  const adminEmail = 'admin@admin.com'
  const adminPass = await bcrypt.hash('admin123', 10)
  try {
    await db.execute({
      sql: `INSERT INTO users (email, password_hash, rol, roles) VALUES (?, ?, 'admin', '["admin", "superadmin"]')`,
      args: [adminEmail, adminPass],
    })
    console.log(`  · User ${adminEmail} created.`)
  } catch (e) {
    console.log(`  · User ${adminEmail} already exists.`)
  }

  // 2. Instructor inicial
  try {
    await db.execute({
      sql: `INSERT INTO instructores (id_instructor, nombre, especialidad, email) VALUES (1, 'CIBIR Admin', 'Administración Gremial', 'academia@cibir.com')`,
      args: [],
    })
    console.log(`  · Instructor 1 created.`)
  } catch (e) {
    console.log(`  · Instructor 1 already exists.`)
  }

  console.log('\nDB Initialization complete!\n')
}

run().catch(console.error)
