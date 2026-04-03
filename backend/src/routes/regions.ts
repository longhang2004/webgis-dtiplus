import { Router, Request, Response } from 'express';
import { pool } from '../db/connection';

const router = Router();

router.get('/', async (_req: Request, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT id, name, short_name, provinces, area_km2, population FROM regions ORDER BY id`
    );
    res.json({ data: result.rows });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

export default router;
