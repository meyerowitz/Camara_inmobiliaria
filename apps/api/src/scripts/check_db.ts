import { db } from '../lib/db.js';

async function checkData() {
  try {
    const result = await db.execute({
      sql: 'SELECT DISTINCT tipo_afiliado FROM agremiados',
      args: []
    });
    console.log('Valores encontrados en tipo_afiliado:', result.rows);

    const sample = await db.execute({
      sql: "SELECT id_agremiado, nombre_completo, tipo_afiliado FROM agremiados WHERE estatus = '9_AFILIACION' LIMIT 5",
      args: []
    });
    console.log('Muestra de afiliados activos:', sample.rows);
  } catch (e) {
    console.error(e);
  }
}
checkData();
