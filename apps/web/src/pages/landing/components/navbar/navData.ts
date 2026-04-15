/* ─────────────────────────────────────────────────────────────────────────────
   DATOS DEL MENÚ INTEGRADOS (Autocontenidos)
   ───────────────────────────────────────────────────────────────────────────── */
export const NAV_ITEMS = [
  {
    title: 'Nosotros',
    items: [
      { label: 'Misión y Visión', path: '/mision_vision' },
      { label: 'Propósito', path: '/proposito' },
      { label: 'Junta Directiva', path: '/junta_directiva' },
    ],
    Tpath: '',
  },
  // { title: 'Eventos', items: null, Tpath: '/eventos' },
  {
    title: 'Afiliados',
    items: [
      { label: 'Directorio', path: '/directorio' },
      { label: 'Beneficios', path: '/beneficios' },
      { label: 'Requisitos', path: '/requisitos' },
    ],
    Tpath: '',
  },
  {
    title: 'Formación',
    items: [
      { label: 'PREANI', path: '/preani' },
      { label: 'CIBIR', path: '/cibir' },
      { label: 'PEGI', path: '/pegi' },
      { label: 'PADI', path: '/padi' },
    ],
    Tpath: '',
  },
  {
    title: 'Marco Legal',
    items: [
      { label: 'Convenios', path: '/convenios' },
      { label: 'Normativas', path: '/normativas' },
    ],
    Tpath: '',
  }
  // {
  //   title: 'Prensa',
  //   items: [
  //     { label: 'Noticias', path: '#noticias' },
  //     { label: 'Galería', path: '/galeria' },
  //     { label: 'Comunicados', path: '/comunicados' },
  //   ],
  //   Tpath: '',
  // },
] as const;

/* ─────────────────────────────────────────────────────────────────────────────
   DEFINICIÓN DE TIPOS
   ───────────────────────────────────────────────────────────────────────────── */
export type NavMenuItem = typeof NAV_ITEMS[number];