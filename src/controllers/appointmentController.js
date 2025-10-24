import { pool } from '../db.js';

// ===============================
// create appointmint
// ===============================
export async function createAppointment(req, res) {
  try {
    const { doctor_id, appointment_date, appointment_time, mode = 'video', translation_enabled = false } = req.body;

   
    if (req.user.role !== 'patient') {
      return res.status(403).json({ error: 'Only patients can create appointments' });
    }

    
    if (!doctor_id || !appointment_date || !appointment_time) {
      return res.status(400).json({ error: 'doctor_id, appointment_date, and appointment_time are required' });
    }

   
    const [doctor] = await pool.query('SELECT id FROM users WHERE id = ? AND role = "doctor"', [doctor_id]);
    if (doctor.length === 0) {
      return res.status(404).json({ error: 'Doctor not found' });
    }

    
    const [conflict] = await pool.query(
      `SELECT id FROM appointments 
       WHERE doctor_id = ? AND appointment_date = ? AND appointment_time = ? 
       AND status IN ('pending','confirmed')`,
      [doctor_id, appointment_date, appointment_time]
    );
    if (conflict.length > 0) {
      return res.status(409).json({ error: 'This time slot is already booked for this doctor' });
    }

    
    const [result] = await pool.query(
      `INSERT INTO appointments 
       (patient_id, doctor_id, appointment_date, appointment_time, mode, translation_enabled) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [req.user.id, doctor_id, appointment_date, appointment_time, mode, translation_enabled]
    );

    res.status(201).json({
      message: 'Appointment created successfully',
      appointment: {
        id: result.insertId,
        patient_id: req.user.id,
        doctor_id,
        appointment_date,
        appointment_time,
        mode,
        translation_enabled
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
}



// ===============================
// get appointments (for patient or doctor)
// ===============================
export async function getAppointments(req, res) {
  try {
    let query = '';
    let params = [];

    if (req.user.role === 'patient') {
    
      query = `
        SELECT a.*, u.name AS doctor_name 
        FROM appointments a
        JOIN users u ON a.doctor_id = u.id
        WHERE a.patient_id = ?
        ORDER BY a.appointment_date DESC, a.appointment_time DESC
      `;
      params = [req.user.id];
    } else if (req.user.role === 'doctor') {
      
      query = `
        SELECT a.*, u.name AS patient_name 
        FROM appointments a
        JOIN users u ON a.patient_id = u.id
        WHERE a.doctor_id = ?
        ORDER BY a.appointment_date DESC, a.appointment_time DESC
      `;
      params = [req.user.id];
    } else {
      return res.status(403).json({ error: 'Only patients or doctors can view appointments' });
    }

    const [rows] = await pool.query(query, params);
    res.json({
      count: rows.length,
      appointments: rows
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
}

// ===============================
// Update Appointment Status
// ===============================
export async function updateAppointmentStatus(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['pending', 'confirmed', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status value' });
    }

    const [existing] = await pool.query('SELECT * FROM appointments WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    const appointment = existing[0];

  
    if (req.user.role === 'doctor' || req.user.role === 'admin') {
      if (req.user.role === 'doctor' && req.user.id !== appointment.doctor_id) {
        return res.status(403).json({ error: 'You can only update your own appointments' });
      }
    }

    
    else if (req.user.role === 'patient') {
      if (req.user.id !== appointment.patient_id) {
        return res.status(403).json({ error: 'You can only cancel your own appointments' });
      }
      if (status !== 'cancelled') {
        return res.status(403).json({ error: 'Patients can only cancel appointments' });
      }
    }

    else {
      return res.status(403).json({ error: 'Unauthorized role' });
    }

    await pool.query('UPDATE appointments SET status = ? WHERE id = ?', [status, id]);

    res.json({ message: 'Appointment status updated', id, new_status: status });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
}
