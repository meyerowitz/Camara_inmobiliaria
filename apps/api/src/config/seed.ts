/**
 * seed.ts — Inserta el contenido actual de la landing en las tablas CMS.
 * Ejecutar con: npx tsx src/config/seed.ts (desde apps/api)
 *
 * Es seguro ejecutarlo múltiples veces:
 * usa INSERT OR IGNORE para no duplicar registros.
 */

import { db } from '../lib/db.js';

async function seed() {
  console.log('Iniciando seed del CMS...\n');

  // ── CURSOS ──────────────────────────────────────────────────────────────────
  const cursos = [
    { codigo: 'PREANI', titulo: 'Programa de Estudios Académicos', subtitulo: 'Inmobiliarios Nivel Inicial', imagen_url: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&q=80&w=1200', orden: 1 },
    { codigo: 'CIBIR', titulo: 'Curso Intensivo de Bienes Raíces', subtitulo: 'Capacitación Técnica Avanzada', imagen_url: 'https://observatorio.tec.mx/wp-content/uploads/2020/04/CC3B3mohacerunaclaseenvivoefectivaysincomplicaciones.jpg', orden: 2 },
    { codigo: 'PEGI', titulo: 'Programa Ejecutivo', subtitulo: 'Gestión Inmobiliaria Estratégica', imagen_url: 'https://static.studyusa.com/article/aws_bEqqGGmAziTXnqDcljdFyWoFhYcnEMGI_sm_2x.jpg?format=webp', orden: 3 },
    { codigo: 'PADI', titulo: 'Programa de Administración', subtitulo: 'Administración en inmuebles', imagen_url: 'https://cms.usanmarcos.ac.cr/sites/default/files/tips-para-el-primer-dia-de-clases.png', orden: 4 },
  ];

  for (const c of cursos) {
    await db.execute({
      sql: `INSERT OR IGNORE INTO cms_cursos (codigo, titulo, subtitulo, imagen_url, orden, activo)
            VALUES (?, ?, ?, ?, ?, 1)`,
      args: [c.codigo, c.titulo, c.subtitulo, c.imagen_url, c.orden],
    });
    console.log(`  ✓ Curso: ${c.codigo}`);
  }

  // ── CONVENIOS ───────────────────────────────────────────────────────────────
  const convenios = [
    { nombre: 'UCAB', logo_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/df/UCAB.svg/1200px-UCAB.svg.png', orden: 1 },
    { nombre: 'Total Salud', logo_url: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQYIgmOl4EASpo1hjggjQq_xP61myeh_nkr9w&s', orden: 2 },
    { nombre: 'Fénix Salud', logo_url: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQYIgmOl4EASpo1hjggjQq_xP61myeh_nkr9w&s', orden: 3 },
    { nombre: 'CIV', logo_url: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQYIgmOl4EASpo1hjggjQq_xP61myeh_nkr9w&s', orden: 4 },
  ];

  for (const conv of convenios) {
    await db.execute({
      sql: `INSERT OR IGNORE INTO cms_convenios (nombre, logo_url, orden, activo)
            VALUES (?, ?, ?, 1)`,
      args: [conv.nombre, conv.logo_url, conv.orden],
    });
    console.log(`  ✓ Convenio: ${conv.nombre}`);
  }

  // ── NOTICIAS ────────────────────────────────────────────────────────────────
  const noticias = [
    {
      titulo: 'Nuevas tasas de registro 2026',
      extracto: 'Bolívar actualiza aranceles para transacciones de bienes raíces este trimestre.',
      imagen_url: 'https://sectorpublico.softplan.com.br/wp-content/uploads/2022/04/softplanplanejamentoesistemasltda_softplan_image_440-1.jpeg',
      categoria: 'Legal', tag: 'Legal', fecha: '2026-03-01',
    },
    {
      titulo: 'Crecimiento en Puerto Ordaz',
      extracto: 'La zona industrial y comercial muestra signos de recuperación tras nuevas inversiones.',
      imagen_url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=800',
      categoria: 'Mercado', tag: 'Mercado', fecha: '2026-02-20',
    },
    {
      titulo: 'Taller de Ventas Digitales',
      extracto: 'Éxito total en el último evento presencial realizado en el Hotel Eurobuilding.',
      imagen_url: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&q=80&w=800',
      categoria: 'Eventos', tag: 'Eventos', fecha: '2026-02-10',
    },
    {
      titulo: 'Innovación Inmobiliaria',
      extracto: 'Nuevas tecnologías aplicadas al sector de bienes raíces en la región.',
      imagen_url: 'https://www.elnuevoherald.com/public/ultimas-noticias/5hl2um/picture314557289/alternates/LANDSCAPE_1140/CONDO11.jpg',
      categoria: 'Tecnología', tag: 'Tecnología', fecha: '2026-01-28',
    },
  ];

  for (const n of noticias) {
    await db.execute({
      sql: `INSERT OR IGNORE INTO cms_noticias (titulo, extracto, imagen_url, categoria, tag, fecha, publicado)
            VALUES (?, ?, ?, ?, ?, ?, 1)`,
      args: [n.titulo, n.extracto, n.imagen_url, n.categoria, n.tag, n.fecha],
    });
    console.log(`  ✓ Noticia: ${n.titulo}`);
  }

  // ── HITOS (Historia) ────────────────────────────────────────────────────────
  const hitos = [
    { anio: '1994', titulo: 'Fundación', descripcion: 'Nace la Cámara Inmobiliaria del Estado Bolívar con la visión de profesionalizar el sector en la región.', orden: 1 },
    { anio: '2005', titulo: 'Crecimiento Gremial', descripcion: 'Se alcanzan los primeros 100 afiliados activos, fortaleciendo la presencia en Puerto Ordaz y Ciudad Bolívar.', orden: 2 },
    { anio: '2015', titulo: 'Innovación Digital', descripcion: 'Implementación de los primeros sistemas de formación online para corredores inmobiliarios de la zona.', orden: 3 },
    { anio: '2024', titulo: 'Nueva Gestión', descripcion: 'Inicio del periodo 2024-2026 enfocado en la vanguardia, sostenibilidad y alianzas estratégicas.', orden: 4 },
  ];

  for (const h of hitos) {
    await db.execute({
      sql: `INSERT OR IGNORE INTO cms_hitos (anio, titulo, descripcion, orden) VALUES (?, ?, ?, ?)`,
      args: [h.anio, h.titulo, h.descripcion, h.orden],
    });
    console.log(`  ✓ Hito: ${h.anio} — ${h.titulo}`);
  }

  // ── CONFIGURACIÓN ───────────────────────────────────────────────────────────
  const config = [
    // ── Hero ─────────────────────────────────────────────────────────────────
    { clave: 'hero_titulo',              valor: 'Líder del sector inmobiliario en Bolívar',                       descripcion: 'Título principal del Hero' },
    { clave: 'hero_subtitulo',           valor: 'Representamos y potenciamos a los profesionales del sector',     descripcion: 'Subtítulo del Hero' },
    { clave: 'hero_boton',               valor: 'Unirse',                                                         descripcion: 'Texto del botón Hero' },
    // ── Nosotros ─────────────────────────────────────────────────────────────
    { clave: 'nosotros_titulo',          valor: 'Sobre la Cámara',                                                descripcion: 'Título de la sección Nosotros' },
    { clave: 'nosotros_descripcion',     valor: 'La CÁMARA INMOBILIARIA DEL ESTADO BOLÍVAR (CIEBO) es una Asociación Civil sin fines de lucro, agrupa a instituciones, a personas jurídicas y naturales y que como actores del sector inmobiliario contribuyen con su acción e inversión al desarrollo del sector inmobiliario regional y nacional.', descripcion: 'Descripción de la sección Nosotros' },
    { clave: 'nosotros_card1_titulo',    valor: 'Reseña histórica',                                               descripcion: 'Tarjeta Nosotros — título 1' },
    { clave: 'nosotros_card1_desc',      valor: 'Décadas de compromiso con el desarrollo regional.',              descripcion: 'Tarjeta Nosotros — descripción 1' },
    { clave: 'nosotros_card1_img',       valor: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=800', descripcion: 'Tarjeta Nosotros — imagen 1' },
    { clave: 'nosotros_card2_titulo',    valor: 'Propósito',                                                      descripcion: 'Tarjeta Nosotros — título 2' },
    { clave: 'nosotros_card2_desc',      valor: 'Nuestra razón de ser y motor de cambio diario.',                 descripcion: 'Tarjeta Nosotros — descripción 2' },
    { clave: 'nosotros_card2_img',       valor: 'https://gentecompetente.com/wp-content/uploads/2023/10/las-empresas-que-se-hacen-querer.jpg', descripcion: 'Tarjeta Nosotros — imagen 2' },
    { clave: 'nosotros_card3_titulo',    valor: 'Misión y Visión',                                                descripcion: 'Tarjeta Nosotros — título 3' },
    { clave: 'nosotros_card3_desc',      valor: 'Hacia dónde proyectamos el futuro del sector.',                  descripcion: 'Tarjeta Nosotros — descripción 3' },
    { clave: 'nosotros_card3_img',       valor: 'https://escalas.org/wp-content/uploads/2019/10/4-1.jpg',         descripcion: 'Tarjeta Nosotros — imagen 3' },
    { clave: 'nosotros_boton',           valor: 'Contáctanos',                                                    descripcion: 'Texto del botón de contacto' },
    // ── Afiliados ────────────────────────────────────────────────────────────
    { clave: 'afiliados_contador',       valor: '220',                                                            descripcion: 'Número de afiliados (contador)' },
    { clave: 'afiliados_anos',           valor: '30',                                                             descripcion: 'Años de historia (contador)' },
    { clave: 'afiliados_titulo',         valor: '¿Por qué afiliarse?',                                           descripcion: 'Título sección Afiliados' },
    { clave: 'afiliados_descripcion',    valor: 'Al formar parte de la Cámara, accedes a una red nacional de contactos, asesoría legal de primera y programas de formación exclusivos.', descripcion: 'Descripción sección Afiliados' },
    { clave: 'afiliados_respaldo',       valor: 'Respaldo Gremial de Alto Nivel',                                 descripcion: 'Frase resaltada en tarjeta Afiliados' },
    { clave: 'afiliados_beneficio1',     valor: 'Certificación Profesional',                                      descripcion: 'Beneficio 1 de afiliarse' },
    { clave: 'afiliados_beneficio2',     valor: 'Respaldo Gremial Nacional',                                      descripcion: 'Beneficio 2 de afiliarse' },
    { clave: 'afiliados_beneficio3',     valor: 'Asesoría Legal Especializada',                                   descripcion: 'Beneficio 3 de afiliarse' },
    { clave: 'afiliados_beneficio4',     valor: 'Networking Estratégico',                                         descripcion: 'Beneficio 4 de afiliarse' },
    // ── Directiva ────────────────────────────────────────────────────────────
    { clave: 'directiva_supertitulo',    valor: 'Nuestro Equipo',                                                 descripcion: 'Supra-título sección Directiva' },
    { clave: 'directiva_titulo',         valor: 'Junta Directiva',                                                descripcion: 'Título sección Directiva' },
    { clave: 'directiva_boton',          valor: 'Conócela',                                                       descripcion: 'Texto del botón Directiva' },
    { clave: 'directiva_cta',            valor: 'Conozca a la Junta Directiva',                                   descripcion: 'Texto dentro de imagen Directiva' },
    // ── Formación ────────────────────────────────────────────────────────────
    { clave: 'formacion_supertitulo',    valor: 'Potencia tu carrera',                                            descripcion: 'Supra-título sección Formación' },
    { clave: 'formacion_titulo',         valor: 'Formación',                                                      descripcion: 'Título sección Formación' },
    { clave: 'formacion_boton',          valor: 'Ver detalles del programa',                                      descripcion: 'Texto del botón de programas' },
    // ── Convenios ────────────────────────────────────────────────────────────
    { clave: 'convenios_supertitulo',    valor: 'Alianzas estratégicas',                                          descripcion: 'Supra-título sección Convenios' },
    { clave: 'convenios_titulo',         valor: 'Convenios y Beneficios',                                         descripcion: 'Título sección Convenios' },
    { clave: 'convenios_descripcion',    valor: 'Accede a servicios exclusivos gracias a nuestra red de aliados.',descripcion: 'Descripción sección Convenios' },
    { clave: 'convenios_link',           valor: 'Conoce nuestros programas de formación inmobiliaria',            descripcion: 'Texto del enlace a cursos' },
    // ── Noticias ─────────────────────────────────────────────────────────────
    { clave: 'noticias_titulo',          valor: 'Actualidad y Noticias',                                          descripcion: 'Título sección Noticias' },
    { clave: 'noticias_subtitulo',       valor: 'Mantente informado sobre el mercado inmobiliario.',              descripcion: 'Subtítulo sección Noticias' },
    { clave: 'noticias_boton',           valor: 'Ver todas',                                                      descripcion: 'Texto del botón ver más' },
    // ── Footer ───────────────────────────────────────────────────────────────
    { clave: 'footer_descripcion',       valor: 'Cámara Inmobiliaria del Estado Bolívar. Afiliada a la CIV.',     descripcion: 'Descripción pie de página' },
    { clave: 'footer_direccion',         valor: 'Carrera Guri, Nro. 255-03 - 14, Alta Vista. Piso 1, Centro Comercial Ciudad Alta Vista II, Puerto Ordaz.', descripcion: 'Dirección completa en el footer' },
    { clave: 'footer_copyright',         valor: '© 2026 Cámara Inmobiliaria del Estado Bolívar. Todos los derechos reservados.', descripcion: 'Texto de copyright' },
    { clave: 'redes_instagram',          valor: 'https://instagram.com/ciebo',                                    descripcion: 'URL de Instagram' },
    { clave: 'redes_facebook',           valor: 'https://facebook.com/ciebo',                                     descripcion: 'URL de Facebook' },
    { clave: 'redes_linkedin',           valor: 'https://linkedin.com/company/ciebo',                             descripcion: 'URL de LinkedIn' },
    // ── Institucional ────────────────────────────────────────────────────────
    { clave: 'mision',                   valor: 'Promover el desarrollo profesional de los corredores inmobiliarios del Estado Bolívar a través de formación, representación y defensa de sus intereses ante los organismos públicos y privados.', descripcion: 'Texto de la Misión' },
    { clave: 'vision',                   valor: 'Ser la organización gremial inmobiliaria más influyente y reconocida del sur de Venezuela, referente de ética, formación y progreso para el sector.', descripcion: 'Texto de la Visión' },
    { clave: 'proposito',                valor: 'Unir, representar y fortalecer a los profesionales del sector inmobiliario del Estado Bolívar.',  descripcion: 'Texto de Propósito institucional' },
    { clave: 'contacto_email',           valor: 'contacto@ciebo.org.ve',                                          descripcion: 'Email de contacto público' },
    { clave: 'contacto_telefono',        valor: '+58 (285) 000-0000',                                             descripcion: 'Teléfono de contacto' },
    { clave: 'rif',                      valor: 'J-30462520-0',                                                   descripcion: 'RIF de la cámara' },
  ];


  for (const c of config) {
    await db.execute({
      sql: `INSERT OR IGNORE INTO cms_configuracion (clave, valor, descripcion) VALUES (?, ?, ?)`,
      args: [c.clave, c.valor, c.descripcion],
    });
    console.log(`  ✓ Config: ${c.clave}`);
  }

  console.log('\nSeed completado exitosamente.\n');
}

seed().catch(err => {
  console.error('Error en seed:', err);
  process.exit(1);
});
