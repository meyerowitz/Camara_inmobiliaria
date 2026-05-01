import { createClient } from '@libsql/client';

const db = createClient({
  url: 'libsql://ciebo-jennorg.aws-us-east-1.turso.io',
  authToken: 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3Nzc0ODg2MDQsImlkIjoiMDE5ZGRhOTMtOGUwMS03ZTU5LTgzN2UtYTgyMWQ1NWM4YjAzIiwicmlkIjoiYjFkMjBjNGUtM2YyYy00NGQyLWFjZDktMTY0YTk4NDVlNDRjIn0.Jt6Ebr-86al8ltCgE1_WEMeSai4j4fzwZnHYhI3J99UyOqd8_yC9Q7FeVz-frYi_L7JCk6ZzQkaB6NCXMr5mBw'
});

async function main() {
  const res = await db.execute("SELECT name, sql FROM sqlite_master WHERE type='trigger'");
  console.log(res.rows);
}

main().catch(console.error);
