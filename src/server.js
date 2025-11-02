import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import { pool } from './db.js'; // ✅ db داخل src
import authRoutes from './routes/authRoutes.js'; // ✅ كل الراوتات داخل src
import guidesRoutes from './routes/guidesRoutes.js';
// import alertsRoutes from './routes/alertsRoutes.js';

const app = express();
app.use(cors());
app.use(express.json());

console.log('✅ server.js loaded, routes being registered...');

app.get('/api/health', async (_req, res) => {
  try {
    const [rows] = await pool.query('SELECT NOW() AS time');
    res.json({ status: 'ok', db_time: rows[0].time });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.use('/api/v1/auth', authRoutes);
// app.use('/api/v1/guides', guidesRoutes);
app.use('/api/v1/guides', guidesRoutes);

// app.use('/api/v1/alerts', alertsRoutes);

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`✅ Server running at http://localhost:${port}`));
