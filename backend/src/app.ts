import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import dtiRouter from './routes/dti';
import regionsRouter from './routes/regions';
import geojsonRouter from './routes/geojson';

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

app.get('/api/health', (_req, res) => res.json({ status: 'ok', version: '1.0.0' }));

app.listen(PORT, () => {
  console.log(`[WebGIS DTI+] Backend running at http://localhost:${PORT}`);
  console.log(`[WebGIS DTI+] Architecture: Node.js v18 + Express.js v4 + PostgreSQL 14 + PostGIS 3.3`);
});

export default app;
