import { Request, Response } from 'express';
import { db } from '../lib/db.js';

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

    // Regla de negocio crítica: Estatus 'Preinscrito' y CIBIR nulo
    const estatus = 'Preinscrito';
    const cibir = null;

    // Inserción real en base de datos Turso LibSQL
    try {
      const result = await db.execute({
        sql: `INSERT INTO agremiados (
                nombre_completo, 
                email, 
                cedula_rif, 
                telefono, 
                estatus, 
                codigo_cibir
              ) VALUES (?, ?, ?, ?, ?, ?) RETURNING *`,
        args: [nombreCompleto, email, cedulaRif, telefono, estatus, cibir]
      });

      const newAfiliado = result.rows[0];

      return res.status(201).json({
        success: true,
        message: 'Candidato registrado exitosamente',
        data: newAfiliado
      });
      
    } catch (dbError: any) {
      // Manejar errores de constraint (UNIQUE)
      const errorMsg = dbError.message || '';
      if (errorMsg.includes('UNIQUE constraint failed: agremiados.email')) {
        return res.status(409).json({
          success: false,
          message: 'El email ya se encuentra registrado'
        });
      }
      if (errorMsg.includes('UNIQUE constraint failed: agremiados.cedula_rif')) {
        return res.status(409).json({
          success: false,
          message: 'La cédula o RIF ya se encuentra registrada'
        });
      }
      
      throw dbError; // Si es otro error, lanzarlo al catch general
    }

  } catch (error) {
    console.error('Error en registerAfiliado:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor al procesar el registro'
    });
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

    return res.status(200).json({
      success: true,
      message: 'Candidato aprobado y código CIBIR asignado exitosamente',
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

// ==========================================
// RUTAS PÚBLICAS
// ==========================================

export const buscarAfiliadosPublic = async (req: Request, res: Response) => {
  try {
    const q = (req.query.q as string) || '';

    // REGLA CRÍTICA: Solo seleccionamos `nombre_completo` y `codigo_cibir`.
    // REGLA DE FILTRO: Solo agremiados con estatus = 'CIBIR'.
    let sql = `
      SELECT nombre_completo, codigo_cibir 
      FROM agremiados 
      WHERE estatus = 'CIBIR'
    `;
    const args: any[] = [];

    // Si hay exp de búsqueda, buscar por nombre o código CIBIR
    const searchTerm = q.trim();
    if (searchTerm) {
      sql += ` AND (nombre_completo LIKE ? OR codigo_cibir LIKE ?)`;
      const pattern = `%${searchTerm}%`;
      args.push(pattern, pattern);
    }
    
    // Ordenar alfabéticamente para mejor UX pública
    sql += ` ORDER BY nombre_completo ASC LIMIT 50`;

    const result = await db.execute({ sql, args });

    return res.status(200).json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Error en buscarAfiliadosPublic:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor al realizar la búsqueda pública'
    });
  }
};
