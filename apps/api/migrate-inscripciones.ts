import { db } from './src/lib/db.js';

async function migrate() {
  console.log('Migrando inscripciones_cursos...');
  
  try {
    await db.execute('ALTER TABLE inscripciones_cursos ADD COLUMN completado INTEGER NOT NULL DEFAULT 0');
    console.log('Columna completado agregada.');
  } catch (e) {
    console.log('La columna completado ya existe o error:', e);
  }

  try {
    await db.execute('ALTER TABLE inscripciones_cursos ADD COLUMN certificado_url TEXT');
    console.log('Columna certificado_url agregada.');
  } catch (e) {
    console.log('La columna certificado_url ya existe o error:', e);
  }

  console.log('Listo.');
  process.exit(0);
}

migrate();
