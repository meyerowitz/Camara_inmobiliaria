import { Request, Response } from 'express';
import { randomUUID, createHash } from 'crypto';
import { db } from '../lib/db.js';

const sha256 = (raw: string) => createHash('sha256').update(raw).digest('hex');
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
    const requesterRoles = req.user!.roles ?? [req.user!.rol]

    // Afiliados solo pueden consultar su propio registro
    if (!requesterRoles.some(r => ['admin','super_admin'].includes(r)) && requesterId !== Number(id)) {
      res.status(403).json({ success: false, message: 'Acceso denegado' })
      return
    }

    const result = await db.execute({
      sql: `SELECT a.*, 
                   corp.razon_social as corp_razon_social, 
                   corp.cedula_rif as corp_rif
            FROM agremiados a
            LEFT JOIN agremiados corp ON a.id_agremiado_corp = corp.id_agremiado
            WHERE a.id_agremiado = ?`,
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

    // Validación básica (nombre_completo es generado, no se necesita)
    if (!email || !cedulaRif || !telefono) {
      return res.status(400).json({ 
        success: false, 
        message: 'Los campos básicos son requeridos (email, cedulaRif, telefono)' 
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

    // Insertar en agremiados — nombre_completo es columna VIRTUAL GENERATED, NO se inserta
    const estatus = '1_PREINSCRIPCION';

    try {
      // Intentamos parsear nombres/apellidos del nombre_completo almacenado en la verificación
      const fullName = String(registro.nombre_completo || '').trim()
      const parts = fullName.split(' ')
      const apellidos = parts.length > 1 ? parts.slice(Math.ceil(parts.length / 2)).join(' ') : ''
      const nombres = parts.length > 1 ? parts.slice(0, Math.ceil(parts.length / 2)).join(' ') : fullName

      const insertResult = await db.execute({
        sql: `INSERT INTO agremiados (
                nombres,
                apellidos,
                email, 
                cedula_rif, 
                telefono, 
                estatus
              ) VALUES (?, ?, ?, ?, ?, ?) RETURNING *`,
        args: [nombres || fullName, apellidos || null, registro.email, registro.cedula_rif, registro.telefono, estatus]
      });

      const newAfiliado = insertResult.rows[0] as any;

      if (newAfiliado?.id_agremiado) {
        await db.execute({
          sql: `UPDATE agremiados SET codigo_cibir = CAST(id_agremiado AS TEXT) WHERE id_agremiado = ?`,
          args: [newAfiliado.id_agremiado]
        });
      }

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

    let sql = `
      SELECT a.*, 
             corp.razon_social as corp_razon_social, 
             corp.cedula_rif as corp_rif
      FROM agremiados a
      LEFT JOIN agremiados corp ON a.id_agremiado_corp = corp.id_agremiado
    `;
    const args: any[] = [];
    const whereClauses: string[] = [];

    if (estatus) {
      whereClauses.push('a.estatus = ?');
      args.push(estatus as string);
    }
    
    if (tipo_afiliado) {
      whereClauses.push('a.tipo_afiliado = ?');
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

    if (['Afiliado', 'Moroso', 'Suspendido', 'Rechazado'].includes(agremiado.estatus as string)) {
      return res.status(400).json({
        success: false,
        message: 'El candidato ya tiene un estatus final y no puede ser aprobado nuevamente'
      });
    }

    // 2. Generar el código de Afiliado (Secuencial Numérico)
    // Buscamos el último código numérico asignado
    const resultUltimoCode = await db.execute({
      sql: `SELECT codigo_cibir FROM agremiados 
            WHERE codigo_cibir GLOB '[0-9]*' 
            ORDER BY CAST(codigo_cibir AS INTEGER) DESC LIMIT 1`,
      args: []
    });

    let correlativo = 1;
    if (resultUltimoCode.rows.length > 0 && resultUltimoCode.rows[0].codigo_cibir) {
      const lastCode = parseInt(resultUltimoCode.rows[0].codigo_cibir as string, 10);
      if (!isNaN(lastCode)) {
        correlativo = lastCode + 1;
      }
    }

    const codigoAfiliado = correlativo.toString();

    // 3. Actualizar a estatus Afiliado (aprobado final)
    const fechaCambio = new Date().toISOString();
    
    const updateResult = await db.execute({
      sql: `UPDATE agremiados 
            SET estatus = 'Afiliado', inscripcion_pagada = 1, codigo_cibir = ?, fecha_ultimo_cambio_estatus = ?, actualizado_en = ?
            WHERE id_agremiado = ? RETURNING *`,
      args: [codigoAfiliado, fechaCambio, fechaCambio, id]
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
        
        // Insertar o actualizar usuario con el token hasheado
        const resetTokenHash = sha256(resetToken)
        await db.execute({
          sql: `INSERT INTO users (email, password_hash, roles, id_agremiado, reset_token_hash, reset_token_expira)
                VALUES (?, ?, '["afiliado"]', ?, ?, ?)
                ON CONFLICT(email) DO UPDATE SET 
                  id_agremiado = excluded.id_agremiado,
                  reset_token_hash = excluded.reset_token_hash, 
                  reset_token_expira = excluded.reset_token_expira,
                  actualizado_en = strftime('%Y-%m-%dT%H:%M:%SZ','now')`,
          args: [agremiado.email, placeholderPass, id, resetTokenHash, expStr]
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

    if (agremiado.estatus === 'Afiliado') {
      return res.status(400).json({
        success: false,
        message: 'No se puede rechazar a un afiliado activo'
      });
    }

    const fechaCambio = new Date().toISOString();
    const updateResult = await db.execute({
      sql: `UPDATE agremiados 
            SET estatus = 'Rechazado', fecha_ultimo_cambio_estatus = ?, actualizado_en = ?
            WHERE id_agremiado = ? RETURNING *`,
      args: [fechaCambio, fechaCambio, id]
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
      SELECT id_agremiado, nombre_completo, nombres, apellidos, razon_social, codigo_cibir, cedula_rif, tipo_afiliado,
             logo_url, instagram, facebook, linkedin, twitter, website
      FROM agremiados 
      WHERE estatus = 'Afiliado' AND activo = 1
      ORDER BY nombre_completo ASC
    `,
      args: []
    });

    console.log(`[DEBUG] buscarAfiliadosPublic: Encontrados ${result.rows.length} afiliados activos.`);
    if (result.rows.length > 0) {
      console.log(`[DEBUG] Tipos encontrados:`, [...new Set(result.rows.map(r => r.tipo_afiliado))]);
    }

    // Usamos logo_url real si existe, sino ui-avatars como fallback
    const mappedData = result.rows.map((row) => ({
      ...row,
      foto_url: (row.logo_url as string) || `https://ui-avatars.com/api/?name=${encodeURIComponent(row.nombre_completo as string)}&background=047857&color=fff&size=200`,
      redes_sociales: {
        instagram: row.instagram || '',
        linkedin: row.linkedin || '',
        facebook: row.facebook || '',
        twitter: row.twitter || '',
        website: row.website || ''
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

export const getAfiliadoPublicById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await db.execute({
      sql: `
        SELECT a.id_agremiado, a.nombre_completo, a.nombres, a.apellidos, a.razon_social, a.codigo_cibir, 
               a.cedula_rif_tipo, a.cedula_rif, a.tipo_afiliado, a.cedula_personal, a.email, a.telefono, a.direccion, 
               a.fecha_nacimiento, a.nivel_academico, a.notas, a.instagram, a.facebook, a.linkedin, 
               a.twitter, a.website, a.logo_url, a.banner_url, a.fecha_registro, a.estatus, a.activo,
               p.nombre_completo as empresa_pertenece, p.id_agremiado as empresa_id
        FROM agremiados a
        LEFT JOIN agremiados p ON a.id_agremiado_corp = p.id_agremiado
        WHERE a.id_agremiado = ? AND a.estatus = 'Afiliado' AND a.activo = 1
      `,
      args: [Number(id)]
    });

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Miembro no encontrado o no activo' });
    }

    const row = result.rows[0];
    
    const mappedData: any = {
      ...row,
      foto_url: (row.logo_url as string) || `https://ui-avatars.com/api/?name=${encodeURIComponent(row.nombre_completo as string)}&background=047857&color=fff&size=200`,
      redes_sociales: {
        instagram: row.instagram || '',
        linkedin: row.linkedin || '',
        facebook: row.facebook || '',
        twitter: row.twitter || '',
        website: row.website || ''
      }
    };

    if (row.tipo_afiliado === 'Corporativo' || row.tipo_afiliado === 'Juridico') {
      const assocResult = await db.execute({
        sql: `
          SELECT id_agremiado, nombre_completo, codigo_cibir, cedula_rif, tipo_afiliado, logo_url
          FROM agremiados
          WHERE id_agremiado_corp = ? AND estatus = 'Afiliado' AND activo = 1
        `,
        args: [Number(id)]
      });
      mappedData.afiliados_asociados = assocResult.rows;
    }

    return res.status(200).json({
      success: true,
      data: mappedData
    });
  } catch (error) {
    console.error('Error en getAfiliadoPublicById:', error);
    return res.status(500).json({ success: false, message: 'Error al obtener el perfil público' });
  }
};

// ==========================================
// NUEVO ENDPOINT PARA LA UI DE CIBIR (Tabs)
// ==========================================

export const getSolicitudesCibir = async (req: Request, res: Response) => {
  try {
    const tab = (req.query.tab as string) || 'todos'; // todos | pendiente | aprobado | rechazado

    // Nuevo flujo de 6 pasos: 1_PREINSCRIPCION … 6_INSCRIPCION → Afiliado / Moroso / Suspendido / Rechazado
    const countSql = `
      SELECT 
        COUNT(*) as todos,
        SUM(CASE WHEN estatus IN ('1_PREINSCRIPCION','2_EXPEDIENTE','3_ENTREVISTA','4_VERIFICACION','5_CIBIR','6_INSCRIPCION') THEN 1 ELSE 0 END) as pendiente,
        SUM(CASE WHEN estatus = 'Afiliado' THEN 1 ELSE 0 END) as aprobado,
        SUM(CASE WHEN estatus IN ('Suspendido', 'Rechazado', 'Moroso') THEN 1 ELSE 0 END) as rechazado
      FROM agremiados
    `;
    const countResult = await db.execute({ sql: countSql, args: [] });
    const counts = countResult.rows[0];

    let sql = `SELECT * FROM agremiados`;
    const args: any[] = [];
    const whereConditions: Record<string, string> = {
      pendiente: `estatus IN ('1_PREINSCRIPCION','2_EXPEDIENTE','3_ENTREVISTA','4_VERIFICACION','5_CIBIR','6_INSCRIPCION')`,
      aprobado: `estatus = 'Afiliado'`,
      rechazado: `estatus IN ('Suspendido','Rechazado','Moroso')`,
    };
    if (tab in whereConditions) {
      sql += ` WHERE ${whereConditions[tab]}`;
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

    // Estados válidos del nuevo flujo de 6 pasos
    const allowedStatuses = [
      '1_PREINSCRIPCION', '2_EXPEDIENTE', '3_ENTREVISTA',
      '4_VERIFICACION', '5_CIBIR', '6_INSCRIPCION',
      'Afiliado', 'Moroso', 'Suspendido', 'Rechazado'
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

    // Si el estatus cambia a 'Afiliado', nos aseguramos de que tenga un código de afiliado
    if (estatus === 'Afiliado') {
      const currentRes = await db.execute({
        sql: 'SELECT codigo_cibir FROM agremiados WHERE id_agremiado = ?',
        args: [Number(id)]
      });
      const current = currentRes.rows[0];
      if (!current || !current.codigo_cibir) {
        // Generar nuevo código correlativo
        const resultUltimoCode = await db.execute({
          sql: `SELECT codigo_cibir FROM agremiados 
                WHERE codigo_cibir GLOB '[0-9]*' 
                ORDER BY CAST(codigo_cibir AS INTEGER) DESC LIMIT 1`,
          args: []
        });
        let correlativo = 1;
        if (resultUltimoCode.rows.length > 0 && resultUltimoCode.rows[0].codigo_cibir) {
          const lastCode = parseInt(resultUltimoCode.rows[0].codigo_cibir as string, 10);
          if (!isNaN(lastCode)) correlativo = lastCode + 1;
        }
        setParts.push('codigo_cibir = ?');
        args.splice(args.length - 1, 0, correlativo.toString()); // Insertar antes del ID
      }
    }

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
      // NOTA: nombre_completo es columna GENERADA, no se puede actualizar directamente
      'nombres', 'apellidos', 'cedula_rif', 
      'cedula_personal', 'email', 'telefono', 'razon_social',
      'direccion', 'fecha_nacimiento', 'nivel_academico', 'notas',
      'estatus', 'cibir_convalidado', 'inscripcion_pagada', 'tipo_afiliado',
      'codigo_cibir', 'id_agremiado_corp', 'id_representante_legal',
      'instagram', 'facebook', 'linkedin', 'twitter', 'website',
      'logo_url', 'banner_url', 'activo'
    ];

    // Validar duplicados si se están cambiando campos únicos
    const uniqueFields = ['email', 'cedula_rif', 'codigo_cibir'];
    for (const field of uniqueFields) {
      if (fields[field]) {
        const existing = await db.execute({
          sql: `SELECT id_agremiado FROM agremiados WHERE ${field} = ? AND id_agremiado != ?`,
          args: [fields[field], id]
        });
        if (existing.rows.length > 0) {
          return res.status(400).json({ success: false, message: `Ya existe otro afiliado con este ${field.replace('_', ' ')}` });
        }
      }
    }

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

    // Siempre actualizar fecha de auditoría
    setParts.push('actualizado_en = ?');
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
    if (!['Juridico', 'Corporativo'].includes(empresa.tipo_afiliado)) {
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
/**
 * DELETE /api/afiliados/:id
 * Elimina un registro de agremiado.
 */
export const deleteAfiliado = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    // Primero verificar si existe
    const check = await db.execute({
      sql: 'SELECT id_agremiado FROM agremiados WHERE id_agremiado = ?',
      args: [id]
    });

    if (check.rows.length === 0) {
      res.status(404).json({ success: false, message: 'Afiliado no encontrado' });
      return;
    }

    // Borrar (las foreign keys están configuradas como ON DELETE SET NULL o CASCADE en la mayoría de los casos)
    await db.execute({
      sql: 'DELETE FROM agremiados WHERE id_agremiado = ?',
      args: [id]
    });

    res.json({ success: true, message: 'Afiliado eliminado correctamente' });
  } catch (error) {
    console.error('Error en deleteAfiliado:', error);
    res.status(500).json({ success: false, message: 'Error interno al eliminar afiliado' });
  }
};

/**
 * POST /api/afiliados
 * Creación directa de un afiliado por parte del administrador.
 */
export const createAfiliado = async (req: Request, res: Response): Promise<void> => {
  try {
    const { 
      nombre_completo, nombres, apellidos, razon_social, 
      cedula_rif, email, tipo_afiliado, estatus, 
      telefono, direccion, codigo_cibir 
    } = req.body;

    if (!cedula_rif || !email) {
      res.status(400).json({ success: false, message: 'Cédula/RIF y Email son obligatorios.' });
      return;
    }
    // Para Natural se requieren nombres+apellidos; para Juridico razon_social
    const tipoFinal = tipo_afiliado || 'Natural'
    if (tipoFinal === 'Natural' && (!nombres || !apellidos)) {
      res.status(400).json({ success: false, message: 'Para afiliado Natural, nombres y apellidos son obligatorios.' });
      return;
    }
    if (['Juridico', 'Corporativo'].includes(tipoFinal) && !razon_social) {
      res.status(400).json({ success: false, message: 'Para afiliado Jurídico, la razón social es obligatoria.' });
      return;
    }

    // Verificar duplicados
    const existing = await db.execute({
      sql: 'SELECT id_agremiado FROM agremiados WHERE email = ? OR cedula_rif = ?' + (codigo_cibir ? ' OR codigo_cibir = ?' : ''),
      args: codigo_cibir ? [email, cedula_rif, codigo_cibir] : [email, cedula_rif]
    });

    if (existing.rows.length > 0) {
      res.status(400).json({ success: false, message: 'Ya existe un afiliado con ese email o Cédula/RIF.' });
      return;
    }

    // nombre_completo es columna GENERADA — no se inserta directamente
    const result = await db.execute({
      sql: `INSERT INTO agremiados (
        nombres, apellidos, razon_social, 
        cedula_rif, email, tipo_afiliado, estatus, 
        telefono, direccion, codigo_cibir
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING *`,
      args: [
        nombres || null, apellidos || null, razon_social || null,
        cedula_rif, email, tipoFinal, estatus || 'Afiliado',
        telefono || null, direccion || null, codigo_cibir || null
      ]
    });

    res.status(201).json({ 
      success: true, 
      message: 'Afiliado creado correctamente', 
      data: result.rows[0] 
    });
  } catch (error) {
    console.error('Error en createAfiliado:', error);
    res.status(500).json({ success: false, message: 'Error interno al crear afiliado' });
  }
};
