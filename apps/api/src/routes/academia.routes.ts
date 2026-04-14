import { Router } from 'express'
import {
  adminAsignarEstudianteACurso,
  adminAprobarPreinscripcion,
  adminGetEstudiante,
  adminListCursos,
  adminCreateCurso,
  adminUpdateCurso,
  adminDeleteCurso,
  adminListEstudiantes,
  adminListPreinscripciones,
  adminRechazarPreinscripcion,
  adminCompletarCursoEstudiante,
  academiaAdminGuards,
} from '../controllers/academia.controller.js'

const router = Router()

// Todo lo de este router es para panel administrativo
router.use(...academiaAdminGuards)

// GET /api/academia/cursos?estatus=Abierto&programaCodigo=PADI
router.get('/cursos', adminListCursos)
// POST /api/academia/cursos
router.post('/cursos', adminCreateCurso)
// PUT /api/academia/cursos/:id
router.put('/cursos/:id', adminUpdateCurso)
// DELETE /api/academia/cursos/:id  (soft-delete → Cerrado)
router.delete('/cursos/:id', adminDeleteCurso)

// GET /api/academia/preinscripciones?programaCodigo=PADI&estatus=Preinscrito
router.get('/preinscripciones', adminListPreinscripciones)

// GET /api/academia/estudiantes?query=
router.get('/estudiantes', adminListEstudiantes)

// GET /api/academia/estudiantes/:id
router.get('/estudiantes/:id', adminGetEstudiante)

// POST /api/academia/cursos/:id_curso/asignar
router.post('/cursos/:id_curso/asignar', adminAsignarEstudianteACurso)

// PATCH /api/academia/inscripciones/:id/aprobar
router.patch('/inscripciones/:id/aprobar', adminAprobarPreinscripcion)

// PATCH /api/academia/inscripciones/:id/rechazar
router.patch('/inscripciones/:id/rechazar', adminRechazarPreinscripcion)

// PATCH /api/academia/inscripciones/:id/completar
router.patch('/inscripciones/:id/completar', adminCompletarCursoEstudiante)

export { router as academiaRoutes }

