import { Router } from 'express';
import { registerAfiliado, getAfiliados, aprobarAfiliado } from '../controllers/afiliados.controller.js';

const router = Router();

// GET /api/afiliados
router.get('/', getAfiliados);

// POST /api/afiliados/registro
router.post('/registro', registerAfiliado);

// PATCH /api/afiliados/:id/aprobar
router.patch('/:id/aprobar', aprobarAfiliado);

export { router as afiliadosRoutes };
