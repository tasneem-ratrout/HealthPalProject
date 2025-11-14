import { pool } from '../db.js';
import { v4 as uuidv4 } from 'uuid';


async function pickRandomTherapist(preferredId = null) {
  if (preferredId) {
    const [row] = await pool.query('SELECT id FROM users WHERE id = ? AND role = "doctor"', [preferredId]);
    if (row.length) return row[0].id;
  }
  const [rows] = await pool.query(`
    SELECT u.id FROM users u
    JOIN specialties s ON u.specialty_id = s.id
    WHERE s.name = 'Mental Health' AND u.role = 'doctor'
  `);
  if (!rows.length) return null;
  const idx = Math.floor(Math.random() * rows.length);
  return rows[idx].id;
}

export const startAnonymousChat = async (req, res) => {
  try {
    const { preferred_therapist_id } = req.body || {};
    const patient_id = req.user?.id || null;

    const therapist_id = await pickRandomTherapist(preferred_therapist_id);
    if (!therapist_id) return res.status(500).json({ message: 'No therapist available' });

    const roomId = `anon_${uuidv4()}`;

    await pool.query(
      'INSERT INTO anonymous_chats (room_id, therapist_id, patient_id) VALUES (?, ?, ?)',
      [roomId, therapist_id, patient_id]
    );

    res.status(201).json({ roomId, therapist_id });
  } catch (err) {
    console.error('startAnonymousChat error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getAnonymousMessages = async (req, res) => {
  try {
    const { roomId } = req.params;
    const [messages] = await pool.query(
      'SELECT id, room_id, sender_type, sender_id, message, created_at FROM anonymous_messages WHERE room_id = ? ORDER BY created_at ASC',
      [roomId]
    );
    res.json(messages);
  } catch (err) {
    console.error('getAnonymousMessages error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// End chat (requires auth: only therapist assigned or admin)
export const endAnonymousChat = async (req, res) => {
  try {
    const { roomId } = req.params;
    const userId = req.user.id;
    const role = req.user.role;

    const [rows] = await pool.query('SELECT * FROM anonymous_chats WHERE room_id = ?', [roomId]);
    if (rows.length === 0) return res.status(404).json({ message: 'Chat not found' });

    const chat = rows[0];
    if (role !== 'admin' && chat.therapist_id !== userId) return res.status(403).json({ message: 'Access denied' });

    await pool.query('UPDATE anonymous_chats SET status = "closed" WHERE room_id = ?', [roomId]);

    res.json({ message: 'Chat closed' });
  } catch (err) {
    console.error('endAnonymousChat error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Therapist: list open chats assigned to them
export const getOpenAnonymousChats = async (req, res) => {
  try {
    const userId = req.user.id;
    const role = req.user.role;
    if (role !== 'doctor' && role !== 'admin') return res.status(403).json({ message: 'Access denied' });

    const [rows] = await pool.query(
      'SELECT room_id, created_at, patient_id FROM anonymous_chats WHERE therapist_id = ? AND status = "open" ORDER BY created_at DESC',
      [userId]
    );
    res.json(rows);
  } catch (err) {
    console.error('getOpenAnonymousChats error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Send anonymous message
// export const sendAnonymousMessage = async (req, res) => {
//   try {
//     const { roomId } = req.params;
//     const { message } = req.body;

//     if (!message) {
//       return res.status(400).json({ message: "Message is required" });
//     }

//     const userId = req.user?.id || null;
//     const sender_type = userId ? "user" : "anonymous";
//     const sender_id = userId;

//     // Check if chat exists
//     const [chat] = await pool.query(
//       "SELECT * FROM anonymous_chats WHERE room_id = ? AND status = 'open'",
//       [roomId]
//     );

//     if (!chat.length) {
//       return res.status(404).json({ message: "Chat not found or closed" });
//     }

//     // Save message
//     await pool.query(
//       "INSERT INTO anonymous_messages (room_id, sender_type, sender_id, message) VALUES (?, ?, ?, ?)",
//       [roomId, sender_type, sender_id, message]
//     );

//     res.status(201).json({ message: "Message sent" });

//   } catch (err) {
//     console.error("sendAnonymousMessage error:", err);
//     res.status(500).json({ message: "Server error" });
//   }
// };

export const sendAnonymousMessageAsAnonymous = async (req, res) => {
  try {
    const { roomId } = req.params;
    const { message } = req.body;

    if (!message) return res.status(400).json({ message: "Message is required" });

    await pool.query(
      "INSERT INTO anonymous_messages (room_id, sender_type, sender_id, message) VALUES (?, 'anonymous', NULL, ?)",
      [roomId, message]
    );

    res.status(201).json({ message: "Message sent (anonymous)" });

  } catch (err) {
    console.error("sendAnonymousMessageAsAnonymous error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
export const sendAnonymousMessageAsDoctor = async (req, res) => {
  try {
    const { roomId } = req.params;
    const { message } = req.body;

    if (!message) return res.status(400).json({ message: "Message is required" });

    const doctorId = req.user.id;

    await pool.query(
      "INSERT INTO anonymous_messages (room_id, sender_type, sender_id, message) VALUES (?, 'doctor', ?, ?)",
      [roomId, doctorId, message]
    );

    res.status(201).json({ message: "Message sent (doctor)" });

  } catch (err) {
    console.error("sendAnonymousMessageAsDoctor error:", err);
    res.status(500).json({ message: "Server error" });
  }
};




