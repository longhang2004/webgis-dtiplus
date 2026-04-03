import { Router, Request, Response } from 'express';
import { pool } from '../db/connection';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  try {
    const year = req.query.year ? parseInt(req.query.year as string) : null;
    const pillar = (req.query.pillar as string) ?? 'total';

    let query = `SELECT region_id, year, total, gov, econ, soc, is_estimate FROM dti_data`;
    const params: unknown[] = [];

    if (year) {
      query += ` WHERE year = $1 ORDER BY ${pillar} DESC`;
      params.push(year);
    } else {
      query += ` ORDER BY year ASC, ${pillar} DESC`;
    }

    const result = await pool.query(query, params);
    res.json({ data: result.rows });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

export default router;
