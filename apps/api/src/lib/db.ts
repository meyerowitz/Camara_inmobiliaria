import { createClient } from '@libsql/client'
import { env } from '../config/env.js'

/**
 * Cliente de Turso/LibSQL singleton.
 * Se conecta usando TURSO_DATABASE_URL + TURSO_AUTH_TOKEN del .env
 */

export const db = createClient({
  url: env.TURSO_DATABASE_URL,
  authToken: env.TURSO_AUTH_TOKEN
})
