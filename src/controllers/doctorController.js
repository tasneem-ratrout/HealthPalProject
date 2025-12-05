import { pool } from '../db.js';

// ===============================
//  Get all specialties
// ===============================
export async function getSpecialties(req, res) {
  try {
    const [rows] = await pool.query('SELECT id, name FROM specialties ORDER BY name ASC');
    res.json({ count: rows.length, specialties: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
}

// ===============================
//  Get doctors by specialty
// ===============================
export async function getDoctorsBySpecialty(req, res) {
  try {
    const { specialty_id } = req.params;


    const [specialty] = await pool.query('SELECT name FROM specialties WHERE id = ?', [specialty_id]);
    if (specialty.length === 0) {
      return res.status(404).json({ error: 'Specialty not found' });
    }


    const [doctors] = await pool.query(
      'SELECT id, name, email FROM users WHERE role = "doctor" AND specialty_id = ?',
      [specialty_id]
    );

    res.json({
      specialty: specialty[0].name,
      count: doctors.length,
      doctors
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
}
