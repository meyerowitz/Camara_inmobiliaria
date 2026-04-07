import { config } from 'dotenv'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import { z } from 'zod'

// Carga el .env desde apps/api/ sin importar desde dónde se ejecute el script
const __dirname = dirname(fileURLToPath(import.meta.url))
config({ path: resolve(__dirname, '../../.env') })

/**
 * Valida las variables de entorno al arrancar el servidor.
 * Exporta el objeto `env` con tipos correctos.
 */
const envSchema = z.object({
  PORT: z.coerce.number().default(3000),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  TURSO_DATABASE_URL: z.string().url(),
  TURSO_AUTH_TOKEN: z.string().min(1),
  JWT_SECRET: z.string().min(16),
  JWT_EXPIRES_IN: z.string().default('7d'),
  CORS_ORIGIN: z.string().url().default('http://localhost:5173'),
  RESEND_API_KEY: z.string().min(1)
})

export const env = envSchema.parse(process.env)
