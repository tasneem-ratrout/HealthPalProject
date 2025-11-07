import { pool } from '../db.js';

export const getMentalHealthDoctors = async (req, res) => {
  try {
    const [doctors] = await pool.query(`
      SELECT u.id, u.name, s.name AS specialty
      FROM users u
      JOIN specialties s ON u.specialty_id = s.id
      WHERE s.name = 'Mental Health'
    `);
    res.json(doctors);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getSessions = async (req, res) => {
  try {
    const patient_id = req.user.id;
    const [sessions] = await pool.query(`
      SELECT s.*, u.name AS therapist_name, sp.name AS specialty
      FROM sessions s
      JOIN users u ON s.therapist_id = u.id
      JOIN specialties sp ON u.specialty_id = sp.id
      WHERE s.patient_id = ?
    `, [patient_id]);

    res.json(sessions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const bookSession = async (req, res) => {
  try {
    const { therapist_id, date, time } = req.body;
    const patient_id = req.user.id;

    const [therapist] = await pool.query(`
      SELECT u.id 
      FROM users u
      JOIN specialties s ON u.specialty_id = s.id
      WHERE u.id = ? AND s.name = 'Mental Health'
    `, [therapist_id]);

    if (therapist.length === 0)
      return res.status(400).json({ message: "Selected doctor is not a Mental Health specialist" });

    const [existing] = await pool.query(`
      SELECT * FROM sessions
      WHERE therapist_id = ? AND date = ? AND time = ?
    `, [therapist_id, date, time]);

    if (existing.length > 0)
      return res.status(400).json({ message: "Therapist is not available at this time" });

    await pool.query(`
      INSERT INTO sessions (patient_id, therapist_id, date, time)
      VALUES (?, ?, ?, ?)
    `, [patient_id, therapist_id, date, time]);

    res.json({ message: "Session booked successfully" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
