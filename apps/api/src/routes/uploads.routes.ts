import { Router } from 'express'
import { presignUpload } from '../controllers/uploads.controller.js'
import { requireAuth, requireRole } from '../middlewares/auth.middleware.js'

const router = Router()

// Solo admin/super_admin pueden generar URLs firmadas.
router.post('/presign', requireAuth, requireRole('admin', 'super_admin'), presignUpload)

export { router as uploadsRoutes }

