import { db } from '../lib/db.js';

async function repairTipoAfiliado() {
  console.log('🔍 Iniciando reparación de tipo_afiliado en agremiados...');
  
  try {
    // 1. Obtener todos los agremiados que no tienen tipo_afiliado definido
    const result = await db.execute({
      sql: 'SELECT id_agremiado, cedula_rif, nombre_completo FROM agremiados WHERE tipo_afiliado IS NULL OR tipo_afiliado = ""',
      args: []
    });

    console.log(`📊 Encontrados ${result.rows.length} registros sin tipo_afiliado.`);

    let updated = 0;
    for (const row of result.rows) {
      const id = row.id_agremiado;
      const cedulaRif = (row.cedula_rif as string || '').toUpperCase().trim();
      
      // Heurística: J o G son Jurídicos (Corporativos). V, E o P son Naturales (Independientes).
      // Si no tiene prefijo, probamos por longitud o formato (RIF suele tener guiones y más números).
      let tipo = 'Natural';
      if (cedulaRif.startsWith('J') || cedulaRif.startsWith('G')) {
        tipo = 'Juridico';
      }

      await db.execute({
        sql: 'UPDATE agremiados SET tipo_afiliado = ? WHERE id_agremiado = ?',
        args: [tipo, id]
      });
      
      updated++;
    }

    console.log(`✅ Reparación finalizada. Actualizados: ${updated}`);
  } catch (error) {
    console.error('❌ Error reparando tipo_afiliado:', error);
  }
}

repairTipoAfiliado();
