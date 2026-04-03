import { pool } from './connection';
import fs from 'fs';
import path from 'path';

async function migrate() {
  const sql = fs.readFileSync(path.join(__dirname, 'migrations/001_init.sql'), 'utf8');
  await pool.query(sql);
  console.log('Migration complete');
  await pool.end();
}

migrate().catch(console.error);
