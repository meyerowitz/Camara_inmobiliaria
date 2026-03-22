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
 */

import { db } from '../lib/db.js'

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
    cedula_rif                  TEXT        UNIQUE NOT NULL,
    nombre_completo             TEXT        NOT NULL,
    email                       TEXT        UNIQUE NOT NULL,
    telefono                    TEXT,
    estatus                     TEXT        NOT NULL DEFAULT 'Preinscrito'
                                CHECK (estatus IN ('Preinscrito','CIBIR','Moroso','Suspendido')),
    fecha_registro              TEXT        NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ','now')),
    fecha_ultimo_cambio_estatus TEXT,
    CONSTRAINT chk_email_formato CHECK (email LIKE '%@%.%')
  )`,

  // ===========================================================
  // FASE 1 — MÓDULO ACADÉMICO Y DE FORMACIÓN
  // ===========================================================
  `CREATE TABLE IF NOT EXISTS instructores (
    id_instructor   INTEGER     PRIMARY KEY,
    nombre          TEXT        NOT NULL,
    especialidad    TEXT,
    email           TEXT        UNIQUE,
    activo          INTEGER     NOT NULL DEFAULT 1
                    CHECK (activo IN (0, 1))
  )`,

  `CREATE TABLE IF NOT EXISTS cursos (
    id_curso            INTEGER     PRIMARY KEY,
    id_instructor       INTEGER     NOT NULL,
    nombre              TEXT        NOT NULL,
    descripcion         TEXT,
    nivel_academico     TEXT,
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

  `CREATE TABLE IF NOT EXISTS certificados (
    id_certificado      INTEGER     PRIMARY KEY,
    id_inscripcion      INTEGER     NOT NULL UNIQUE,
    codigo_validacion   TEXT        UNIQUE NOT NULL,
    fecha_emision       TEXT        NOT NULL,
    url_documento       TEXT,
    CONSTRAINT fk_certificado_inscripcion
      FOREIGN KEY (id_inscripcion) REFERENCES inscripciones_academicas(id_inscripcion)
      ON DELETE RESTRICT ON UPDATE CASCADE
  )`,

  // ===========================================================
  // FASE 2 — MÓDULO CONTABLE Y FINANCIERO
  // ===========================================================
  `CREATE TABLE IF NOT EXISTS cuotas_contables (
    id_cuota            INTEGER     PRIMARY KEY,
    id_agremiado        INTEGER     NOT NULL,
    monto_usd           NUMERIC     NOT NULL CHECK (monto_usd > 0),
    concepto            TEXT        NOT NULL,
    fecha_emision       TEXT        NOT NULL,
    fecha_vencimiento   TEXT        NOT NULL,
    estatus             TEXT        NOT NULL DEFAULT 'Pendiente'
                        CHECK (estatus IN ('Pendiente','Pagado','Moroso')),
    CONSTRAINT fk_cuota_agremiado
      FOREIGN KEY (id_agremiado) REFERENCES agremiados(id_agremiado)
      ON DELETE RESTRICT ON UPDATE CASCADE
  )`,

  `CREATE INDEX IF NOT EXISTS idx_cuotas_agremiado ON cuotas_contables(id_agremiado)`,
  `CREATE INDEX IF NOT EXISTS idx_cuotas_estatus   ON cuotas_contables(estatus)`,

  `CREATE TABLE IF NOT EXISTS transacciones_pagos (
    id_pago             INTEGER     PRIMARY KEY,
    id_cuota            INTEGER     NOT NULL,
    monto_pagado_usd    NUMERIC     NOT NULL CHECK (monto_pagado_usd > 0),
    fecha_pago          TEXT        NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ','now')),
    estatus_validacion  TEXT        NOT NULL DEFAULT 'En revisión'
                        CHECK (estatus_validacion IN ('En revisión','Validado','Rechazado')),
    referencia_bancaria TEXT,
    notas_validacion    TEXT,
    CONSTRAINT fk_pago_cuota
      FOREIGN KEY (id_cuota) REFERENCES cuotas_contables(id_cuota)
      ON DELETE RESTRICT ON UPDATE CASCADE
  )`,

  `CREATE INDEX IF NOT EXISTS idx_pagos_cuota ON transacciones_pagos(id_cuota)`,

  `CREATE TABLE IF NOT EXISTS solvencias (
    id_solvencia        INTEGER     PRIMARY KEY,
    id_agremiado        INTEGER     NOT NULL,
    codigo_verificacion TEXT        UNIQUE NOT NULL,
    fecha_emision       TEXT        NOT NULL,
    fecha_vencimiento   TEXT        NOT NULL,
    estatus             TEXT        NOT NULL DEFAULT 'Vigente'
                        CHECK (estatus IN ('Vigente','Vencida','Anulada')),
    CONSTRAINT fk_solvencia_agremiado
      FOREIGN KEY (id_agremiado) REFERENCES agremiados(id_agremiado)
      ON DELETE RESTRICT ON UPDATE CASCADE
  )`,

  `CREATE INDEX IF NOT EXISTS idx_solvencias_agremiado ON solvencias(id_agremiado)`,

  // ===========================================================
  // FASE 2 — MÓDULO DE DENUNCIAS Y ÉTICA
  // ===========================================================
  `CREATE TABLE IF NOT EXISTS denuncias (
    id_denuncia         INTEGER     PRIMARY KEY,
    id_denunciante      INTEGER     NOT NULL,
    id_denunciado       INTEGER     NOT NULL,
    numero_expediente   TEXT        UNIQUE,
    descripcion         TEXT        NOT NULL,
    estatus             TEXT        NOT NULL DEFAULT 'Recepción'
                        CHECK (estatus IN ('Recepción','En Tribunal Disciplinario','Resuelta')),
    sla_fecha_limite    TEXT        NOT NULL,
    resolucion          TEXT,
    fecha_resolucion    TEXT,
    fecha_creacion      TEXT        NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ','now')),
    CONSTRAINT chk_denuncia_distintos CHECK (id_denunciante != id_denunciado),
    CONSTRAINT fk_denuncia_denunciante
      FOREIGN KEY (id_denunciante) REFERENCES agremiados(id_agremiado)
      ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_denuncia_denunciado
      FOREIGN KEY (id_denunciado) REFERENCES agremiados(id_agremiado)
      ON DELETE RESTRICT ON UPDATE CASCADE
  )`,

  `CREATE INDEX IF NOT EXISTS idx_denuncias_denunciante ON denuncias(id_denunciante)`,
  `CREATE INDEX IF NOT EXISTS idx_denuncias_denunciado  ON denuncias(id_denunciado)`,
  `CREATE INDEX IF NOT EXISTS idx_denuncias_estatus     ON denuncias(estatus)`,

  `CREATE TABLE IF NOT EXISTS evidencias_legales (
    id_evidencia    INTEGER     PRIMARY KEY,
    id_denuncia     INTEGER     NOT NULL,
    tipo_documento  TEXT        NOT NULL
                    CHECK (tipo_documento IN ('Documento','Transcripcion Textual')),
    url_archivo     TEXT        NOT NULL,
    descripcion     TEXT,
    fecha_carga     TEXT        NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ','now')),
    CONSTRAINT fk_evidencia_denuncia
      FOREIGN KEY (id_denuncia) REFERENCES denuncias(id_denuncia)
      ON DELETE CASCADE ON UPDATE CASCADE
  )`,

  `CREATE INDEX IF NOT EXISTS idx_evidencias_denuncia ON evidencias_legales(id_denuncia)`,

  // ===========================================================
  // FASE 2 — MÓDULO DE CONTROL ESTRATÉGICO Y DOCUMENTAL
  // ===========================================================
  `CREATE TABLE IF NOT EXISTS planes_gestion (
    id_plan         INTEGER     PRIMARY KEY,
    tipo_plan       TEXT        NOT NULL
                    CHECK (tipo_plan IN ('Trimestral','Semestral','Anual')),
    periodo         INTEGER     NOT NULL,
    metas           TEXT        NOT NULL,
    indicadores     TEXT        NOT NULL,
    variables       TEXT,
    fecha_inicio    TEXT        NOT NULL,
    fecha_fin       TEXT        NOT NULL,
    registrado_por  INTEGER,
    CONSTRAINT chk_plan_fechas CHECK (fecha_fin > fecha_inicio),
    CONSTRAINT fk_plan_registrado
      FOREIGN KEY (registrado_por) REFERENCES agremiados(id_agremiado)
      ON DELETE SET NULL ON UPDATE CASCADE
  )`,

  `CREATE TABLE IF NOT EXISTS actas_y_convocatorias (
    id_documento        INTEGER     PRIMARY KEY,
    tipo_registro       TEXT        NOT NULL
                        CHECK (tipo_registro IN (
                          'Acta Constitutiva',
                          'Modificacion Estatutaria',
                          'Asamblea',
                          'Convocatoria'
                        )),
    titulo              TEXT        NOT NULL,
    url_documento       TEXT        NOT NULL,
    fecha_publicacion   TEXT        NOT NULL,
    fecha_evento        TEXT,
    es_publico          INTEGER     NOT NULL DEFAULT 1
                        CHECK (es_publico IN (0, 1))
  )`,

  `CREATE INDEX IF NOT EXISTS idx_actas_tipo ON actas_y_convocatorias(tipo_registro)`
]

async function initDb(): Promise<void> {
  console.log('Iniciando creación del esquema en Turso...\n')

  await db.execute('PRAGMA foreign_keys = ON')

  const schemaBatch = statements
    .filter(s => !s.startsWith('PRAGMA'))
    .map(sql => ({ sql, args: [] as [] }))

  await db.batch(schemaBatch, 'write')

  console.log('Esquema creado correctamente.\n')
  console.log('Tablas disponibles:')

  const { rows } = await db.execute(
    `SELECT name FROM sqlite_master WHERE type='table' ORDER BY name`
  )

  for (const row of rows) {
    console.log(`  · ${row.name}`)
  }

  console.log('\nBase de datos lista.')
}

initDb().catch((err) => {
  console.error('Error al inicializar la base de datos:', err)
  process.exit(1)
})
