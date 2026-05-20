import { Router, Request, Response } from 'express';
import { pool } from '../db/connection';

const router = Router();

/**
 * GET /api/geojson/regions
 * Returns GeoJSON FeatureCollection of Vietnam's 6 economic regions.
 * If geometry is stored in PostGIS, it will be served from there.
 * Otherwise falls back to a static response.
 */
router.get('/regions', async (_req: Request, res: Response) => {
  try {
    // Try to get geometry from PostGIS
    const result = await pool.query(`
      SELECT 
        id,
        name,
        short_name,
        area_km2,
        population,
        ST_AsGeoJSON(geom)::json AS geometry
      FROM regions
      WHERE geom IS NOT NULL
      ORDER BY id
    `);

    if (result.rows.length > 0) {
      const features = result.rows.map((row) => ({
        type: 'Feature' as const,
        properties: {
          region_id: row.id,
          name: row.name,
          short_name: row.short_name,
          area_km2: row.area_km2,
          population: row.population,
        },
        geometry: row.geometry,
      }));

      res.json({
        type: 'FeatureCollection',
        features,
      });
    } else {
      // No geometry in DB yet - return empty collection
      // Frontend will use local GeoJSON as fallback
      res.json({
        type: 'FeatureCollection',
        features: [],
        _note: 'No geometry loaded in PostGIS. Frontend uses local GeoJSON fallback.',
      });
    }
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

/**
 * GET /api/geojson/regions/:id
 * Returns GeoJSON Feature for a single region
 */
router.get('/regions/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await pool.query(`
      SELECT 
        id,
        name,
        short_name,
        area_km2,
        population,
        ST_AsGeoJSON(geom)::json AS geometry
      FROM regions
      WHERE id = $1
    `, [id]);

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Region not found' });
      return;
    }

    const row = result.rows[0];
    res.json({
      type: 'Feature',
      properties: {
        region_id: row.id,
        name: row.name,
        short_name: row.short_name,
        area_km2: row.area_km2,
        population: row.population,
      },
      geometry: row.geometry,
    });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

export default router;
