import React, { useState } from 'react'

// ─── Types ────────────────────────────────────────────────────────────────────
type ArticleStatus = 'Published' | 'Draft' | 'Review'

interface Article {
  id: string
  title: string
  excerpt: string
  category: string
  author: string
  authorInitial: string
  authorColor: string
  date: string
  status: ArticleStatus
  readTime: string
  tags: string[]
}

// ─── Static data ─────────────────────────────────────────────────────────────
const ARTICLES: Article[] = [
  { id: '1', title: 'CIEBO lanza nueva plataforma digital para afiliados', excerpt: 'La Cámara Inmobiliaria del Estado Bolívar presenta su nuevo sistema de gestión en línea, que permitirá a los afiliados realizar trámites, consultar su estado de cuenta y acceder a formación desde cualquier dispositivo.', category: 'Noticias', author: 'Pedro Vallenilla', authorInitial: 'P', authorColor: 'bg-indigo-400', date: 'Mar 01, 2026', status: 'Published', readTime: '3 min', tags: ['Tecnología', 'Afiliados', 'Plataforma'] },
  { id: '2', title: 'Convocatoria: Asamblea Extraordinaria — Febrero 2026', excerpt: 'La Junta Directiva convoca a todos los afiliados a la deliberación de la agenda correspondiente al período 2025-2027, incluyendo la formalización de la nueva directiva y el Plan de Gestión.', category: 'Convocatoria', author: 'Francisco Piñango', authorInitial: 'F', authorColor: 'bg-violet-400', date: 'Feb 20, 2026', status: 'Published', readTime: '2 min', tags: ['Asamblea', 'Directiva', 'Oficial'] },
  { id: '3', title: 'Próximo taller: Marketing Digital para Corredores', excerpt: 'El Centro de Formación CIEBO anuncia la apertura de inscripciones para el taller de Marketing Digital para Real Estate, dictado por la Lic. Elena Pérez el próximo 20 de marzo.', category: 'Evento', author: 'Graciela Ledezma', authorInitial: 'G', authorColor: 'bg-emerald-400', date: 'Feb 15, 2026', status: 'Published', readTime: '2 min', tags: ['Taller', 'Marketing', 'Formación'] },
  { id: '4', title: 'Comunicado: Actualización del Código de Ética CIV', excerpt: 'La Cámara Inmobiliaria de Venezuela publicó una nueva versión del Código de Ética profesional. Todos los afiliados deben revisar los cambios en el Artículo 14 referente a publicidad y comunicaciones.', category: 'Comunicado', author: 'Margot Castro', authorInitial: 'M', authorColor: 'bg-amber-400', date: 'Feb 10, 2026', status: 'Review', readTime: '5 min', tags: ['CIV', 'Ética', 'Normativa'] },
  { id: '5', title: 'Informe de gestión Q1 2026 — Resumen ejecutivo', excerpt: 'Presentamos los principales logros del primer trimestre: 12 nuevos afiliados, 3 cursos realizados, firma de convenio con la Cámara de Comercio de Bolívar y avance del sistema digital.', category: 'Informe', author: 'Romelina Rodríguez', authorInitial: 'R', authorColor: 'bg-pink-400', date: 'Feb 05, 2026', status: 'Draft', readTime: '8 min', tags: ['Informe', 'Gestión', 'Q1'] },
  { id: '6', title: 'CIEBO firma convenio con Cámara de Comercio de Bolívar', excerpt: 'Acuerdo estratégico que permitirá a los afiliados acceder a beneficios cruzados, eventos conjuntos y representación ante organismos públicos del sector comercial e industrial del estado.', category: 'Noticias', author: 'Pedro Castro', authorInitial: 'PC', authorColor: 'bg-blue-400', date: 'Jan 28, 2026', status: 'Draft', readTime: '4 min', tags: ['Convenio', 'Alianza', 'Bolívar'] },
]

const STATUS_STYLES: Record<ArticleStatus, string> = {
  Published: 'bg-emerald-50 text-emerald-600',
  Draft: 'bg-slate-100  text-slate-500',
  Review: 'bg-amber-50   text-amber-600',
}

const STATUS_LABELS: Record<ArticleStatus, string> = {
  Published: 'Publicado',
  Draft: 'Borrador',
  Review: 'Revisión',
}

// ─── Article row ──────────────────────────────────────────────────────────────
const ArticleRow = ({ article, selected, onSelect }: { article: Article; selected: boolean; onSelect: () => void }) => (
  <button
    onClick={onSelect}
    className={['w-full text-left px-4 sm:px-5 py-4 border-b border-gray-50 transition-colors flex flex-col gap-1.5 group', selected ? 'bg-[#E9FAF4]' : 'hover:bg-slate-50/60'].join(' ')}
  >
    <div className='flex items-start justify-between gap-2'>
      <span className={['text-sm font-semibold leading-snug flex-1', selected ? 'text-[#00B870]' : 'text-slate-800 group-hover:text-slate-900'].join(' ')}>
        {article.title}
      </span>
      <span className={`flex-shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full ${STATUS_STYLES[article.status]}`}>
        {STATUS_LABELS[article.status]}
      </span>
    </div>
    <p className='text-xs text-slate-400 leading-snug line-clamp-2'>{article.excerpt}</p>
    <div className='flex items-center gap-2 mt-0.5 flex-wrap'>
      <span className='text-[10px] text-slate-400'>{article.date}</span>
      <span className='text-[10px] text-slate-300'>·</span>
      <span className='text-[10px] text-slate-400'>{article.readTime}</span>
      <span className='text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-full font-medium'>{article.category}</span>
    </div>
  </button>
)

// ─── Article preview ──────────────────────────────────────────────────────────
const ArticlePreview = ({ article, onBack }: { article: Article; onBack?: () => void }) => (
  <div className='flex flex-col h-full'>
    {/* Toolbar */}
    <div className='flex items-center justify-between px-4 sm:px-6 py-3 border-b border-gray-100 bg-white flex-shrink-0 gap-2 flex-wrap'>
      <div className='flex items-center gap-1.5'>
        {/* Back button — mobile only */}
        {onBack && (
          <button
            onClick={onBack}
            className='sm:hidden flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-700 mr-2'
          >
            <svg viewBox='0 0 24 24' className='w-4 h-4' fill='none' stroke='currentColor' strokeWidth='2.5' strokeLinecap='round'><polyline points='15 18 9 12 15 6' /></svg>
            Volver
          </button>
        )}
        {(['B', 'I', 'U'] as const).map((f) => (
          <button key={f} className='w-7 h-7 rounded-lg text-xs font-bold text-slate-500 hover:bg-slate-100 flex items-center justify-center transition-colors'>{f}</button>
        ))}
        <div className='w-px h-4 bg-gray-200 mx-1' />
        {(['H1', 'H2'] as const).map((h) => (
          <button key={h} className='px-2 h-7 rounded-lg text-[10px] font-bold text-slate-500 hover:bg-slate-100 flex items-center justify-center transition-colors'>{h}</button>
        ))}
        <div className='w-px h-4 bg-gray-200 mx-1 hidden sm:block' />
        <button className='hidden sm:flex w-7 h-7 rounded-lg items-center justify-center text-slate-500 hover:bg-slate-100 transition-colors'>
          <svg viewBox='0 0 24 24' className='w-3.5 h-3.5' fill='none' stroke='currentColor' strokeWidth='2.5' strokeLinecap='round'>
            <line x1='8' y1='6' x2='21' y2='6' /><line x1='8' y1='12' x2='21' y2='12' /><line x1='8' y1='18' x2='21' y2='18' />
            <line x1='3' y1='6' x2='3.01' y2='6' /><line x1='3' y1='12' x2='3.01' y2='12' /><line x1='3' y1='18' x2='3.01' y2='18' />
          </svg>
        </button>
      </div>
      <div className='flex items-center gap-2'>
        <button className='text-xs font-semibold text-slate-500 px-2.5 sm:px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-slate-50 transition-colors whitespace-nowrap'>
          Guardar borrador
        </button>
        <button className='text-xs font-semibold bg-[#00D084] text-white px-2.5 sm:px-3 py-1.5 rounded-lg hover:bg-[#00B870] transition-colors'>
          Publicar
        </button>
      </div>
    </div>

    {/* Editor body */}
    <div className='flex-1 overflow-y-auto px-4 sm:px-8 py-5 sm:py-6 bg-white'>
      <h1 className='text-xl sm:text-2xl font-bold text-slate-900 mb-2 leading-tight'>{article.title}</h1>

      <div className='flex items-center gap-2 sm:gap-3 mb-5 flex-wrap'>
        <span className={`flex-shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_STYLES[article.status]}`}>
          {STATUS_LABELS[article.status]}
        </span>
        <span className='text-xs text-slate-400'>{article.date}</span>
        <span className='text-xs text-slate-300'>·</span>
        <span className='text-xs text-slate-400'>{article.readTime}</span>
      </div>

      {/* Simulated image */}
      <div className='w-full h-36 sm:h-44 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 mb-5 flex items-center justify-center overflow-hidden relative'>
        <svg viewBox='0 0 24 24' className='w-10 h-10 text-slate-300' fill='none' stroke='currentColor' strokeWidth='1.5'>
          <rect x='3' y='3' width='18' height='18' rx='2' />
          <circle cx='8.5' cy='8.5' r='1.5' />
          <polyline points='21 15 16 10 5 21' />
        </svg>
        <span className='absolute bottom-3 left-3 text-[10px] text-slate-400 bg-white/80 px-2 py-0.5 rounded-full'>Imagen destacada</span>
      </div>

      <p className='text-sm text-slate-600 leading-relaxed mb-4'>{article.excerpt}</p>
      <p className='text-sm text-slate-500 leading-relaxed mb-4'>
        Este contenido forma parte de las comunicaciones oficiales de la Cámara Inmobiliaria del Estado Bolívar (CIEBO). Su publicación está sujeta a aprobación de la Junta Directiva.
      </p>

      <h2 className='text-base font-bold text-slate-800 mb-2 mt-5'>Puntos clave</h2>
      <ul className='space-y-1.5 mb-5'>
        {['Información verificada por la Junta Directiva', 'Imagen destacada requerida para publicar', 'Categoría y etiquetas correctamente asignadas', 'Enlace compartible automático al publicar'].map((f) => (
          <li key={f} className='flex items-center gap-2 text-sm text-slate-600'>
            <span className='w-1.5 h-1.5 rounded-full bg-[#00D084] flex-shrink-0' />
            {f}
          </li>
        ))}
      </ul>

      <div className='flex flex-wrap gap-1.5 mb-5'>
        {article.tags.map((t) => (
          <span key={t} className='text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full font-medium'>#{t}</span>
        ))}
      </div>

      <div className='flex items-center gap-3 pt-4 border-t border-gray-100'>
        <div className={`w-8 h-8 rounded-full ${article.authorColor} flex items-center justify-center text-white text-sm font-bold flex-shrink-0`}>
          {article.authorInitial}
        </div>
        <div>
          <p className='text-sm font-semibold text-slate-800'>{article.author}</p>
          <p className='text-xs text-slate-400'>Autor</p>
        </div>
      </div>
    </div>
  </div>
)

// ─── Main panel ───────────────────────────────────────────────────────────────
const CmsArticlesPanel = () => {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<ArticleStatus | 'All'>('All')

  const filtered = ARTICLES.filter((a) => {
    const matchSearch = a.title.toLowerCase().includes(search.toLowerCase())
    const matchFilter = filter === 'All' || a.status === filter
    return matchSearch && matchFilter
  })

  const selected = selectedId ? ARTICLES.find((a) => a.id === selectedId) ?? null : null

  return (
    <div className='flex h-full bg-gray-50 overflow-hidden'>

      {/* ── Left: article list ── */}
      <div className={[
        'flex flex-col bg-white border-r border-gray-100 overflow-hidden flex-shrink-0',
        'w-full sm:w-[280px] md:w-[320px]',
        selected ? 'hidden sm:flex' : 'flex',
      ].join(' ')}>

        {/* Search + filters */}
        <div className='px-4 pt-4 pb-3 flex flex-col gap-2 border-b border-gray-100'>
          <div className='relative'>
            <svg viewBox='0 0 24 24' className='absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400' fill='none' stroke='currentColor' strokeWidth='2.5' strokeLinecap='round'>
              <circle cx='11' cy='11' r='8' /><line x1='21' y1='21' x2='16.65' y2='16.65' />
            </svg>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder='Buscar contenido…'
              className='w-full pl-9 pr-3 py-2 text-xs rounded-lg bg-gray-50 border border-gray-100 placeholder-slate-300 text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#00D084]/40 focus:border-[#00D084] transition-all'
            />
          </div>
          <div className='flex gap-1.5 flex-wrap'>
            {(['All', 'Published', 'Draft', 'Review'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={['text-[10px] font-semibold px-2.5 py-1 rounded-full transition-colors', filter === s ? 'bg-[#00D084] text-white' : 'bg-gray-100 text-slate-500 hover:bg-gray-200'].join(' ')}
              >
                {{ All: 'Todos', Published: 'Publicado', Draft: 'Borrador', Review: 'Revisión' }[s]}
              </button>
            ))}
          </div>
        </div>

        {/* Article list */}
        <div className='flex-1 overflow-y-auto divide-y divide-gray-50'>
          {filtered.length === 0 ? (
            <p className='text-xs text-slate-400 text-center py-10'>Sin resultados</p>
          ) : (
            filtered.map((a) => (
              <ArticleRow
                key={a.id}
                article={a}
                selected={selectedId === a.id}
                onSelect={() => setSelectedId(a.id)}
              />
            ))
          )}
        </div>

        {/* New article button */}
        <div className='p-4 border-t border-gray-100'>
          <button className='w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#00D084] text-white text-sm font-semibold hover:bg-[#00B870] transition-colors'>
            <svg viewBox='0 0 24 24' className='w-4 h-4' fill='none' stroke='currentColor' strokeWidth='3' strokeLinecap='round'>
              <line x1='12' y1='5' x2='12' y2='19' /><line x1='5' y1='12' x2='19' y2='12' />
            </svg>
            Nuevo contenido
          </button>
        </div>
      </div>

      {/* ── Right: article preview/editor ── */}
      <div className={[
        'flex-1 min-w-0 overflow-hidden bg-white',
        selected ? 'flex flex-col' : 'hidden sm:flex sm:flex-col',
      ].join(' ')}>
        {selected ? (
          <ArticlePreview article={selected} onBack={() => setSelectedId(null)} />
        ) : (
          <div className='flex flex-col items-center justify-center h-full gap-3 text-slate-300'>
            <svg viewBox='0 0 24 24' className='w-12 h-12' fill='none' stroke='currentColor' strokeWidth='1.5'>
              <path d='M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z' />
              <polyline points='14 2 14 8 20 8' />
              <line x1='16' y1='13' x2='8' y2='13' />
              <line x1='16' y1='17' x2='8' y2='17' />
            </svg>
            <p className='text-sm font-medium'>Selecciona un artículo</p>
          </div>
        )}
      </div>

    </div>
  )
}

export default CmsArticlesPanel
