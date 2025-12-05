import { pool } from "../db.js";
import { translateSmart } from "../utils/translate.js"; 

// ===============================
// Send a message inside an appointment
// ===============================
export async function sendMessage(req, res) {
  try {
    const { appointment_id, message } = req.body;

    if (!appointment_id || !message) {
      return res
        .status(400)
        .json({ error: "appointment_id and message are required" });
    }


    const [rows] = await pool.query(
      "SELECT patient_id, doctor_id, translation_enabled FROM appointments WHERE id = ? LIMIT 1",
      [appointment_id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Appointment not found" });
    }

    const appt = rows[0];

    
    if (![appt.patient_id, appt.doctor_id].includes(req.user.id)) {
      return res
        .status(403)
        .json({ error: "You are not part of this appointment" });
    }

    
    await pool.query(
      "INSERT INTO messages (appointment_id, sender_id, message) VALUES (?, ?, ?)",
      [appointment_id, req.user.id, message]
    );

    
    let translated = null;
    if (appt.translation_enabled) {
     translated = await translateSmart(message);

    }

    res.status(201).json({
      success: true,
      message: "Message sent successfully",
      original: message,
      ...(translated && { translated }), 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error", details: err.message });
  }
}

// ===============================
// Get messages for an appointment
// ===============================
export async function getMessages(req, res) {
  try {
    const { appointment_id } = req.params;

    const [rows] = await pool.query(
      `SELECT 
          m.id, 
          m.message, 
          m.sent_at, 
          u.name AS sender_name,
          u.role AS sender_role
       FROM messages m
       JOIN users u ON m.sender_id = u.id
       WHERE m.appointment_id = ?
       ORDER BY m.sent_at ASC`,
      [appointment_id]
    );


    const translatedMessages = await Promise.all(
      rows.map(async (msg) => {
        const translated = await translateSmart(msg.message);
        const date = new Date(msg.sent_at);
        const formattedTime = date.toLocaleString("en-GB", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        });

        return {
          id: msg.id,
          message: msg.message,
          translated, 
          sender_name: msg.sender_name,
          sender_role: msg.sender_role,
          sent_at: formattedTime,
        };
      })
    );

    res.json({
      success: true,
      count: translatedMessages.length,
      messages: translatedMessages,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error", details: err.message });
  }
}