// src/controllers/ngoController.js
import { pool } from '../db.js';

/* =========================================================
   إضافة منظمة جديدة (Admin Only)
========================================================= */
export async function addNGO(req, res) {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Only admin can add NGOs' });
    }

    const { name, email, phone, address } = req.body;

    if (!name) return res.status(400).json({ error: 'NGO name is required' });

    const [result] = await pool.query(
      'INSERT INTO ngos (name, email, phone, address) VALUES (?, ?, ?, ?)',
      [name, email || null, phone || null, address || null]
    );

    res.status(201).json({
      message: '✅ NGO added successfully by Admin',
      ngo: { id: result.insertId, name, email, phone, address },
    });
  } catch (err) {
    console.error('Error adding NGO:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
}
/* =========================================================
   توثيق منظمة NGO (Admin Only)
========================================================= */
export async function verifyNGO(req, res) {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Only admin can verify NGOs' });
    }

    const { id } = req.params;

    const [existing] = await pool.query('SELECT * FROM ngos WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ error: 'NGO not found' });
    }

    await pool.query('UPDATE ngos SET is_verified = TRUE WHERE id = ?', [id]);

    res.json({ message: '✅ NGO verified successfully', ngo_id: id });
  } catch (err) {
    console.error('Error verifying NGO:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }

}
