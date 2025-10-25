import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import { pool } from './db.js';
import authRoutes from './routes/authRoutes.js';
import appointmentRoutes from './routes/appointmentRoutes.js'; 
import doctorRoutes from './routes/doctorRoutes.js';
import sponsorshipRoutes from './routes/sponsorshipRoutes.js';

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/health', async (_req, res) => {
  try {
    const [rows] = await pool.query('SELECT NOW() AS time');
    res.json({ status: 'ok', db_time: rows[0].time });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.use('/api/v1/auth', authRoutes);

app.use('/api/v1/appointments', appointmentRoutes);

app.use('/api/v1/doctors', doctorRoutes);

app.use('/api/v1/sponsorship', sponsorshipRoutes);

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`✅ Server running at http://localhost:${port}`));
