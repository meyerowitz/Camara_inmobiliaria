import { describe, it, expect, beforeAll } from 'vitest'
import request from 'supertest'
import app from '../src/index'

describe('Auth Endpoints', () => {
  let token: string

  it('POST /api/auth/login - should login successfully with admin credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@admin.com',
        password: 'admin12'
      })
    
    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('success', true)
    expect(res.body).toHaveProperty('token')
    token = res.body.token
  })

  it('GET /api/auth/me - should return user data with valid token', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`)
    
    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('success', true)
    expect(res.body.user.email).toBe('admin@admin.com')
  })

  it('POST /api/auth/logout - should return success', async () => {
    const res = await request(app).post('/api/auth/logout')
    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('success', true)
  })

  it('GET /api/auth/me - should return 401 without token', async () => {
    const res = await request(app).get('/api/auth/me')
    expect(res.status).toBe(401)
  })
})
