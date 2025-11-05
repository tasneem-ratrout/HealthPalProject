import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { pool } from './db.js';
import adminRoutes from './routes/adminRoutes.js';
import authRoutes from './routes/authRoutes.js';
import ngoRoutes from './routes/ngoRoutes.js'; 
import missionRoutes from './routes/missionRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import postRoutes from './routes/postRoutes.js';
import DonationsRoutes from './routes/DonationsRoutes.js';
import PatientCaseRoutes from './routes/PatientCaseRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import TransparencyReportes from './routes/TransparencyReportes.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// ✅ Routes
app.get('/', (req, res) => res.send('HealthPal API Running ✅'));
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/ngo', ngoRoutes); 
app.use('/api/v1/missions', missionRoutes);
app.use('/api/v1/post', postRoutes);
app.use('/api/v1/admin', DonationsRoutes);
app.use('/api/v1/admin', PatientCaseRoutes);
app.use('/api/v1/admin', TransparencyReportes);
app.use('/api/v1/admin', reportRoutes);
const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`🚀 Server running at http://localhost:${PORT}`)
);

pool
  .getConnection()
  .then(() => console.log('✅ Connected to MySQL Database'))
  .catch((err) => console.error('❌ DB Connection Error:', err));
