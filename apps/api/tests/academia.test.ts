import { describe, it, expect, beforeAll } from 'vitest'
import request from 'supertest'
import app from '../src/index'

describe('Academia Admin Endpoints', () => {
  let token: string

  beforeAll(async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@admin.com',
        password: 'admin12'
      })
    token = res.body.token
  })

  it('GET /api/academia/cursos - should return success with token', async () => {
    const res = await request(app)
      .get('/api/academia/cursos')
      .set('Authorization', `Bearer ${token}`)
    
    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('success', true)
  })

  it('GET /api/academia/preinscripciones - should return success with token', async () => {
    const res = await request(app)
      .get('/api/academia/preinscripciones')
      .set('Authorization', `Bearer ${token}`)
    
    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('success', true)
  })

  it('GET /api/academia/estudiantes - should return success with token', async () => {
    const res = await request(app)
      .get('/api/academia/estudiantes')
      .set('Authorization', `Bearer ${token}`)
    
    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('success', true)
  })

  it('GET /api/academia/cursos - should return 401 without token', async () => {
    const res = await request(app).get('/api/academia/cursos')
    expect(res.status).toBe(401)
  })
})
