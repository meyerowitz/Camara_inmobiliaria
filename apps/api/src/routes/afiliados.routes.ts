import { Router } from 'express';
import { registerAfiliado, getAfiliados, getAfiliadoById, aprobarAfiliado, getSolicitudesCibir, rechazarAfiliado, verificarEmail, formalizarInscripcion } from '../controllers/afiliados.controller.js';
import { requireAuth } from '../middlewares/auth.middleware.js';

const router = Router();

// GET /api/afiliados
router.get('/', getAfiliados);

// GET /api/afiliados/cibir/solicitudes
router.get('/cibir/solicitudes', getSolicitudesCibir);

// GET /api/afiliados/:id — para el portal del afiliado (requiere auth)
router.get('/:id', requireAuth, getAfiliadoById);

// POST /api/afiliados/registro
router.post('/registro', registerAfiliado);

// POST /api/afiliados/registro/verificar
router.post('/registro/verificar', verificarEmail);

// POST /api/afiliados/formalizar — Para que el afiliado pague su inscripción
router.post('/formalizar', requireAuth, formalizarInscripcion);

// PATCH /api/afiliados/:id/aprobar
router.patch('/:id/aprobar', aprobarAfiliado);

// PATCH /api/afiliados/:id/rechazar
router.patch('/:id/rechazar', rechazarAfiliado);

export { router as afiliadosRoutes };

