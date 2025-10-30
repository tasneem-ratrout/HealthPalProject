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

    const allowedModes = ['video', 'audio', 'text'];
    if (!allowedModes.includes(mode)) {
      return res.status(400).json({ error: `Invalid mode. Allowed values are: ${allowedModes.join(', ')}` });
    }

    let time = appointment_time.trim();
    if (/^\d{2}:\d{2}$/.test(time)) {
      time = `${time}:00`;
    } else if (!/^\d{2}:\d{2}:\d{2}$/.test(time)) {
      return res.status(400).json({ error: 'Invalid time format (expected HH:mm or HH:mm:ss)' });
    }

    const appointmentDateTime = new Date(`${appointment_date}T${time}`);
    if (isNaN(appointmentDateTime.getTime())) {
      return res.status(400).json({ error: 'Invalid date or time format' });
    }

    const now = new Date();
    if (appointmentDateTime < now) {
      return res.status(400).json({ error: 'Cannot create appointment in the past' });
    }

    const [doctor] = await pool.query('SELECT id, name FROM users WHERE id = ? AND role = "doctor"', [doctor_id]);
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

    const [appointmentData] = await pool.query(
      `SELECT 
         a.id,
         a.appointment_date,
         a.appointment_time,
         a.mode,
         a.translation_enabled,
         a.status,
         p.name AS patient_name,
         d.name AS doctor_name
       FROM appointments a
       JOIN users p ON a.patient_id = p.id
       JOIN users d ON a.doctor_id = d.id
       WHERE a.id = ?`,
      [result.insertId]
    );

    const appointment = appointmentData[0];

    const localDate = new Date(appointment.appointment_date);
    const formattedDate = localDate.toISOString().split('T')[0];
    const formattedTime = appointment.appointment_time.slice(0, 8);

    const formattedAppointment = {
      id: appointment.id,
      patient_name: appointment.patient_name,
      doctor_name: appointment.doctor_name,
      appointment_date: formattedDate,
      appointment_time: formattedTime,
      mode: appointment.mode,
      translation_enabled: Boolean(appointment.translation_enabled),
      status: appointment.status
    };

    res.status(201).json({
      success: true,
      message: `Appointment created successfully for ${appointment.patient_name} with ${appointment.doctor_name}`,
      appointment: formattedAppointment
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
        SELECT 
          a.id,
          a.appointment_date,
          a.appointment_time,
          a.mode,
          a.translation_enabled,
          a.status,
          u.name AS doctor_name,
          p.name AS patient_name
        FROM appointments a
        JOIN users u ON a.doctor_id = u.id
        JOIN users p ON a.patient_id = p.id
        WHERE a.patient_id = ?
        ORDER BY a.appointment_date DESC, a.appointment_time DESC
      `;
      params = [req.user.id];
    } else if (req.user.role === 'doctor') {
      query = `
        SELECT 
          a.id,
          a.appointment_date,
          a.appointment_time,
          a.mode,
          a.translation_enabled,
          a.status,
          p.name AS patient_name,
          u.name AS doctor_name
        FROM appointments a
        JOIN users p ON a.patient_id = p.id
        JOIN users u ON a.doctor_id = u.id
        WHERE a.doctor_id = ?
        ORDER BY a.appointment_date DESC, a.appointment_time DESC
      `;
      params = [req.user.id];
    } else {
      return res.status(403).json({ error: 'Only patients or doctors can view appointments' });
    }

    const [rows] = await pool.query(query, params);

    const formattedAppointments = rows.map(a => {
      const localDate = new Date(a.appointment_date);
      const formattedDate = localDate.toISOString().split('T')[0];
      const formattedTime = a.appointment_time.slice(0, 8);
      return {
        id: a.id,
        patient_name: a.patient_name,
        doctor_name: a.doctor_name,
        appointment_date: formattedDate,
        appointment_time: formattedTime,
        mode: a.mode,
        translation_enabled: Boolean(a.translation_enabled),
        status: a.status
      };
    });

    res.json({
      success: true,
      count: formattedAppointments.length,
      appointments: formattedAppointments
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
