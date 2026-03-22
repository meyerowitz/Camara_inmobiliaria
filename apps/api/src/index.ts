import express, { Request, Response } from 'express'
import cors from 'cors'
import { env } from './config/env.js'
import { afiliadosRoutes, publicRoutes } from './routes/index.js'


const app = express()

// Middleware
app.use(cors({ origin: env.CORS_ORIGIN }))
app.use(express.json())

// Rutas de API
app.use('/api/afiliados', afiliadosRoutes)
app.use('/api/public', publicRoutes)

// Rutas base
app.get('/', (req: Request, res: Response) => {
  res.json({ message: 'API de Cámara Inmobiliaria en línea' })
})

app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

export default app

// Solo escuchar si no estamos en un entorno serverless (Vercel)
if (process.env.NODE_ENV !== 'production' || process.env.VERCEL !== '1') {
  app.listen(env.PORT, () => {
    console.log(`API ejecutándose en http://localhost:${env.PORT}`)
  })
}
