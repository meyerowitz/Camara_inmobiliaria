import { createClient } from '@libsql/client';

const db = createClient({
  url: 'libsql://ciebo-jennorg.aws-us-east-1.turso.io',
  authToken: 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3Nzc0ODg2MDQsImlkIjoiMDE5ZGRhOTMtOGUwMS03ZTU5LTgzN2UtYTgyMWQ1NWM4YjAzIiwicmlkIjoiYjFkMjBjNGUtM2YyYy00NGQyLWFjZDktMTY0YTk4NDVlNDRjIn0.Jt6Ebr-86al8ltCgE1_WEMeSai4j4fzwZnHYhI3J99UyOqd8_yC9Q7FeVz-frYi_L7JCk6ZzQkaB6NCXMr5mBw'
});

async function main() {
  const students = [
    { nombres: 'Roberto', apellidos: 'Gomez', email: 'roberto.gomez@test.com', cedula: 'V-11222333', razon_social: null, tipo: 'Regular' },
    { nombres: 'Elena', apellidos: 'Rodriguez', email: 'elena.rod@test.com', cedula: 'V-22333444', razon_social: null, tipo: 'Regular' },
    { nombres: 'Carlos', apellidos: 'Perez', email: 'carlos.perez@test.com', cedula: 'V-55666777', razon_social: null, tipo: 'Regular' },
    { nombres: null, apellidos: null, razon_social: 'Inversiones Inmobiliarias CA', email: 'contacto@inversiones.com', cedula: 'J-33444555', tipo: 'Corporativo' },
    { nombres: null, apellidos: null, razon_social: 'Bienes Raices Bolivar', email: 'info@brbolivar.com', cedula: 'J-99888777', tipo: 'Corporativo' }
  ];

  for (const s of students) {
    const nombreCompleto = s.razon_social || (s.nombres + ' ' + s.apellidos);
    try {
      const resEst = await db.execute({
        sql: 'INSERT INTO estudiantes (nombres, apellidos, razon_social, nombre_completo, email, cedula_rif, tipo) VALUES (?, ?, ?, ?, ?, ?, ?) RETURNING id_estudiante',
        args: [s.nombres, s.apellidos, s.razon_social, nombreCompleto, s.email, s.cedula, s.tipo]
      });
      const idEstudiante = resEst.rows[0].id_estudiante;
      await db.execute({
        sql: "INSERT INTO inscripciones_cursos (id_estudiante, programa_codigo, tipo_inscripcion, estatus) VALUES (?, 'AFILIACION', 'programa', 'Preinscrito')",
        args: [idEstudiante]
      });
      console.log(`Inserted: ${nombreCompleto}`);
    } catch (e) {
      if (e.message.includes('UNIQUE constraint failed')) {
         console.log(`Skipped (already exists): ${nombreCompleto}`);
      } else {
         console.error(`Error inserting ${nombreCompleto}:`, e.message);
      }
    }
  }
}

main().catch(console.error);
