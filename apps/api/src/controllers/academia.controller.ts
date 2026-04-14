import { Request, Response } from 'express'
import { db } from '../lib/db.js'
import { requireAuth, requireRole } from '../middlewares/auth.middleware.js'

const MAIN_PROGRAM_CODES = new Set(['PADI', 'PEGI', 'PREANI', 'CIBIR'])

function normalizeProgramaCodigo(value: unknown): string | null {
  if (typeof value !== 'string') return null
  const code = value.trim().toUpperCase()
  return MAIN_PROGRAM_CODES.has(code) ? code : null
}

async function upsertEstudianteByEmail(params: {
  nombreCompleto: string
  cedulaRif?: string | null
  email: string
  telefono?: string | null
  tipo?: 'Regular' | 'Agremiado'
}): Promise<{ id_estudiante: number }> {
  const { nombreCompleto, cedulaRif, email, telefono, tipo } = params

  const existing = await db.execute({
    sql: `SELECT id_estudiante FROM estudiantes WHERE email = ? LIMIT 1`,
    args: [email],
  })
  if (existing.rows[0]?.id_estudiante) {
    const id = existing.rows[0].id_estudiante as number
    await db.execute({
      sql: `UPDATE estudiantes
            SET nombre_completo = COALESCE(?, nombre_completo),
                cedula_rif = COALESCE(?, cedula_rif),
                telefono = COALESCE(?, telefono),
                tipo = COALESCE(?, tipo),
                actualizado_en = ?
            WHERE id_estudiante = ?`,
      args: [
        nombreCompleto || null,
        cedulaRif ?? null,
        telefono ?? null,
        tipo ?? null,
        new Date().toISOString(),
        id,
      ],
    })
    return { id_estudiante: id }
  }

  const inserted = await db.execute({
    sql: `INSERT INTO estudiantes (cedula_rif, nombre_completo, email, telefono, tipo)
          VALUES (?, ?, ?, ?, ?) RETURNING id_estudiante`,
    args: [cedulaRif ?? null, nombreCompleto, email, telefono ?? null, tipo ?? 'Regular'],
  })
  return { id_estudiante: inserted.rows[0].id_estudiante as number }
}

/**
 * POST /api/public/preinscripciones
 * Preinscripción pública obligatoria para programas principales (PADI/PEGI/PREANI/CIBIR).
 * - Crea o actualiza el estudiante por email (upsert)
 * - Crea la inscripción con estatus 'Preinscrito' y tipo_inscripcion='programa'
 * - Si ya existe una preinscripción activa (no rechazada/cancelada), informa al usuario
 */
export const publicPreinscribirProgramaPrincipal = async (req: Request, res: Response): Promise<void> => {
  try {
    const programaCodigo = normalizeProgramaCodigo(req.body?.programaCodigo)
    const nombreCompleto = typeof req.body?.nombreCompleto === 'string' ? req.body.nombreCompleto.trim() : ''
    const cedulaRif = typeof req.body?.cedulaRif === 'string' ? req.body.cedulaRif.trim() : null
    const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : ''
    const telefono = typeof req.body?.telefono === 'string' ? req.body.telefono.trim() : null

    if (!programaCodigo) {
      res.status(400).json({ success: false, message: 'programaCodigo inválido. Use PADI/PEGI/PREANI/CIBIR.' })
      return
    }
    if (!nombreCompleto || !email) {
      res.status(400).json({ success: false, message: 'nombreCompleto y email son requeridos' })
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      res.status(400).json({ success: false, message: 'El formato del email no es válido' })
      return
    }

    // Upsert estudiante por email
    const { id_estudiante } = await upsertEstudianteByEmail({
      nombreCompleto,
      cedulaRif,
      email,
      telefono,
      tipo: 'Regular',
    })

    // Verificar si ya tiene una preinscripción activa para este programa
    const existing = await db.execute({
      sql: `SELECT id_inscripcion, estatus FROM inscripciones_cursos
            WHERE id_estudiante = ? AND programa_codigo = ? AND id_curso IS NULL
            LIMIT 1`,
      args: [id_estudiante, programaCodigo],
    })

    if (existing.rows.length > 0) {
      const prev = existing.rows[0] as any
      if (prev.estatus === 'Preinscrito') {
        res.status(409).json({
          success: false,
          message: `Ya tienes una solicitud de preinscripción al ${programaCodigo} en espera de aprobación.`,
        })
        return
      }
      if (prev.estatus === 'Inscrito') {
        res.status(409).json({
          success: false,
          message: `Ya fuiste admitido al programa ${programaCodigo}.`,
        })
        return
      }
      // Si está Rechazado o Cancelado, permitir volver a inscribirse
    }

    const now = new Date().toISOString()
    const result = await db.execute({
      sql: `INSERT INTO inscripciones_cursos
              (id_estudiante, id_curso, programa_codigo, tipo_inscripcion, estatus, creado_en, actualizado_en)
            VALUES (?, NULL, ?, 'programa', 'Preinscrito', ?, ?)
            ON CONFLICT DO UPDATE SET
              estatus = 'Preinscrito',
              tipo_inscripcion = 'programa',
              actualizado_en = excluded.actualizado_en
            RETURNING *`,
      args: [id_estudiante, programaCodigo, now, now],
    })

    res.status(201).json({
      success: true,
      message: 'Preinscripción registrada correctamente. Un administrador debe aprobarla para formalizar la inscripción.',
      data: result.rows[0],
    })
  } catch (error) {
    console.error('publicPreinscribirProgramaPrincipal:', error)
    res.status(500).json({ success: false, message: 'Error al procesar la preinscripción' })
  }
}

/**
 * GET /api/public/cursos
 * Lista pública de todos los cursos disponibles o próximos.
 */
export const publicListCursos = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await db.execute({
      sql: `SELECT c.*, i.nombre as instructor_nombre
            FROM cursos c
            LEFT JOIN instructores i ON i.id_instructor = c.id_instructor
            WHERE c.estatus IN ('Abierto', 'Próximamente')
            ORDER BY c.id_curso DESC`,
      args: [],
    })
    res.json({ success: true, data: result.rows })
  } catch (error) {
    console.error('publicListCursos:', error)
    res.status(500).json({ success: false, message: 'Error al obtener el catálogo de cursos' })
  }
}

/**
 * POST /api/public/cursos/:id/preinscribir
 * Preinscripción a un curso o taller específico.
 */
export const publicPreinscribirCurso = async (req: Request, res: Response): Promise<void> => {
  try {
    const idCurso = Number(req.params.id)
    if (!Number.isFinite(idCurso)) {
      res.status(400).json({ success: false, message: 'id de curso inválido' })
      return
    }

    const nombreCompleto = typeof req.body?.nombreCompleto === 'string' ? req.body.nombreCompleto.trim() : ''
    const cedulaRif = typeof req.body?.cedulaRif === 'string' ? req.body.cedulaRif.trim() : null
    const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : ''
    const telefono = typeof req.body?.telefono === 'string' ? req.body.telefono.trim() : null

    if (!nombreCompleto || !email) {
      res.status(400).json({ success: false, message: 'nombreCompleto y email son requeridos' })
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      res.status(400).json({ success: false, message: 'El formato del email no es válido' })
      return
    }

    // Verificar que el curso exista y esté Abierto o Próximamente
    const cursoRes = await db.execute({
      sql: `SELECT id_curso, estatus FROM cursos WHERE id_curso = ? LIMIT 1`,
      args: [idCurso],
    })
    if (cursoRes.rows.length === 0) {
      res.status(404).json({ success: false, message: 'Curso no encontrado' })
      return
    }
    const curso = cursoRes.rows[0] as any
    if (curso.estatus !== 'Abierto' && curso.estatus !== 'Próximamente') {
      res.status(400).json({ success: false, message: 'El curso no está disponible para inscripciones' })
      return
    }

    // Upsert estudiante por email
    const { id_estudiante } = await upsertEstudianteByEmail({
      nombreCompleto,
      cedulaRif,
      email,
      telefono,
      tipo: 'Regular',
    })

    // Verificar si ya tiene una inscripción a este curso
    const existing = await db.execute({
      sql: `SELECT id_inscripcion, estatus FROM inscripciones_cursos
            WHERE id_estudiante = ? AND id_curso = ?
            LIMIT 1`,
      args: [id_estudiante, idCurso],
    })

    if (existing.rows.length > 0) {
      const prev = existing.rows[0] as any
      if (prev.estatus === 'Preinscrito') {
        res.status(409).json({ success: false, message: 'Ya posees una solicitud de inscripción enviada para este curso.' })
        return
      }
      if (prev.estatus === 'Inscrito') {
        res.status(409).json({ success: false, message: 'Ya te encuentras formalmente inscrito en este curso.' })
        return
      }
    }

    const now = new Date().toISOString()
    const result = await db.execute({
      sql: `INSERT INTO inscripciones_cursos
              (id_estudiante, id_curso, programa_codigo, tipo_inscripcion, estatus, creado_en, actualizado_en)
            VALUES (?, ?, NULL, 'cohorte', 'Preinscrito', ?, ?)
            ON CONFLICT DO UPDATE SET
              estatus = 'Preinscrito',
              tipo_inscripcion = 'cohorte',
              actualizado_en = excluded.actualizado_en
            RETURNING *`,
      args: [id_estudiante, idCurso, now, now],
    })

    res.status(201).json({
      success: true,
      message: 'Inscripción procesada. Pronto nos pondremos en contacto.',
      data: result.rows[0],
    })
  } catch (error) {
    console.error('publicPreinscribirCurso:', error)
    res.status(500).json({ success: false, message: 'Error al procesar la inscripción' })
  }
}


/**
 * GET /api/academia/cursos?estatus=Abierto&programaCodigo=PADI
 * Lista cursos/cohortes académicos — panel admin.
 */
export const adminListCursos = async (req: Request, res: Response): Promise<void> => {
  try {
    const estatus = typeof req.query?.estatus === 'string' ? req.query.estatus : undefined
    const programaCodigo = typeof req.query?.programaCodigo === 'string' ? req.query.programaCodigo.toUpperCase() : undefined
    const allowedEstatus = new Set(['Abierto', 'Cerrado', 'En curso'])

    const whereParts: string[] = []
    const args: any[] = []

    if (estatus && allowedEstatus.has(estatus)) {
      whereParts.push('c.estatus = ?')
      args.push(estatus)
    }
    if (programaCodigo) {
      whereParts.push('c.programa_codigo = ?')
      args.push(programaCodigo)
    }

    const where = whereParts.length ? `WHERE ${whereParts.join(' AND ')}` : ''

    const result = await db.execute({
      sql: `SELECT c.*, i.nombre as instructor_nombre
            FROM cursos c
            LEFT JOIN instructores i ON i.id_instructor = c.id_instructor
            ${where}
            ORDER BY c.id_curso DESC`,
      args,
    })
    res.json({ success: true, data: result.rows })
  } catch (error) {
    console.error('adminListCursos:', error)
    res.status(500).json({ success: false, message: 'Error al obtener cursos' })
  }
}

/**
 * POST /api/academia/cursos
 * Crea un nuevo curso/cohorte desde el panel admin.
 */
export const adminCreateCurso = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      nombre,
      descripcion,
      programa_codigo,
      nivel_academico,
      cupos_totales,
      fecha_inicio,
      fecha_fin,
      precio,
      imagen_url,
      estatus,
      id_instructor,
    } = req.body

    if (!nombre || !cupos_totales) {
      res.status(400).json({ success: false, message: 'nombre y cupos_totales son requeridos' })
      return
    }

    const cupos = Number(cupos_totales)
    if (!Number.isFinite(cupos) || cupos <= 0) {
      res.status(400).json({ success: false, message: 'cupos_totales debe ser un número positivo' })
      return
    }

    // Si no se pasa instructor, usar el id=1 por defecto
    const instructorId = Number(id_instructor) || 1

    const now = new Date().toISOString()
    const result = await db.execute({
      sql: `INSERT INTO cursos (
              id_instructor, nombre, descripcion, programa_codigo, nivel_academico,
              cupos_totales, cupos_disponibles, fecha_inicio, fecha_fin,
              precio, imagen_url, estatus, creado_en, actualizado_en
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            RETURNING *`,
      args: [
        instructorId,
        nombre.trim(),
        descripcion ?? null,
        programa_codigo ? String(programa_codigo).toUpperCase() : null,
        nivel_academico ?? null,
        cupos,
        cupos, // cupos_disponibles = cupos_totales al crear
        fecha_inicio ?? null,
        fecha_fin ?? null,
        precio ?? null,
        imagen_url ?? null,
        estatus ?? 'Abierto',
        now,
        now,
      ],
    })

    res.status(201).json({ success: true, data: result.rows[0] })
  } catch (error) {
    console.error('adminCreateCurso:', error)
    res.status(500).json({ success: false, message: 'Error al crear curso' })
  }
}

/**
 * PUT /api/academia/cursos/:id
 * Actualiza un curso/cohorte existente.
 */
export const adminUpdateCurso = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = Number(req.params.id)
    if (!Number.isFinite(id)) {
      res.status(400).json({ success: false, message: 'id inválido' })
      return
    }

    const {
      nombre,
      descripcion,
      programa_codigo,
      nivel_academico,
      cupos_totales,
      cupos_disponibles,
      fecha_inicio,
      fecha_fin,
      precio,
      imagen_url,
      estatus,
      id_instructor,
    } = req.body

    const now = new Date().toISOString()
    const result = await db.execute({
      sql: `UPDATE cursos SET
              nombre = COALESCE(?, nombre),
              descripcion = ?,
              programa_codigo = ?,
              nivel_academico = ?,
              cupos_totales = COALESCE(?, cupos_totales),
              cupos_disponibles = COALESCE(?, cupos_disponibles),
              fecha_inicio = ?,
              fecha_fin = ?,
              precio = ?,
              imagen_url = COALESCE(?, imagen_url),
              estatus = COALESCE(?, estatus),
              id_instructor = COALESCE(?, id_instructor),
              actualizado_en = ?
            WHERE id_curso = ?
            RETURNING *`,
      args: [
        nombre ?? null,
        descripcion ?? null,
        programa_codigo ? String(programa_codigo).toUpperCase() : null,
        nivel_academico ?? null,
        cupos_totales != null ? Number(cupos_totales) : null,
        cupos_disponibles != null ? Number(cupos_disponibles) : null,
        fecha_inicio ?? null,
        fecha_fin ?? null,
        precio ?? null,
        imagen_url ?? null,
        estatus ?? null,
        id_instructor != null ? Number(id_instructor) : null,
        now,
        id,
      ],
    })

    if (result.rows.length === 0) {
      res.status(404).json({ success: false, message: 'Curso no encontrado' })
      return
    }
    res.json({ success: true, data: result.rows[0] })
  } catch (error) {
    console.error('adminUpdateCurso:', error)
    res.status(500).json({ success: false, message: 'Error al actualizar curso' })
  }
}

/**
 * DELETE /api/academia/cursos/:id
 * Soft-delete: marca el curso como 'Cerrado'. Preserva inscripciones históricas.
 */
export const adminDeleteCurso = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = Number(req.params.id)
    if (!Number.isFinite(id)) {
      res.status(400).json({ success: false, message: 'id inválido' })
      return
    }

    const inscritos = await db.execute({
      sql: `SELECT COUNT(*) as c FROM inscripciones_cursos WHERE id_curso = ? AND estatus = 'Inscrito'`,
      args: [id],
    })
    const count = Number((inscritos.rows[0] as any)?.c ?? 0)
    if (count > 0) {
      res.status(409).json({
        success: false,
        message: `No se puede eliminar: hay ${count} estudiante(s) inscrito(s) en este curso.`,
      })
      return
    }

    await db.execute({
      sql: `UPDATE cursos SET estatus = 'Cerrado', actualizado_en = ? WHERE id_curso = ?`,
      args: [new Date().toISOString(), id],
    })
    res.json({ success: true, message: 'Curso cerrado correctamente.' })
  } catch (error) {
    console.error('adminDeleteCurso:', error)
    res.status(500).json({ success: false, message: 'Error al cerrar curso' })
  }
}



export const adminListPreinscripciones = async (req: Request, res: Response): Promise<void> => {
  try {
    const programaCodigo = normalizeProgramaCodigo(req.query?.programaCodigo)
    const cursoId = req.query?.cursoId ? Number(req.query.cursoId) : null
    const estatus = typeof req.query?.estatus === 'string' ? req.query.estatus : 'Preinscrito'
    const allowedStatus = new Set(['Todos', 'Preinscrito', 'Inscrito', 'Rechazado', 'Cancelado'])
    if (!allowedStatus.has(estatus)) {
      res.status(400).json({ success: false, message: 'estatus inválido' })
      return
    }

    const baseWhere: string[] = []
    const countArgs: any[] = []

    if (cursoId) {
      baseWhere.push('ic.id_curso = ?')
      countArgs.push(cursoId)
    } else {
      baseWhere.push('ic.id_curso IS NULL')
      if (programaCodigo) {
        baseWhere.push('ic.programa_codigo = ?')
        countArgs.push(programaCodigo)
      } else {
        baseWhere.push('ic.programa_codigo IS NOT NULL')
      }
    }

    // Get counts
    const countsResult = await db.execute({
      sql: `SELECT ic.estatus, COUNT(*) as c FROM inscripciones_cursos ic WHERE ${baseWhere.join(' AND ')} GROUP BY ic.estatus`,
      args: countArgs,
    })
    
    const counts = { Todos: 0, Pendiente: 0, Aprobado: 0, Rechazado: 0, Cancelado: 0 }
    countsResult.rows.forEach((r: any) => {
      const c = Number(r.c)
      counts.Todos += c
      if (r.estatus === 'Preinscrito') counts.Pendiente += c
      else if (r.estatus === 'Inscrito') counts.Aprobado += c
      else if (r.estatus === 'Rechazado') counts.Rechazado += c
      else if (r.estatus === 'Cancelado') counts.Cancelado += c
    })

    const whereParts = [...baseWhere]
    const args = [...countArgs]
    if (estatus !== 'Todos') {
      whereParts.push('ic.estatus = ?')
      // Original estatus for db lookup (UI translates Pendiente -> Preinscrito, etc but we assume UI sends exact DB estatus or we map it)
      // Wait, UI will map "Pendiente" to "Preinscrito" in its internal state, so the URL query sends 'Preinscrito'.
      args.push(estatus)
    }

    const result = await db.execute({
      sql: `
        SELECT
          ic.*,
          e.nombre_completo as estudiante_nombre,
          e.email as estudiante_email,
          e.telefono as estudiante_telefono,
          e.cedula_rif as estudiante_cedula_rif
        FROM inscripciones_cursos ic
        JOIN estudiantes e ON e.id_estudiante = ic.id_estudiante
        WHERE ${whereParts.join(' AND ')}
        ORDER BY ic.creado_en DESC
      `,
      args,
    })

    res.json({ success: true, data: result.rows, meta: { counts } })
  } catch (error) {
    console.error('adminListPreinscripciones:', error)
    res.status(500).json({ success: false, message: 'Error al obtener preinscripciones' })
  }
}

/**
 * POST /api/academia/cursos/:id_curso/asignar
 * Carga/Asignación manual: el admin asigna un estudiante a un curso abierto.
 */
export const adminAsignarEstudianteACurso = async (req: Request, res: Response): Promise<void> => {
  try {
    const idCurso = Number(req.params.id_curso)
    if (!Number.isFinite(idCurso)) {
      res.status(400).json({ success: false, message: 'id_curso inválido' })
      return
    }

    const nombreCompleto = typeof req.body?.nombreCompleto === 'string' ? req.body.nombreCompleto.trim() : ''
    const cedulaRif = typeof req.body?.cedulaRif === 'string' ? req.body.cedulaRif.trim() : null
    const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : ''
    const telefono = typeof req.body?.telefono === 'string' ? req.body.telefono.trim() : null

    if (!nombreCompleto || !email) {
      res.status(400).json({ success: false, message: 'nombreCompleto y email son requeridos' })
      return
    }

    // validar curso abierto y cupos
    const cursoRes = await db.execute({
      sql: `SELECT id_curso, cupos_disponibles, estatus FROM cursos WHERE id_curso = ? LIMIT 1`,
      args: [idCurso],
    })
    const curso = cursoRes.rows[0] as any
    if (!curso) {
      res.status(404).json({ success: false, message: 'Curso no encontrado' })
      return
    }
    if (curso.estatus !== 'Abierto') {
      res.status(400).json({ success: false, message: 'El curso no está abierto' })
      return
    }
    if ((curso.cupos_disponibles as number) <= 0) {
      res.status(400).json({ success: false, message: 'No hay cupos disponibles' })
      return
    }

    const { id_estudiante } = await upsertEstudianteByEmail({
      nombreCompleto,
      cedulaRif,
      email,
      telefono,
      tipo: 'Regular',
    })

    const now = new Date().toISOString()

    await db.batch(
      [
        {
          sql: `INSERT INTO inscripciones_cursos (id_estudiante, id_curso, estatus, asignado_por, aprobado_por, creado_en, actualizado_en)
                VALUES (?, ?, 'Inscrito', ?, ?, ?, ?)
                ON CONFLICT DO UPDATE SET
                  estatus='Inscrito',
                  asignado_por=excluded.asignado_por,
                  aprobado_por=excluded.aprobado_por,
                  actualizado_en=excluded.actualizado_en`,
          args: [id_estudiante, idCurso, req.user?.id ?? null, req.user?.id ?? null, now, now],
        },
        {
          sql: `UPDATE cursos SET cupos_disponibles = cupos_disponibles - 1
                WHERE id_curso = ? AND cupos_disponibles > 0`,
          args: [idCurso],
        },
      ],
      'write'
    )

    res.status(201).json({ success: true, message: 'Estudiante asignado e inscrito en el curso.' })
  } catch (error) {
    console.error('adminAsignarEstudianteACurso:', error)
    res.status(500).json({ success: false, message: 'Error al asignar estudiante' })
  }
}

/**
 * PATCH /api/academia/inscripciones/:id/aprobar
 */
export const adminAprobarPreinscripcion = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = Number(req.params.id)
    if (!Number.isFinite(id)) {
      res.status(400).json({ success: false, message: 'id inválido' })
      return
    }

    const now = new Date().toISOString()
    const result = await db.execute({
      sql: `UPDATE inscripciones_cursos
            SET estatus='Inscrito', aprobado_por=?, actualizado_en=?
            WHERE id_inscripcion=? AND estatus='Preinscrito'
            RETURNING *`,
      args: [req.user?.id ?? null, now, id],
    })

    if (result.rows.length === 0) {
      res.status(404).json({ success: false, message: 'Preinscripción no encontrada o ya procesada' })
      return
    }

    // Si tiene id_curso, descontar cupo disponible
    const rows = result.rows[0] as any
    if (rows.id_curso) {
      await db.execute({
        sql: `UPDATE cursos SET cupos_disponibles = cupos_disponibles - 1 WHERE id_curso = ? AND cupos_disponibles > 0`,
        args: [rows.id_curso],
      })
    }

    res.json({ success: true, message: 'Preinscripción aprobada.', data: result.rows[0] })
  } catch (error) {
    console.error('adminAprobarPreinscripcion:', error)
    res.status(500).json({ success: false, message: 'Error al aprobar preinscripción' })
  }
}

/**
 * PATCH /api/academia/inscripciones/:id/rechazar
 */
export const adminRechazarPreinscripcion = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = Number(req.params.id)
    if (!Number.isFinite(id)) {
      res.status(400).json({ success: false, message: 'id inválido' })
      return
    }
    const notaAdmin = typeof req.body?.notaAdmin === 'string' ? req.body.notaAdmin.trim() : null
    const now = new Date().toISOString()
    
    // Primero, obtener el estado actual para ver si estaba 'Inscrito' previamente y devolver cupo
    const current = await db.execute({
        sql: `SELECT estatus, id_curso FROM inscripciones_cursos WHERE id_inscripcion=?`,
        args: [id]
    });

    const result = await db.execute({
      sql: `UPDATE inscripciones_cursos
            SET estatus='Rechazado', nota_admin=COALESCE(?, nota_admin), aprobado_por=?, actualizado_en=?
            WHERE id_inscripcion=? AND estatus IN ('Preinscrito', 'Inscrito')
            RETURNING *`,
      args: [notaAdmin, req.user?.id ?? null, now, id],
    })
    
    if (result.rows.length === 0) {
      res.status(404).json({ success: false, message: 'Preinscripción no encontrada o ya procesada' })
      return
    }

    // Si pasó de Inscrito a Rechazado, devolver el cupo
    if (current.rows.length > 0 && current.rows[0].estatus === 'Inscrito' && current.rows[0].id_curso) {
      await db.execute({
        sql: `UPDATE cursos SET cupos_disponibles = cupos_disponibles + 1 WHERE id_curso = ?`,
        args: [current.rows[0].id_curso],
      })
    }

    res.json({ success: true, message: 'Preinscripción rechazada.', data: result.rows[0] })
  } catch (error) {
    console.error('adminRechazarPreinscripcion:', error)
    res.status(500).json({ success: false, message: 'Error al rechazar preinscripción' })
  }
}

/**
 * PATCH /api/academia/inscripciones/:id/completar
 * Marca un curso como completado por el estudiante.
 */
export const adminCompletarCursoEstudiante = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = Number(req.params.id)
    if (!Number.isFinite(id)) {
      res.status(400).json({ success: false, message: 'id inválido' })
      return
    }
    const result = await db.execute({
      sql: `UPDATE inscripciones_cursos
            SET completado=1, actualizado_en=?
            WHERE id_inscripcion=? AND estatus='Inscrito'
            RETURNING *`,
      args: [new Date().toISOString(), id],
    })
    if (result.rows.length === 0) {
      res.status(404).json({ success: false, message: 'Inscripción no encontrada o estudiante no está inscrito' })
      return
    }
    res.json({ success: true, message: 'Estudiante marcado como completado.', data: result.rows[0] })
  } catch (error) {
    console.error('adminCompletarCursoEstudiante:', error)
    res.status(500).json({ success: false, message: 'Error al actualizar inscripción' })
  }
}

/**
 * GET /api/academia/estudiantes?query=
 * Lista estudiantes (admin). Pensado para panel "Estudiantes Regulares".
 */
export const adminListEstudiantes = async (req: Request, res: Response): Promise<void> => {
  try {
    const query = typeof req.query?.query === 'string' ? req.query.query.trim().toLowerCase() : ''

    const where = query
      ? `WHERE (lower(nombre_completo) LIKE ? OR lower(email) LIKE ? OR lower(COALESCE(cedula_rif,'')) LIKE ?)`
      : ''
    const args = query ? [`%${query}%`, `%${query}%`, `%${query}%`] : []

    const result = await db.execute({
      sql: `
        SELECT id_estudiante, id_agremiado, cedula_rif, nombre_completo, email, telefono, tipo, creado_en, actualizado_en
        FROM estudiantes
        ${where}
        ORDER BY creado_en DESC
        LIMIT 250
      `,
      args,
    })

    res.json({ success: true, data: result.rows })
  } catch (error) {
    console.error('adminListEstudiantes:', error)
    res.status(500).json({ success: false, message: 'Error al obtener estudiantes' })
  }
}

/**
 * GET /api/academia/estudiantes/:id
 * Devuelve estudiante + sus inscripciones (programa o curso).
 */
export const adminGetEstudiante = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = Number(req.params.id)
    if (!Number.isFinite(id)) {
      res.status(400).json({ success: false, message: 'id inválido' })
      return
    }

    const est = await db.execute({
      sql: `SELECT * FROM estudiantes WHERE id_estudiante = ? LIMIT 1`,
      args: [id],
    })
    if (est.rows.length === 0) {
      res.status(404).json({ success: false, message: 'Estudiante no encontrado' })
      return
    }

    const insc = await db.execute({
      sql: `
        SELECT
          ic.*,
          c.nombre as curso_nombre,
          c.estatus as curso_estatus
        FROM inscripciones_cursos ic
        LEFT JOIN cursos c ON c.id_curso = ic.id_curso
        WHERE ic.id_estudiante = ?
        ORDER BY ic.creado_en DESC
      `,
      args: [id],
    })

    res.json({ success: true, data: { estudiante: est.rows[0], inscripciones: insc.rows } })
  } catch (error) {
    console.error('adminGetEstudiante:', error)
    res.status(500).json({ success: false, message: 'Error al obtener estudiante' })
  }
}

/**
 * Helpers re-exported to keep route files small.
 */
export const academiaAdminGuards = [requireAuth, requireRole('admin', 'super_admin')] as const

