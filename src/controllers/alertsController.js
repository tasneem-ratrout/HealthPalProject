import { pool } from '../db.js';


export const getAlerts = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM alerts ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getAlertById = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM alerts WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Alert not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const createAlert = async (req, res) => {
  const { title, message, region, alert_type } = req.body;
  const userId = req.user?.id;

  if (!title || !message || !alert_type) {
    return res.status(400).json({ error: 'Title, message, and alert_type are required' });
  }

  try {
    const [result] = await pool.query(
      'INSERT INTO alerts (title, message, region, alert_type, created_at) VALUES (?, ?, ?, ?, NOW())',
      [title, message, region, alert_type]
    );
    res.status(201).json({ message: 'Alert created successfully', id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteAlert = async (req, res) => {
  try {
    await pool.query('DELETE FROM alerts WHERE id=?', [req.params.id]);
    res.json({ message: 'Alert deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
