import { Router, Request, Response } from 'express';
import { pool } from '../db/connection';

const router = Router();

/**
 * GET /api/dti
 * Query DTI+ data with optional filters
 * Query params: year, pillar (for sorting), region_id
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const year = req.query.year ? parseInt(req.query.year as string) : null;
    const regionId = req.query.region_id as string | undefined;
    const pillar = (req.query.pillar as string) ?? 'total';

    // Validate pillar to prevent SQL injection
    const validPillars = ['total', 'gov', 'econ', 'soc'];
    const orderCol = validPillars.includes(pillar) ? pillar : 'total';

    let query = `SELECT region_id, year, total, gov, econ, soc, is_estimate FROM dti_data`;
    const conditions: string[] = [];
    const params: unknown[] = [];

    if (year) {
      params.push(year);
      conditions.push(`year = $${params.length}`);
    }
    if (regionId) {
      params.push(regionId);
      conditions.push(`region_id = $${params.length}`);
    }

    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(' AND ')}`;
    }

    query += ` ORDER BY year ASC, ${orderCol} DESC`;

    const result = await pool.query(query, params);
    res.json({ data: result.rows });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

/**
 * GET /api/dti/stats
 * Returns aggregate statistics for a given year and pillar
 */
router.get('/stats', async (req: Request, res: Response) => {
  try {
    const year = req.query.year ? parseInt(req.query.year as string) : 2023;
    const pillar = (req.query.pillar as string) ?? 'total';
    const validPillars = ['total', 'gov', 'econ', 'soc'];
    const col = validPillars.includes(pillar) ? pillar : 'total';

    const result = await pool.query(`
      SELECT 
        AVG(${col}) as mean,
        STDDEV(${col}) as stddev,
        MAX(${col}) as max_val,
        MIN(${col}) as min_val,
        MAX(${col}) - MIN(${col}) as range_val,
        COUNT(*) as count
      FROM dti_data
      WHERE year = $1
    `, [year]);

    const row = result.rows[0];
    const mean = parseFloat(row.mean);
    const stddevVal = parseFloat(row.stddev);
    const cv = mean > 0 ? (stddevVal / mean) * 100 : 0;

    // Get highest and lowest regions
    const ranked = await pool.query(`
      SELECT region_id, ${col} as value
      FROM dti_data
      WHERE year = $1
      ORDER BY ${col} DESC
    `, [year]);

    res.json({
      year,
      pillar: col,
      mean,
      stddev: stddevVal,
      cv,
      max: parseFloat(row.max_val),
      min: parseFloat(row.min_val),
      range: parseFloat(row.range_val),
      highest: ranked.rows[0],
      lowest: ranked.rows[ranked.rows.length - 1],
    });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

/**
 * GET /api/dti/compare
 * Compare two years for convergence analysis
 */
router.get('/compare', async (req: Request, res: Response) => {
  try {
    const yearFrom = req.query.from ? parseInt(req.query.from as string) : 2020;
    const yearTo = req.query.to ? parseInt(req.query.to as string) : 2025;
    const pillar = (req.query.pillar as string) ?? 'total';
    const validPillars = ['total', 'gov', 'econ', 'soc'];
    const col = validPillars.includes(pillar) ? pillar : 'total';

    const result = await pool.query(`
      SELECT 
        a.region_id,
        a.${col} as value_from,
        b.${col} as value_to,
        b.${col} - a.${col} as absolute_change,
        CASE WHEN a.${col} > 0 
          THEN ((b.${col} - a.${col}) / a.${col}) * 100 
          ELSE 0 
        END as pct_change
      FROM dti_data a
      JOIN dti_data b ON a.region_id = b.region_id
      WHERE a.year = $1 AND b.year = $2
      ORDER BY absolute_change DESC
    `, [yearFrom, yearTo]);

    // Compute CAGR for each region
    const years = yearTo - yearFrom;
    const data = result.rows.map((row) => ({
      ...row,
      cagr: years > 0
        ? (Math.pow(parseFloat(row.value_to) / parseFloat(row.value_from), 1 / years) - 1) * 100
        : 0,
    }));

    res.json({
      from: yearFrom,
      to: yearTo,
      pillar: col,
      data,
    });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

export default router;
