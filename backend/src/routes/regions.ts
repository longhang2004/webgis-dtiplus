import { Router, Request, Response } from 'express';
import { pool } from '../db/connection';

const router = Router();

/**
 * GET /api/regions
 * Returns all 6 economic regions with metadata
 */
router.get('/', async (_req: Request, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT id, name, short_name, provinces, area_km2, population 
       FROM regions 
       ORDER BY id`
    );
    res.json({ data: result.rows });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

/**
 * GET /api/regions/:id
 * Returns a single region with its DTI+ time series
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const regionResult = await pool.query(
      `SELECT id, name, short_name, provinces, area_km2, population 
       FROM regions WHERE id = $1`,
      [id]
    );

    if (regionResult.rows.length === 0) {
      res.status(404).json({ error: 'Region not found' });
      return;
    }

    const dtiResult = await pool.query(
      `SELECT year, total, gov, econ, soc, is_estimate 
       FROM dti_data 
       WHERE region_id = $1 
       ORDER BY year ASC`,
      [id]
    );

    res.json({
      region: regionResult.rows[0],
      dti_series: dtiResult.rows,
    });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

export default router;
