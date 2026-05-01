import { db } from './apps/api/src/lib/db.js';

async function checkSchema() {
  try {
    const result = await db.execute("PRAGMA table_info(agremiados)");
    console.log(JSON.stringify(result.rows, null, 2));
  } catch (e) {
    console.error(e);
  }
}

checkSchema();
