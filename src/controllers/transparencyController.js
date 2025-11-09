// src/controllers/transparencyController.js
import { pool } from '../db.js';

/* =========================================================
  الشفافية المالية العامة (Financial Overview)
========================================================= */
export async function financialOverview(req, res) {
  try {
    const [[donations]] = await pool.query(`
      SELECT SUM(amount) AS total_donated FROM donations
    `);
    const [[used]] = await pool.query(`
      SELECT SUM(raised_amount) AS total_used FROM patient_cases
    `);

    res.json({
      total_donated: donations.total_donated || 0,
      total_used: used.total_used || 0,
      remaining_balance: (donations.total_donated || 0) - (used.total_used || 0)
    });
  } catch (err) {
    console.error('Error in financial overview:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
}

/* =========================================================
  (Donation Tracking)
========================================================= */
export async function donationTracking(req, res) {
  try {
    const [rows] = await pool.query(`
      SELECT d.id, d.amount, p.title AS case_title, n.name AS ngo_name, d.created_at
      FROM donations d
      LEFT JOIN patient_cases p ON d.case_id = p.id
      LEFT JOIN ngos n ON n.id = p.patient_id
      ORDER BY d.created_at DESC
    `);
    res.json({ total: rows.length, donations: rows });
  } catch (err) {
    console.error('Error fetching donation tracking:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
}

/* =========================================================
   تقرير الاستخدام العادل (Fair Distribution)
========================================================= */
export async function fairnessReport(req, res) {
  try {
    const [rows] = await pool.query(`
      SELECT n.name AS ngo_name, COUNT(ma.id) AS aids_provided
      FROM ngos n
      LEFT JOIN medical_aid ma ON ma.ngo_id = n.id
      GROUP BY n.id
    `);
    res.json({ report: rows });
  } catch (err) {
    console.error('Error fetching fairness report:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
}

/* =========================================================
   ملف شفاف للمنظمة (NGO Transparency Profile)
========================================================= */
export async function ngoTransparencyProfile(req, res) {
  try {
    const { id } = req.params;
    const [[ngo]] = await pool.query('SELECT * FROM ngos WHERE id = ?', [id]);
    if (!ngo) return res.status(404).json({ error: 'NGO not found' });

    const [cases] = await pool.query(
      'SELECT COUNT(*) AS total_cases FROM medical_aid WHERE ngo_id = ?',
      [id]
    );
    const [missions] = await pool.query(
      'SELECT COUNT(*) AS total_missions FROM medical_missions WHERE ngo_id = ?',
      [id]
    );

    res.json({
      ngo,
      transparency: {
        total_cases: cases[0].total_cases,
        total_missions: missions[0].total_missions
      }
    });
  } catch (err) {
    console.error('Error fetching NGO transparency:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
}
