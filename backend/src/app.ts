import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import dtiRouter from './routes/dti';
import regionsRouter from './routes/regions';
import geojsonRouter from './routes/geojson';
import { pool } from './db/connection';

dotenv.config();

const app = express();
const PORT = process.env.PORT ?? 3001;

app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://webgis-dtiplus.vercel.app',
    'https://webgisdtiplus.vercel.app',
  ],
}));
app.use(express.json());

// RESTful API routes
app.use('/api/dti', dtiRouter);
app.use('/api/regions', regionsRouter);
app.use('/api/geojson', geojsonRouter);

app.get('/api/health', async (_req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        postgis_full_version() AS postgis_version,
        COUNT(*) FILTER (WHERE geom IS NOT NULL) AS geometry_loaded,
        COUNT(*) AS region_count
      FROM regions
    `);
    const row = result.rows[0];
    res.json({
      status: 'ok',
      version: '1.0.0',
      database: 'connected',
      postgis: row.postgis_version,
      geometry_loaded: Number(row.geometry_loaded),
      region_count: Number(row.region_count),
    });
  } catch (err) {
    res.status(503).json({
      status: 'degraded',
      version: '1.0.0',
      database: 'unavailable',
      error: String(err),
    });
  }
});

app.listen(PORT, () => {
  console.log(`[WebGIS DTI+] Backend running at http://localhost:${PORT}`);
  console.log(`[WebGIS DTI+] Architecture: Node.js v18 + Express.js v4 + PostgreSQL 14 + PostGIS 3.3`);
});

export default app;
