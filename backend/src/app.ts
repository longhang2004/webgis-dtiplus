import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import dtiRouter from './routes/dti';
import regionsRouter from './routes/regions';

dotenv.config();

const app = express();
const PORT = process.env.PORT ?? 3001;

app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:3000'] }));
app.use(express.json());

app.use('/api/dti', dtiRouter);
app.use('/api/regions', regionsRouter);

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

app.listen(PORT, () => {
  console.log(`Backend running at http://localhost:${PORT}`);
});

export default app;
