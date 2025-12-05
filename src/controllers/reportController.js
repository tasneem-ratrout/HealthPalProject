// src/controllers/reportController.js
import { pool } from '../db.js';

/* =========================================================
  تقرير التبرعات العامة
========================================================= */
export async function donationsSummary(req, res) {
  try {
    const [stats] = await pool.query(`
      SELECT 
        COUNT(*) AS total_donations,
        SUM(amount) AS total_amount,
        COUNT(DISTINCT donor_id) AS total_donors
      FROM donations
    `);

    const [topNGO] = await pool.query(`
      SELECT n.name, SUM(d.amount) AS total_received
      FROM donations d
      JOIN patient_cases c ON d.case_id = c.id
      JOIN users u ON c.patient_id = u.id
      LEFT JOIN ngos n ON n.id = d.donor_id
      GROUP BY n.name
      ORDER BY total_received DESC
      LIMIT 1
    `);

    res.json({
      summary: stats[0],
      top_ngo: topNGO[0] || null
    });
  } catch (err) {
    console.error('Error fetching donation summary:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
}

/* =========================================================
   تقرير الحالات
========================================================= */
export async function patientCasesReport(req, res) {
  try {
    const [rows] = await pool.query(`
      SELECT 
        status,
        COUNT(*) AS total_cases,
        SUM(goal_amount) AS total_needed,
        SUM(raised_amount) AS total_raised
      FROM patient_cases
      GROUP BY status
    `);
    res.json({ report: rows });
  } catch (err) {
    console.error('Error fetching patient cases report:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
}

/* =========================================================
  تقرير نشاط المنظمات
========================================================= */
export async function ngosActivity(req, res) {
  try {
    const [rows] = await pool.query(`
      SELECT n.name AS ngo_name, COUNT(ma.id) AS total_aids
      FROM ngos n
      LEFT JOIN medical_aid ma ON n.id = ma.ngo_id
      GROUP BY n.id
    `);
    res.json({ total_ngos: rows.length, ngos: rows });
  } catch (err) {
    console.error('Error fetching NGO activity:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
}

/* =========================================================
  تقرير البعثات الطبية
========================================================= */
export async function missionsReport(req, res) {
  try {
    const [rows] = await pool.query(`
      SELECT status, COUNT(*) AS total_missions
      FROM medical_missions
      GROUP BY status
    `);
    res.json({ report: rows });
  } catch (err) {
    console.error('Error fetching missions report:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
}

/* =========================================================
  تقرير المستخدم الواحد
========================================================= */
export async function userReport(req, res) {
  try {
    const { id } = req.params;
    const [donations] = await pool.query(
      'SELECT id, amount, note, created_at FROM donations WHERE donor_id = ?',
      [id]
    );
    res.json({ user_id: id, donations });
  } catch (err) {
    console.error('Error fetching user report:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
}
