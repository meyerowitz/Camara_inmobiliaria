import { Request, Response } from 'express';
import { randomUUID } from 'crypto';
import { db } from '../lib/db.js';
import { generarCredenciales } from '../lib/credentials.js';
import {
  enviarCorreoVerificacion,
  enviarCorreoAprobacion,
  notificarAdminNuevaAfiliacion,
  enviarCorreoInvitacionCorporativa
} from '../lib/email.js';
import { crearVerificacionPreinscripcionPrograma } from './academia.controller.js';
import bcrypt from 'bcryptjs';

/**
 * GET /api/afiliados/:id
 * Obtiene un agremiado por ID. Protegido por auth.
 * Un afiliado solo puede ver sus propios datos; los admins pueden ver cualquiera.
 */
/**
 * GET /api/afiliados/me/certificados
 * Lista comprobantes digitales del agremiado autenticado (vinculación por id_agremiado o email).
 */
export const getMisCertificados = async (req: Request, res: Response): Promise<void> => {
  try {
    const idAgremiado = req.user!.id_agremiado
    const userEmail = (req.user!.email ?? '').trim().toLowerCase()

    if (idAgremiado == null && !userEmail) {
      res.json({ success: true, data: [] })
      return
    }

    const result = await db.execute({
      sql: `
        SELECT
          c.id_certificado,
          c.codigo_validacion,
          c.fecha_emision,
          ic.id_inscripcion,
          ic.programa_codigo,
          ic.tipo_inscripcion,
          ic.estatus AS inscripcion_estatus,
          ic.completado,
          cu.nombre AS curso_nombre,
          e.nombre_completo AS estudiante_nombre
        FROM certificados c
        JOIN inscripciones_cursos ic ON ic.id_inscripcion = c.id_inscripcion
        JOIN estudiantes e ON e.id_estudiante = ic.id_estudiante
        LEFT JOIN cursos cu ON cu.id_curso = ic.id_curso
        WHERE (
          (? <> '' AND LOWER(TRIM(e.email)) = ?)
          OR (? IS NOT NULL AND e.id_agremiado = ?)
          OR (? IS NOT NULL AND EXISTS (
            SELECT 1 FROM agremiados ag
            WHERE ag.id_agremiado = ? AND LOWER(TRIM(ag.email)) = LOWER(TRIM(e.email))
          ))
        )
        ORDER BY c.fecha_emision DESC
      `,
      args: [userEmail, userEmail, idAgremiado, idAgremiado, idAgremiado, idAgremiado],
    })

    res.json({ success: true, data: result.rows })
  } catch (error) {
    console.error('getMisCertificados:', error)
    res.status(500).json({ success: false, message: 'Error al obtener certificados' })
  }
}

export const getAfiliadoById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const requesterId = req.user!.id_agremiado
    const requesterRol = req.user!.rol

    // Afiliados solo pueden consultar su propio registro
    if (requesterRol !== 'admin' && requesterId !== Number(id)) {
      res.status(403).json({ success: false, message: 'Acceso denegado' })
      return
    }

    const result = await db.execute({
      sql: `SELECT id_agremiado, nombre_completo, email, cedula_rif, telefono,
                   estatus, codigo_cibir, fecha_registro, inscripcion_pagada,
                   tipo_afiliado, razon_social,
                   url_cedula, url_titulo, url_cv
            FROM agremiados WHERE id_agremiado = ?`,
      args: [Number(id)],
    })

    if (result.rows.length === 0) {
      res.status(404).json({ success: false, message: 'Agremiado no encontrado' })
      return
    }

    res.status(200).json({ success: true, data: result.rows[0] })
  } catch (error) {
    console.error('Error en getAfiliadoById:', error)
    res.status(500).json({ success: false, message: 'Error interno del servidor' })
  }
};



export const registerAfiliado = async (req: Request, res: Response) => {
  try {
    const { 
      nombreCompleto, 
      email, 
      cedulaRif, 
      telefono,
      razonSocial,
      nombres,
      apellidos,
      cedulaPersonal,
      direccion,
      fechaNacimiento,
      nivelAcademico,
      notas
    } = req.body;

    // Validación básica
    if (!nombreCompleto || !email || !cedulaRif || !telefono) {
      return res.status(400).json({ 
        success: false, 
        message: 'Los campos básicos son requeridos (nombreCompleto, email, cedulaRif, telefono)' 
      });
    }

    // Verificar si ya existe en agremiados (email o cedula)
    const existeAgremiado = await db.execute({
      sql: `SELECT id_agremiado FROM agremiados WHERE email = ? OR cedula_rif = ?`,
      args: [email, cedulaRif]
    });

    if (existeAgremiado.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'El email o la cédula/RIF ya se encuentran registrados en el sistema.'
      });
    }

    // Verificar si ya tiene una verificación pendiente y eliminarla para usar una nueva
    const existeVerificacion = await db.execute({
      sql: `SELECT token_verificacion, fecha_expiracion FROM verificaciones_email WHERE email = ? OR cedula_rif = ?`,
      args: [email, cedulaRif]
    });

    if (existeVerificacion.rows.length > 0) {
      await db.execute({
        sql: `DELETE FROM verificaciones_email WHERE email = ? OR cedula_rif = ?`,
        args: [email, cedulaRif]
      });
    }

    // Crear token de validación
    const token = randomUUID();
    const expiracion = new Date();
    expiracion.setHours(expiracion.getHours() + 24);
    const fechaExpiracionStr = expiracion.toISOString();

    // Insertar en tabla de verificaciones
    await db.execute({
      sql: `INSERT INTO verificaciones_email (
              token_verificacion, 
              nombre_completo, 
              cedula_rif, 
              email, 
              telefono, 
              fecha_expiracion
            ) VALUES (?, ?, ?, ?, ?, ?)`,
      args: [token, nombreCompleto, cedulaRif, email, telefono, fechaExpiracionStr]
    });

    // NOTA: Para no romper el esquema de verificaciones_email (que es temporal), 
    // podríamos guardar el resto en una tabla meta o simplemente permitir que se completen después.
    // Por ahora, asumiremos que los campos extra se guardan si existen en req.body para el paso final.

    // 4. Enviar email con Resend
    await enviarCorreoVerificacion(nombreCompleto, email, token);

    return res.status(201).json({
      success: true,
      message: 'Te hemos enviado un correo de comprobación. Por favor revisa tu bandeja de entrada o SPAM.'
    });

  } catch (error) {
    console.error('Error en registerAfiliado:', error);
    if (res.headersSent) return;
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor al procesar el registro'
    });
  }
};

export const verificarEmail = async (req: Request, res: Response) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ success: false, message: 'Token es requerido' });
    }

    // Buscar token en verificaciones_email
    const verificacion = await db.execute({
      sql: `SELECT * FROM verificaciones_email WHERE token_verificacion = ?`,
      args: [token]
    });

    if (verificacion.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Token inválido o no encontrado' });
    }

    const registro = verificacion.rows[0];
    const fechaExpiracion = new Date(registro.fecha_expiracion as string);

    if (fechaExpiracion < new Date()) {
      return res.status(400).json({ success: false, message: 'El token ha expirado. Debes registrarte nuevamente.' });
    }

    // Idempotencia: si el agremiado ya existe (por intento previo o doble request),
    // consideramos la verificación exitosa y limpiamos el token.
    const yaExiste = await db.execute({
      sql: `SELECT * FROM agremiados WHERE email = ? OR cedula_rif = ? LIMIT 1`,
      args: [registro.email, registro.cedula_rif],
    });
    if (yaExiste.rows.length > 0) {
      await db.execute({
        sql: `DELETE FROM verificaciones_email WHERE token_verificacion = ?`,
        args: [token]
      });
      return res.status(200).json({
        success: true,
        message: 'El correo ya había sido verificado previamente',
        data: yaExiste.rows[0],
      });
    }

    // Insertar en agremiados
    const estatus = '1_SOLICITUD';
    const cibir = null;

    try {
      const insertResult = await db.execute({
        sql: `INSERT INTO agremiados (
                nombre_completo, 
                email, 
                cedula_rif, 
                telefono, 
                estatus, 
                codigo_cibir
              ) VALUES (?, ?, ?, ?, ?, ?) RETURNING *`,
        args: [registro.nombre_completo, registro.email, registro.cedula_rif, registro.telefono, estatus, cibir]
      });

      const newAfiliado = insertResult.rows[0];

      // Eliminar el token usado
      await db.execute({
        sql: `DELETE FROM verificaciones_email WHERE token_verificacion = ?`,
        args: [token]
      });

      // Notificar al admin
      notificarAdminNuevaAfiliacion({
        nombre: registro.nombre_completo as string,
        email: registro.email as string,
        cedulaRif: registro.cedula_rif as string,
        telefono: registro.telefono as string
      }).catch(e => console.error('Error notificando admin (afiliación):', e));

      return res.status(201).json({
        success: true,
        message: 'Correo verificado y candidato registrado exitosamente',
        data: newAfiliado
      });

    } catch (dbError: any) {
      const errorMsg = dbError.message || '';
      if (errorMsg.includes('UNIQUE constraint failed')) {
        return res.status(409).json({ success: false, message: 'El email o la cédula ya han sido registrados.' });
      }
      throw dbError;
    }

  } catch (error) {
    console.error('Error en verificarEmail:', error);
    if (res.headersSent) return;
    return res.status(500).json({ success: false, message: 'Error interno al verificar correo' });
  }
};

export const getAfiliados = async (req: Request, res: Response) => {
  try {
    const { estatus, tipo_afiliado } = req.query;

    let sql = 'SELECT * FROM agremiados';
    const args: any[] = [];
    const whereClauses: string[] = [];

    if (estatus) {
      whereClauses.push('estatus = ?');
      args.push(estatus as string);
    }
    
    if (tipo_afiliado) {
      whereClauses.push('tipo_afiliado = ?');
      args.push(tipo_afiliado as string);
    }

    if (whereClauses.length > 0) {
      sql += ' WHERE ' + whereClauses.join(' AND ');
    }
    
    // Ordenar por fecha de registro descendente por defecto
    sql += ' ORDER BY fecha_registro DESC';

    const result = await db.execute({ sql, args });

    return res.status(200).json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Error en getAfiliados:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor al obtener la lista de afiliados'
    });
  }
};

export const aprobarAfiliado = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;

    // 1. Verificar si existe y si su estatus es Preinscrito
    const resultAgremiado = await db.execute({
      sql: 'SELECT * FROM agremiados WHERE id_agremiado = ?',
      args: [id]
    });

    const agremiado = resultAgremiado.rows[0];

    if (!agremiado) {
      return res.status(404).json({
        success: false,
        message: 'El candidato no fue encontrado'
      });
    }

    if (agremiado.estatus !== '6_JUNTA_DIRECTIVA' && agremiado.estatus !== '1_SOLICITUD') {
      return res.status(400).json({
        success: false,
        message: 'El candidato debe estar en proceso de aprobación para ser aprobado'
      });
    }

    // 2. Generar el código CIBIR (CIBIR-YYYY-NNN) - Se mantiene como identificador
    const currentYear = new Date().getFullYear();
    const prefix = `CIBIR-${currentYear}-`;

    const resultUltimoCibir = await db.execute({
      sql: 'SELECT codigo_cibir FROM agremiados WHERE codigo_cibir LIKE ? ORDER BY codigo_cibir DESC LIMIT 1',
      args: [`${prefix}%`]
    });

    let correlativo = 1;
    if (resultUltimoCibir.rows.length > 0 && resultUltimoCibir.rows[0].codigo_cibir) {
      const lastCode = resultUltimoCibir.rows[0].codigo_cibir as string;
      const parts = lastCode.split('-');
      const lastNumber = parseInt(parts[2], 10);
      if (!isNaN(lastNumber)) {
        correlativo = lastNumber + 1;
      }
    }

    const codigoCibir = `${prefix}${correlativo.toString().padStart(3, '0')}`;

    // 3. Actualizar a estatus 7_RESULTADO (Aprobado)
    const fechaCambio = new Date().toISOString();
    
    const updateResult = await db.execute({
      sql: `UPDATE agremiados 
            SET estatus = '7_RESULTADO', codigo_cibir = ?, fecha_ultimo_cambio_estatus = ?
            WHERE id_agremiado = ? RETURNING *`,
      args: [codigoCibir, fechaCambio, id]
    });

    const afiliadoActualizado = updateResult.rows[0];

    // 4. Preparar acceso (Usuario + Token de Seguridad)
    try {
      if (agremiado.email) {
        const resetToken = randomUUID();
        const expiracion = new Date();
        expiracion.setHours(expiracion.getHours() + 48);
        const expStr = expiracion.toISOString();

        // Crear el usuario en estado "por configurar" (password aleatorio inútil)
        const placeholderPass = await bcrypt.hash(randomUUID(), 10);
        
        // Insertar o actualizar usuario con el token
        await db.execute({
          sql: `INSERT INTO users (email, password_hash, rol, id_agremiado, reset_token, reset_token_expira)
                VALUES (?, ?, 'afiliado', ?, ?, ?)
                ON CONFLICT(email) DO UPDATE SET 
                  id_agremiado = excluded.id_agremiado,
                  reset_token = excluded.reset_token, 
                  reset_token_expira = excluded.reset_token_expira`,
          args: [agremiado.email, placeholderPass, id, resetToken, expStr]
        });

        // Enviar Correo de Aprobación
        await enviarCorreoAprobacion(agremiado.nombre_completo as string, agremiado.email as string, resetToken);
      }
    } catch (err) {
      console.error('Error preparando acceso para afiliado:', err);
    }

    return res.status(200).json({
      success: true,
      message: 'Candidato aprobado y correo de bienvenida enviado',
      data: afiliadoActualizado
    });

  } catch (error) {
    console.error('Error al aprobar candidato:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor al aprobar al candidato'
    });
  }
};

export const rechazarAfiliado = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;

    // 1. Verificar si existe y si su estatus es Preinscrito
    const resultAgremiado = await db.execute({
      sql: 'SELECT * FROM agremiados WHERE id_agremiado = ?',
      args: [id]
    });

    const agremiado = resultAgremiado.rows[0];

    if (!agremiado) {
      return res.status(404).json({
        success: false,
        message: 'El candidato no fue encontrado'
      });
    }

    if (agremiado.estatus === '9_AFILIACION') {
      return res.status(400).json({
        success: false,
        message: 'No se puede rechazar a un afiliado activo'
      });
    }

    // 2. Actualizar a estatus Suspendido (ya que 'Rechazado' no está en el CHECK constraint original de initdb.ts)
    // En initdb.ts el estatus es CHECK (estatus IN ('Preinscrito','CIBIR','Moroso','Suspendido'))
    const fechaCambio = new Date().toISOString();
    
    // NOTA: Para no romper la DB actual cambiamos el estatus a 'Suspendido', mapeado como 'Rechazado' en la UI
    const updateResult = await db.execute({
      sql: `UPDATE agremiados 
            SET estatus = 'Suspendido', fecha_ultimo_cambio_estatus = ?
            WHERE id_agremiado = ? RETURNING *`,
      args: [fechaCambio, id]
    });

    return res.status(200).json({
      success: true,
      message: 'Candidato ha sido rechazado exitosamente',
      data: updateResult.rows[0]
    });

  } catch (error) {
    console.error('Error al rechazar candidato:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor al rechazar al candidato'
    });
  }
};

// ==========================================
// RUTAS PÚBLICAS
// ==========================================

export const buscarAfiliadosPublic = async (req: Request, res: Response) => {
  try {
    // REGLA CRÍTICA: Añadida cedula_rif pública
    // REGLA DE FILTRO: Solo agremiados con estatus = 'CIBIR'.
    // Retornamos hasta 1000 afiliados (o todos) para que fuse.js en el frontend haga la búsqueda fuzzy y filtrado local sin saturar DB
    const result = await db.execute({
      sql: `
      SELECT id_agremiado, nombre_completo, nombres, apellidos, razon_social, codigo_cibir, cedula_rif, tipo_afiliado 
      FROM agremiados 
      WHERE estatus = '9_AFILIACION'
      ORDER BY nombre_completo ASC
    `,
      args: []
    });

    console.log(`[DEBUG] buscarAfiliadosPublic: Encontrados ${result.rows.length} afiliados activos.`);
    if (result.rows.length > 0) {
      console.log(`[DEBUG] Tipos encontrados:`, [...new Set(result.rows.map(r => r.tipo_afiliado))]);
    }

    // Transformamos la respuesta para simular foto generica y redes sociales temporalmente 
    const mappedData = result.rows.map((row) => ({
      ...row,
      // Usamos una API the ui-avatars para generar fotos genericas
      foto_url: `https://ui-avatars.com/api/?name=${encodeURIComponent(row.nombre_completo as string)}&background=047857&color=fff&size=200`,
      redes_sociales: {
        instagram: '',
        linkedin: '',
        facebook: ''
      }
    }));

    return res.status(200).json({
      success: true,
      data: mappedData
    });
  } catch (error) {
    console.error('Error en buscarAfiliadosPublic:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor al realizar la búsqueda pública'
    });
  }
};

// ==========================================
// NUEVO ENDPOINT PARA LA UI DE CIBIR (Tabs)
// ==========================================

export const getSolicitudesCibir = async (req: Request, res: Response) => {
  try {
    const tab = (req.query.tab as string) || 'todos'; // todos | pendiente | aprobado | rechazado

    // Mapeo de Tabs a los estados reales en BD
    // Pendiente -> Preinscrito
    // Aprobado -> CIBIR
    // Rechazado -> Suspendido (Para obedecer la base de datos estricta SQLite)
    
    // Primero, obtener los contadores para los badges de la UI
    const countSql = `
      SELECT 
        COUNT(*) as todos,
        SUM(CASE WHEN estatus NOT IN ('9_AFILIACION', 'Suspendido', 'Rechazado', 'Moroso') THEN 1 ELSE 0 END) as pendiente,
        SUM(CASE WHEN estatus = '9_AFILIACION' THEN 1 ELSE 0 END) as aprobado,
        SUM(CASE WHEN estatus IN ('Suspendido', 'Rechazado') THEN 1 ELSE 0 END) as rechazado
      FROM agremiados
    `;
    const countResult = await db.execute({ sql: countSql, args: [] });
    const counts = countResult.rows[0];

    // Luego, obtener la lista filtrada según el tab seleccionado
    let sql = `SELECT * FROM agremiados WHERE estatus IN ('Preinscrito', 'CIBIR', 'Suspendido')`;
    const args: any[] = [];

    if (tab === 'pendiente') {
      sql = `SELECT * FROM agremiados WHERE estatus NOT IN ('9_AFILIACION', 'Suspendido', 'Rechazado', 'Moroso')`;
    } else if (tab === 'aprobado') {
      sql = `SELECT * FROM agremiados WHERE estatus = '9_AFILIACION'`;
    } else if (tab === 'rechazado') {
      sql = `SELECT * FROM agremiados WHERE estatus IN ('Suspendido', 'Rechazado')`;
    }

    sql += ' ORDER BY fecha_registro DESC';

    const listResult = await db.execute({ sql, args });

    return res.status(200).json({
      success: true,
      meta: {
        counts: {
          todos: counts.todos || 0,
          pendiente: counts.pendiente || 0,
          aprobado: counts.aprobado || 0,
          rechazado: counts.rechazado || 0,
        }
      },
      data: listResult.rows
    });
  } catch (error) {
    console.error('Error al obtener solicitudes CIBIR:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor al obtener las solicitudes CIBIR'
    });
  }
};

// ==========================================
// FORMALIZACIÓN (PAGO) DE INSCRIPCIÓN CIBIR
// ==========================================

export const formalizarInscripcion = async (req: Request, res: Response) => {
  try {
    const requesterId = req.user!.id_agremiado;
    const { banco, referencia, monto } = req.body;

    if (!requesterId) {
      return res.status(403).json({ success: false, message: 'Usuario no autenticado o sin ID de agremiado' });
    }

    if (!banco || !referencia || !monto) {
      return res.status(400).json({ success: false, message: 'Todos los campos financieros son requeridos' });
    }

    // Actualizar agremiados para marcar inscripcion_pagada = 1
    await db.execute({
      sql: `UPDATE agremiados SET inscripcion_pagada = 1 WHERE id_agremiado = ?`,
      args: [requesterId]
    });

    return res.status(200).json({
      success: true,
      message: 'Inscripción formalizada exitosamente. El portal ha sido desbloqueado.'
    });
  } catch (error) {
    console.error('Error al formalizar la inscripción:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor al intentar formalizar el pago'
    });
  }
};

export const updateEstatusAfiliado = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { estatus, cibir_convalidado } = req.body;

    const allowedStatuses = [
      '1_SOLICITUD', '2_REQUISITOS', '3_CONFIRMACION', 
      '4_RECEPCION', '5_ENTREVISTA', '6_JUNTA_DIRECTIVA', 
      '7_RESULTADO', '8_FORMALIZACION', '9_AFILIACION',
      'Moroso', 'Suspendido', 'Rechazado'
    ];

    if (estatus && !allowedStatuses.includes(estatus)) {
      return res.status(400).json({ success: false, message: 'Estado no válido' });
    }

    const setParts: string[] = [];
    const args: any[] = [];

    if (estatus) {
      setParts.push('estatus = ?');
      args.push(estatus);
      setParts.push('fecha_ultimo_cambio_estatus = ?');
      args.push(new Date().toISOString());
    }

    if (cibir_convalidado !== undefined) {
      setParts.push('cibir_convalidado = ?');
      args.push(cibir_convalidado ? 1 : 0);
    }

    if (setParts.length === 0) {
      return res.status(400).json({ success: false, message: 'Nada que actualizar' });
    }

    args.push(Number(id));

    const result = await db.execute({
      sql: `UPDATE agremiados SET ${setParts.join(', ')} WHERE id_agremiado = ? RETURNING *`,
      args
    });

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Agremiado no encontrado' });
    }

    return res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error en updateEstatusAfiliado:', error);
    return res.status(500).json({ success: false, message: 'Error al actualizar estado' });
  }
};
export const updateAfiliado = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const fields = req.body;

    const allowedFields = [
      'nombre_completo', 'nombres', 'apellidos', 'cedula_rif', 
      'cedula_personal', 'email', 'telefono', 'razon_social',
      'direccion', 'fecha_nacimiento', 'nivel_academico', 'notas',
      'estatus', 'cibir_convalidado', 'inscripcion_pagada', 'tipo_afiliado',
      'url_cedula', 'url_titulo', 'url_cv'
    ];

    const setParts: string[] = [];
    const args: any[] = [];

    Object.keys(fields).forEach(key => {
      if (allowedFields.includes(key)) {
        setParts.push(`${key} = ?`);
        args.push(fields[key]);
      }
    });

    if (setParts.length === 0) {
      return res.status(400).json({ success: false, message: 'Nada que actualizar o campos no permitidos' });
    }

    // Siempre actualizar fecha de cambio si hay cambios
    setParts.push('fecha_ultimo_cambio_estatus = ?');
    args.push(new Date().toISOString());

    args.push(Number(id));

    const result = await db.execute({
      sql: `UPDATE agremiados SET ${setParts.join(', ')} WHERE id_agremiado = ? RETURNING *`,
      args
    });

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Agremiado no encontrado' });
    }

    return res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error en updateAfiliado:', error);
    return res.status(500).json({ success: false, message: 'Error al actualizar afiliado' });
  }
};

// ═══════════════════════════════════════════════════════════════════
// SISTEMA DE INVITACIONES CORPORATIVAS
// ═══════════════════════════════════════════════════════════════════

/**
 * POST /api/afiliados/:id/invitacion
 * Genera un link reutilizable de invitación para un afiliado corporativo.
 * Puede ser llamado por admin o por el propio agremiado corporativo.
 */
export const generarInvitacionCorporativa = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = Number(req.params.id)
    const requesterId = req.user?.id_agremiado
    const requesterRole = req.user?.rol

    if (requesterRole !== 'admin' && requesterRole !== 'super_admin' && requesterId !== id) {
      res.status(403).json({ success: false, message: 'No tienes permiso para generar invitaciones para esta empresa.' }); return
    }

    if (!Number.isFinite(id)) {
      res.status(400).json({ success: false, message: 'ID inválido' }); return
    }

    // Verificar que el agremiado existe y es Juridico
    const corp = await db.execute({
      sql: `SELECT id_agremiado, nombre_completo, razon_social, tipo_afiliado, estatus FROM agremiados WHERE id_agremiado = ? LIMIT 1`,
      args: [id]
    })
    if (corp.rows.length === 0) {
      res.status(404).json({ success: false, message: 'Afiliado corporativo no encontrado' }); return
    }
    const empresa = corp.rows[0] as any
    if (empresa.tipo_afiliado !== 'Juridico') {
      res.status(400).json({ success: false, message: 'Solo los afiliados corporativos pueden generar invitaciones' }); return
    }

    const token = randomUUID()
    const nombreEmpresa = empresa.razon_social || empresa.nombre_completo
    const diasExpiracion = req.body?.diasExpiracion ? Number(req.body.diasExpiracion) : null
    const fechaExpiracion = diasExpiracion
      ? new Date(Date.now() + diasExpiracion * 86400000).toISOString()
      : null

    await db.execute({
      sql: `INSERT INTO invitaciones_corporativas (id_agremiado_corp, token, nombre_empresa, activo, fecha_expiracion)
            VALUES (?, ?, ?, 1, ?)`,
      args: [id, token, nombreEmpresa, fechaExpiracion]
    })

    res.status(201).json({
      success: true,
      message: 'Link de invitación generado correctamente.',
      data: { token, nombreEmpresa, fechaExpiracion }
    })
  } catch (error) {
    console.error('generarInvitacionCorporativa:', error)
    res.status(500).json({ success: false, message: 'Error al generar invitación' })
  }
}

/**
 * GET /api/afiliados/:id/invitaciones
 * Lista todos los links de invitación de un afiliado corporativo.
 */
export const listarInvitacionesCorporativas = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = Number(req.params.id)
    const requesterId = req.user?.id_agremiado
    const requesterRole = req.user?.rol

    if (requesterRole !== 'admin' && requesterRole !== 'super_admin' && requesterId !== id) {
      res.status(403).json({ success: false, message: 'Acceso denegado.' }); return
    }

    const result = await db.execute({
      sql: `SELECT ic.*, 
              (SELECT COUNT(*) FROM agremiados WHERE id_agremiado_corp = ic.id_agremiado_corp) as total_afiliados
            FROM invitaciones_corporativas ic
            WHERE ic.id_agremiado_corp = ?
            ORDER BY ic.creado_en DESC`,
      args: [id]
    })
    res.json({ success: true, data: result.rows })
  } catch (error) {
    console.error('listarInvitacionesCorporativas:', error)
    res.status(500).json({ success: false, message: 'Error al listar invitaciones' })
  }
}

/**
 * DELETE /api/afiliados/:id/invitaciones/:tokenId
 * Desactiva (revoca) un link de invitación.
 */
export const revocarInvitacionCorporativa = async (req: Request, res: Response): Promise<void> => {
  try {
    const tokenId = Number(req.params.tokenId)
    await db.execute({
      sql: `UPDATE invitaciones_corporativas SET activo = 0 WHERE id_invitacion = ?`,
      args: [tokenId]
    })
    res.json({ success: true, message: 'Invitación revocada.' })
  } catch (error) {
    console.error('revocarInvitacionCorporativa:', error)
    res.status(500).json({ success: false, message: 'Error al revocar invitación' })
  }
}

/**
 * GET /api/afiliados/:id/afiliados-corp
 * Lista los afiliados individuales vinculados a un afiliado corporativo.
 */
export const listarAfiliadosCorporativos = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = Number(req.params.id)
    const requesterId = req.user?.id_agremiado
    const requesterRole = req.user?.rol

    if (requesterRole !== 'admin' && requesterRole !== 'super_admin' && requesterId !== id) {
      res.status(403).json({ success: false, message: 'Acceso denegado.' }); return
    }

    const result = await db.execute({
      sql: `SELECT 
              id_agremiado, 
              nombre_completo, 
              cedula_rif, 
              email, 
              telefono, 
              estatus, 
              fecha_registro,
              'Aprobado' as fase
            FROM agremiados
            WHERE id_agremiado_corp = ?
            
            UNION ALL
            
            SELECT 
              NULL as id_agremiado,
              e.nombre_completo,
              e.cedula_rif,
              e.email,
              e.telefono,
              ic.estatus,
              ic.creado_en as fecha_registro,
              'Solicitud' as fase
            FROM inscripciones_cursos ic
            JOIN estudiantes e ON e.id_estudiante = ic.id_estudiante
            WHERE ic.id_agremiado_corp = ? AND ic.programa_codigo = 'AFILIACION'
              AND NOT EXISTS (SELECT 1 FROM agremiados a WHERE a.email = e.email)
            
            ORDER BY fecha_registro DESC`,
      args: [id, id]
    })
    res.json({ success: true, data: result.rows })
  } catch (error) {
    console.error('listarAfiliadosCorporativos:', error)
    res.status(500).json({ success: false, message: 'Error al listar afiliados' })
  }
}

/**
 * POST /api/afiliados/:id/registrar-miembro
 * Registro directo de un miembro por parte de su empresa.
 */
export const registrarMiembroDirecto = async (req: Request, res: Response): Promise<void> => {
  try {
    const idCorp = Number(req.params.id)
    const requesterId = req.user?.id_agremiado
    const requesterRole = req.user?.rol

    if (requesterRole !== 'admin' && requesterRole !== 'super_admin' && requesterId !== idCorp) {
      res.status(403).json({ success: false, message: 'Acceso denegado.' }); return
    }

    const { nombreCompleto, cedulaRif, email, telefono, nivelProfesional, esCorredorInmobiliario } = req.body

    if (!nombreCompleto || !cedulaRif || !email) {
      res.status(400).json({ success: false, message: 'Nombre, Cédula y Email son requeridos.' }); return
    }

    // Obtener info de la empresa
    const corp = await db.execute({
      sql: `SELECT nombre_completo, razon_social FROM agremiados WHERE id_agremiado = ? LIMIT 1`,
      args: [idCorp]
    })
    if (corp.rows.length === 0) {
      res.status(404).json({ success: false, message: 'Empresa no encontrada.' }); return
    }
    const empresa = corp.rows[0] as any

    // Verificar si ya existe
    const existing = await db.execute({
      sql: `SELECT id_agremiado FROM agremiados WHERE email = ? OR cedula_rif = ? LIMIT 1`,
      args: [email, cedulaRif]
    })
    if (existing.rows.length > 0) {
      res.status(400).json({ success: false, message: 'Ya existe un afiliado con ese email o cédula.' }); return
    }

    // 3. Crear Verificación de Preinscripción ( Academy Flow )
    const { token: tokenVerif, fechaExpiracion } = await crearVerificacionPreinscripcionPrograma({
      nombreCompleto,
      cedulaRif,
      email,
      telefono: telefono || null,
      programaCodigo: 'AFILIACION',
      tipoAfiliado: 'Natural',
      nivelProfesional: nivelProfesional || null,
      esCorredorInmobiliario: !!esCorredorInmobiliario,
      id_agremiado_corp: idCorp
    });

    // 4. Enviar Email con link a Academia
    const nombreEmpresa = empresa.razon_social || empresa.nombre_completo
    await enviarCorreoInvitacionCorporativa({
      nombre: nombreCompleto,
      emailOriginal: email,
      nombreEmpresa,
      token: tokenVerif
    })

    res.status(201).json({ success: true, message: 'Miembro registrado correctamente. Se ha enviado un correo de invitación.' })
  } catch (error) {
    console.error('registrarMiembroDirecto:', error)
    res.status(500).json({ success: false, message: 'Error interno al registrar miembro.' })
  }
}

/**
 * GET /api/public/invitaciones/:token
 * Valida un token de invitación y devuelve info de la empresa.
 */
export const publicValidarInvitacion = async (req: Request, res: Response): Promise<void> => {
  try {
    const token = String(req.params.token ?? '').trim()
    const result = await db.execute({
      sql: `SELECT ic.*, a.estatus as estatus_empresa
            FROM invitaciones_corporativas ic
            JOIN agremiados a ON a.id_agremiado = ic.id_agremiado_corp
            WHERE ic.token = ? AND ic.activo = 1 LIMIT 1`,
      args: [token]
    })
    if (result.rows.length === 0) {
      res.status(404).json({ success: false, message: 'Link de invitación inválido o desactivado.' }); return
    }
    const inv = result.rows[0] as any
    if (inv.fecha_expiracion && new Date(inv.fecha_expiracion) < new Date()) {
      res.status(400).json({ success: false, message: 'Este link de invitación ha expirado.' }); return
    }
    res.json({
      success: true,
      data: {
        nombreEmpresa: inv.nombre_empresa,
        idEmpresa: inv.id_agremiado_corp,
        token: inv.token
      }
    })
  } catch (error) {
    console.error('publicValidarInvitacion:', error)
    res.status(500).json({ success: false, message: 'Error al validar invitación' })
  }
}

/**
 * POST /api/public/invitaciones/:token/registrar
 * Registra un afiliado individual a través de un link corporativo.
 */
export const publicRegistrarPorInvitacion = async (req: Request, res: Response): Promise<void> => {
  try {
    const token = String(req.params.token ?? '').trim()

    // Validar token
    const invRes = await db.execute({
      sql: `SELECT * FROM invitaciones_corporativas WHERE token = ? AND activo = 1 LIMIT 1`,
      args: [token]
    })
    if (invRes.rows.length === 0) {
      res.status(404).json({ success: false, message: 'Link de invitación inválido o desactivado.' }); return
    }
    const inv = invRes.rows[0] as any
    if (inv.fecha_expiracion && new Date(inv.fecha_expiracion) < new Date()) {
      res.status(400).json({ success: false, message: 'Este link de invitación ha expirado.' }); return
    }

    const nombreCompleto = typeof req.body?.nombreCompleto === 'string' ? req.body.nombreCompleto.trim() : ''
    const cedulaRif = typeof req.body?.cedulaRif === 'string' ? req.body.cedulaRif.trim() : null
    const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : ''
    const telefono = typeof req.body?.telefono === 'string' ? req.body.telefono.trim() : null
    const nivelProfesional = typeof req.body?.nivelProfesional === 'string' ? req.body.nivelProfesional.trim() : null
    const esCorredorInmobiliario = req.body?.esCorredorInmobiliario === true || req.body?.esCorredorInmobiliario === 'si' ? 1 : 0

    const NIVELES_VALIDOS = new Set(['Bachiller', 'TSU', 'Universitario', 'Postgrado'])
    if (!nombreCompleto || !email || !cedulaRif) {
      res.status(400).json({ success: false, message: 'Nombre completo, cédula y email son obligatorios.' }); return
    }
    if (nivelProfesional && !NIVELES_VALIDOS.has(nivelProfesional)) {
      res.status(400).json({ success: false, message: 'Nivel profesional inválido.' }); return
    }

    // Verificar duplicados
    const dup = await db.execute({
      sql: `SELECT id_agremiado FROM agremiados WHERE email = ? OR cedula_rif = ? LIMIT 1`,
      args: [email, cedulaRif]
    })
    if (dup.rows.length > 0) {
      res.status(409).json({ success: false, message: 'Ya existe un afiliado con ese email o cédula.' }); return
    }

    // 3. Crear Verificación de Preinscripción ( Academy Flow )
    const { token: tokenVerif, fechaExpiracion } = await crearVerificacionPreinscripcionPrograma({
      nombreCompleto,
      cedulaRif,
      email,
      telefono: telefono || null,
      programaCodigo: 'AFILIACION',
      tipoAfiliado: 'Natural',
      nivelProfesional: nivelProfesional || null,
      esCorredorInmobiliario: !!esCorredorInmobiliario,
      id_agremiado_corp: inv.id_agremiado_corp
    });

    // 4. Enviar Email con link a Academia
    await enviarCorreoInvitacionCorporativa({
      nombre: nombreCompleto,
      emailOriginal: email,
      nombreEmpresa: inv.nombre_empresa,
      token: tokenVerif
    })

    res.status(201).json({
      success: true,
      message: `Tu solicitud de afiliación a ${inv.nombre_empresa} fue recibida. Revisa tu correo para completar tu perfil y cargar documentos.`,
      data: { email, token: tokenVerif }
    })
  } catch (error) {
    console.error('publicRegistrarPorInvitacion:', error)
    res.status(500).json({ success: false, message: 'Error al procesar el registro' })
  }
}
