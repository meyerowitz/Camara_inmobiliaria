import { describe, it, expect } from 'vitest'
import request from 'supertest'
import app from '../src/index'

describe('Public Endpoints', () => {
  it('GET /api/public/afiliados/buscar - should return success', async () => {
    const res = await request(app).get('/api/public/afiliados/buscar')
    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('success', true)
    expect(Array.isArray(res.body.data)).toBe(true)
  })

  it('GET /api/public/cursos - should return success', async () => {
    const res = await request(app).get('/api/public/cursos')
    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('success', true)
    expect(Array.isArray(res.body.data)).toBe(true)
  })

  it('GET /api/public/normativas - should return success', async () => {
    const res = await request(app).get('/api/public/normativas')
    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('success', true)
    expect(Array.isArray(res.body.data)).toBe(true)
  })

  it('GET /api/public/paginas/inicio - should return page data or 404', async () => {
    const res = await request(app).get('/api/public/paginas/inicio')
    expect([200, 404]).toContain(res.status)
  })
})
