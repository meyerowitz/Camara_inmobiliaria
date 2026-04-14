import { Router } from 'express'
import { getUsers, createUser, updateUser, resetUserPassword, deleteUser } from '../controllers/users.controller.js'
import { requireAuth, requireRole } from '../middlewares/auth.middleware.js'

const router = Router()

// Todas las rutas de usuarios requieren autenticación de admin o super_admin
router.use(requireAuth, requireRole('admin', 'super_admin'))

// GET /api/users — listar usuarios
router.get('/', getUsers)

// POST /api/users — crear usuario
router.post('/', createUser)

// PATCH /api/users/:id — actualizar usuario
router.patch('/:id', updateUser)

// POST /api/users/:id/reset — reset de contraseña
router.post('/:id/reset', resetUserPassword)

// DELETE /api/users/:id — eliminar usuario (solo super_admin internally in controller)
router.delete('/:id', deleteUser)

export { router as usersRoutes }
