import { Router } from 'express';
import { buscarAfiliadosPublic } from '../controllers/afiliados.controller.js';

const router = Router();

// GET /api/public/afiliados/buscar
router.get('/afiliados/buscar', buscarAfiliadosPublic);

export { router as publicRoutes };
