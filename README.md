# CIEBO — Cámara Inmobiliaria del Estado Bolívar

Plataforma web institucional y de gestión para la **Cámara Inmobiliaria del Estado Bolívar (CIEBO)**. Este monorepo agrupa el frontend público/administrativo y el backend REST API bajo una única base de código gestionada con **pnpm workspaces** y **Turborepo**.

---

## 📁 Estructura del Monorepo

```
camara_inmobiliaria/
├── apps/
│   ├── api/          # Backend REST — Express 5 + TypeScript + Turso (LibSQL)
│   └── web/          # Frontend — React 19 + Vite + TailwindCSS 4
├── turbo.json        # Configuración de Turborepo
├── pnpm-workspace.yaml
└── package.json
```

---

## 🚀 Inicio Rápido

### Requisitos previos

| Herramienta | Versión mínima |
|---|---|
| Node.js | ≥ 18 |
| pnpm | 10.30.0 |

### 1. Clonar e instalar dependencias

```bash
git clone <repo-url>
cd camara_inmobiliaria
pnpm install
```

### 2. Configurar variables de entorno

```bash
# API
cp apps/api/.env.example apps/api/.env
# Edita apps/api/.env con tus credenciales de Turso

# Web
cp apps/web/.env.example apps/web/.env
# Edita apps/web/.env con la URL de la API
```

### 3. Levantar en modo desarrollo

```bash
pnpm dev
# Inicia ambas apps en paralelo via Turborepo
# API  → http://localhost:3000
# Web  → http://localhost:5173
```

---

## 📦 Paquetes

| Paquete | Descripción | README |
|---|---|---|
| `apps/api` | REST API — Express 5, TypeScript, Turso/LibSQL | [Ver →](./apps/api/README.md) |
| `apps/web` | Frontend React — Vite, TailwindCSS, Panel Admin | [Ver →](./apps/web/README.md) |

---

## 🛠️ Scripts Disponibles (raíz)

| Comando | Acción |
|---|---|
| `pnpm dev` | Inicia todos los paquetes en modo desarrollo |
| `pnpm build` | Compila todos los paquetes para producción |
| `pnpm lint` | Ejecuta ESLint en todos los paquetes |
| `pnpm check-types` | Verificación de tipos TypeScript en todos los paquetes |

---

## 🌐 Funcionalidades Principales

- **Landing pública** — Presentación institucional de CIEBO con secciones de Hero, Nosotros, Formación, Convenios, Noticias, Junta Directiva e Historia.
- **Portal de Afiliados** — Registro de afiliados, seguimiento de solicitudes al programa CIBIR e información personalizada.
- **Panel Administrativo (CMS)** — Editor visual con vista previa en vivo de la landing page; gestión completa de noticias, cursos, convenios, directiva e hitos a través de una interfaz de pantalla dividida y redimensionable.
- **API REST** — Backend tipado con validación Zod, conexión a Turso (SQLite edge) y soporte serverless Vercel.

---

## 🔧 Tecnologías Clave

| Área | Stack |
|---|---|
| Build | Turborepo · pnpm workspaces |
| Frontend | React 19 · Vite 7 · TailwindCSS 4 · React Router 7 |
| Backend | Express 5 · TypeScript · Zod |
| Base de datos | Turso (LibSQL / SQLite edge) |
| Despliegue | Vercel (frontend + backend serverless) |

---