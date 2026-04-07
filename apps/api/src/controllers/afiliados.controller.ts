import { Request, Response } from 'express';
import { randomUUID } from 'crypto';
import { db } from '../lib/db.js';
import { generarCredenciales } from '../lib/credentials.js';
import { enviarCorreoVerificacion, enviarCorreoAprobacion } from '../lib/email.js';
import bcrypt from 'bcryptjs';

/**
 * GET /api/afiliados/:id
 * Obtiene un agremiado por ID. Protegido por auth.
 * Un afiliado solo puede ver sus propios datos; los admins pueden ver cualquiera.
 */
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
                   estatus, codigo_cibir, fecha_registro, inscripcion_pagada
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
    const { nombreCompleto, email, cedulaRif, telefono } = req.body;

    // Validación básica
    if (!nombreCompleto || !email || !cedulaRif || !telefono) {
      return res.status(400).json({ 
        success: false, 
        message: 'Todos los campos son requeridos (nombreCompleto, email, cedulaRif, telefono)' 
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
    const estatus = 'Preinscrito';
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
    const { estatus } = req.query;

    let sql = 'SELECT * FROM agremiados';
    const args: any[] = [];

    // Filtrar por estatus si se proporciona en el query string
    if (estatus) {
      sql += ' WHERE estatus = ?';
      args.push(estatus as string);
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

    if (agremiado.estatus !== 'Preinscrito') {
      return res.status(400).json({
        success: false,
        message: 'Solo los candidatos con estatus "Preinscrito" pueden ser aprobados'
      });
    }

    // 2. Generar el código CIBIR (CIBIR-YYYY-NNN)
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

    // 3. Actualizar a estatus CIBIR
    const fechaCambio = new Date().toISOString();
    
    // Suponemos que también asignaremos el código CIBIR
    const updateResult = await db.execute({
      sql: `UPDATE agremiados 
            SET estatus = 'CIBIR', codigo_cibir = ?, fecha_ultimo_cambio_estatus = ?
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

    if (agremiado.estatus !== 'Preinscrito') {
      return res.status(400).json({
        success: false,
        message: 'Solo los candidatos con estatus "Preinscrito" pueden ser rechazados'
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
    let sql = `
      SELECT id_agremiado, nombre_completo, codigo_cibir, cedula_rif 
      FROM agremiados 
      WHERE estatus = 'CIBIR'
      ORDER BY nombre_completo ASC 
      LIMIT 1000
    `;
    const args: any[] = [];

    const result = await db.execute({ sql, args });

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
        SUM(CASE WHEN estatus IN ('Preinscrito', 'CIBIR', 'Suspendido') THEN 1 ELSE 0 END) as todos,
        SUM(CASE WHEN estatus = 'Preinscrito' THEN 1 ELSE 0 END) as pendiente,
        SUM(CASE WHEN estatus = 'CIBIR' THEN 1 ELSE 0 END) as aprobado,
        SUM(CASE WHEN estatus = 'Suspendido' THEN 1 ELSE 0 END) as rechazado
      FROM agremiados
    `;
    const countResult = await db.execute({ sql: countSql, args: [] });
    const counts = countResult.rows[0];

    // Luego, obtener la lista filtrada según el tab seleccionado
    let sql = `SELECT * FROM agremiados WHERE estatus IN ('Preinscrito', 'CIBIR', 'Suspendido')`;
    const args: any[] = [];

    if (tab === 'pendiente') {
      sql = `SELECT * FROM agremiados WHERE estatus = 'Preinscrito'`;
    } else if (tab === 'aprobado') {
      sql = `SELECT * FROM agremiados WHERE estatus = 'CIBIR'`;
    } else if (tab === 'rechazado') {
      sql = `SELECT * FROM agremiados WHERE estatus = 'Suspendido'`;
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
    // Idealmente guardaríamos el pago en transacciones_pagos, pero esta es la lógica de formalización simplificada aprobada
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
