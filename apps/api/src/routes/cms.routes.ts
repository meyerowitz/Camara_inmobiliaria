import { Router } from 'express';
import {
  getNoticias, createNoticia, updateNoticia, deleteNoticia,
  getCursos, createCurso, updateCurso, deleteCurso,
  getConvenios, createConvenio, updateConvenio, deleteConvenio,
  getDirectiva, createMiembroDirectiva, updateMiembroDirectiva, deleteMiembroDirectiva,
  getHitos, createHito, updateHito, deleteHito,
  getConfig, upsertConfig, upsertConfigBatch, deleteConfig,
} from '../controllers/cms.controller.js';

const router = Router();

// ── Noticias ──────────────────────────────────────────
router.get('/noticias', getNoticias);
router.post('/noticias', createNoticia);
router.put('/noticias/:id', updateNoticia);
router.delete('/noticias/:id', deleteNoticia);

// ── Cursos ────────────────────────────────────────────
router.get('/cursos', getCursos);
router.post('/cursos', createCurso);
router.put('/cursos/:id', updateCurso);
router.delete('/cursos/:id', deleteCurso);

// ── Convenios ─────────────────────────────────────────
router.get('/convenios', getConvenios);
router.post('/convenios', createConvenio);
router.put('/convenios/:id', updateConvenio);
router.delete('/convenios/:id', deleteConvenio);

// ── Directiva ─────────────────────────────────────────
router.get('/directiva', getDirectiva);
router.post('/directiva', createMiembroDirectiva);
router.put('/directiva/:id', updateMiembroDirectiva);
router.delete('/directiva/:id', deleteMiembroDirectiva);

// ── Hitos ─────────────────────────────────────────────
router.get('/hitos', getHitos);
router.post('/hitos', createHito);
router.put('/hitos/:id', updateHito);
router.delete('/hitos/:id', deleteHito);

// ── Configuración ─────────────────────────────────────
router.get('/config', getConfig);
router.post('/config', upsertConfig);
router.post('/config/batch', upsertConfigBatch);
router.delete('/config/:clave', deleteConfig);

export { router as cmsRoutes };
