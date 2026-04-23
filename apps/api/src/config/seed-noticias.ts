/**
 * seed-noticias.ts — Siembra noticias iniciales.
 *
 * Uso (desde apps/api):
 *   pnpm exec tsx src/config/seed-noticias.ts
 */

import { db } from '../lib/db.js'

const noticiasIniciales = [
  { 
    titulo: 'Nuevas tasas de registro 2026', 
    extracto: 'Bolívar actualiza aranceles para transacciones de bienes raíces este trimestre.', 
    imagen_url: 'https://sectorpublico.softplan.com.br/wp-content/uploads/2022/04/softplanplanejamentoesistemasltda_softplan_image_440-1.jpeg', 
    tag: 'Legal',
    categoria: 'Noticias',
    fecha: new Date().toISOString(),
    publicado: 1
  },
  { 
    titulo: 'Crecimiento en Puerto Ordaz', 
    extracto: 'La zona industrial y comercial muestra signos de recuperación tras nuevas inversiones.', 
    imagen_url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=800', 
    tag: 'Mercado',
    categoria: 'Noticias',
    fecha: new Date().toISOString(),
    publicado: 1
  },
  { 
    titulo: 'Taller de Ventas Digitales', 
    extracto: 'Éxito total en el último evento presencial realizado en el Hotel Eurobuilding.', 
    imagen_url: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&q=80&w=800', 
    tag: 'Eventos',
    categoria: 'Noticias',
    fecha: new Date().toISOString(),
    publicado: 1
  },
  { 
    titulo: 'Innovación Inmobiliaria', 
    extracto: 'Nuevas tecnologías aplicadas al sector de bienes raíces en la región.', 
    imagen_url: 'https://www.elnuevoherald.com/public/ultimas-noticias/5hl2um/picture314557289/alternates/LANDSCAPE_1140/CONDO11.jpg', 
    tag: 'Tecnología',
    categoria: 'Noticias',
    fecha: new Date().toISOString(),
    publicado: 1
  }
]

async function seedNoticias() {
  console.log('Sembrando noticias iniciales...\n')

  let inserted = 0
  let skipped = 0

  for (const n of noticiasIniciales) {
    const existing = await db.execute({
      sql: `SELECT id FROM cms_noticias WHERE titulo = ? LIMIT 1`,
      args: [n.titulo],
    })

    if (existing.rows.length > 0) {
      skipped++
      continue
    }

    await db.execute({
      sql: `INSERT INTO cms_noticias (titulo, extracto, imagen_url, categoria, tag, fecha, publicado)
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
      args: [n.titulo, n.extracto, n.imagen_url, n.categoria, n.tag, n.fecha, n.publicado],
    })
    inserted++
  }

  console.log(`OK. Insertadas: ${inserted}, saltadas: ${skipped}`)
}

seedNoticias().catch((error) => {
  console.error('Error en seed de noticias:', error)
  process.exit(1)
})
