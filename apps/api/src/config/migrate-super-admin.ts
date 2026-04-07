import { db } from '../lib/db.js'

async function migrate() {
  console.log('Migrating users table to add super_admin role...')
  
  try {
    await db.execute('PRAGMA foreign_keys = OFF;')
    
    // We recreate the table with the modified CHECK constraint
    const recreateTable = `
      CREATE TABLE IF NOT EXISTS users_new (
        id            INTEGER  PRIMARY KEY,
        email         TEXT     NOT NULL UNIQUE,
        password_hash TEXT     NOT NULL,
        rol           TEXT     NOT NULL DEFAULT 'afiliado'
                      CHECK (rol IN ('admin', 'afiliado', 'super_admin')),
        id_agremiado  INTEGER  REFERENCES agremiados(id_agremiado) ON DELETE SET NULL,
        activo        INTEGER  NOT NULL DEFAULT 1
                      CHECK (activo IN (0, 1)),
        creado_en     TEXT     NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ','now'))
      );
    `
    await db.execute(recreateTable)
    
    // Copy data
    await db.execute(`INSERT INTO users_new SELECT * FROM users;`)
    
    // Swap tables
    await db.execute(`DROP TABLE users;`)
    await db.execute(`ALTER TABLE users_new RENAME TO users;`)
    
    // Recreate indexes
    await db.execute(`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)`)
    await db.execute(`CREATE INDEX IF NOT EXISTS idx_users_rol   ON users(rol)`)
    
    await db.execute('PRAGMA foreign_keys = ON;')
    
    console.log('Migration successful.')
  } catch (err) {
    console.error('Migration failed:', err)
  }
}

migrate()
