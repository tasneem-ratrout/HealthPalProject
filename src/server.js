import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { pool } from './db.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// ✅ تأكيد التشغيل
app.get('/', (req, res) => {
  res.send('HealthPal API Running ✅');
});

// ✅ إنشاء حالة مريض (Patient Case)
app.post('/api/v1/patient-cases', async (req, res) => {
  try {
    const { title, diagnosis, treatment_type, goal_amount } = req.body;

    if (!title || !treatment_type) {
      return res.status(400).json({ error: 'Title and treatment_type are required' });
    }

    const [result] = await pool.query(
      `INSERT INTO patient_cases (patient_id, title, diagnosis, treatment_type, goal_amount)
       VALUES (?, ?, ?, ?, ?)`,
      [1, title, diagnosis, treatment_type, goal_amount] // المريض 1 تجريبي مؤقتًا
    );

    res.status(201).json({
      message: 'Patient case created successfully ✅',
      id: result.insertId,
      title,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

// ✅ عرض الحالات كلها
app.get('/api/v1/patient-cases', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM patient_cases ORDER BY created_at DESC');
    res.json({ count: rows.length, data: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
  try {
    const conn = await pool.getConnection();
    console.log('✅ Connected to MySQL Database');
    conn.release();
  } catch (err) {
    console.error('❌ Database connection failed:', err.message);
  }
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
