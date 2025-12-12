import { pool } from "../db.js";

/* ----------------------------------
   Helper: Distance Calculator
----------------------------------- */
function getDistance(lat1, lon1, lat2, lon2) {
  const dx = lat1 - lat2;
  const dy = lon1 - lon2;
  return Math.sqrt(dx * dx + dy * dy);
}

/* ----------------------------------
   1️⃣ Trigger SOS
----------------------------------- */
export const triggerSOSController = async (req, res) => {
  try {
    const { userId, coordinates, medicalHistory, severity = "high" } = req.body;

    if (!userId || !coordinates?.lat || !coordinates?.lng) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const { lat, lng } = coordinates;

    /* ---- Find nearest NGO ---- */
    const [ngos] = await pool.query(
      "SELECT name, latitude, longitude FROM ngos WHERE latitude IS NOT NULL"
    );

    let nearestNGO = null;
    let minDist = Infinity;

    ngos.forEach((ngo) => {
      const dist = getDistance(lat, lng, ngo.latitude, ngo.longitude);
      if (dist < minDist) {
        minDist = dist;
        nearestNGO = ngo;
      }
    });

    /* ---- Create SOS ---- */
    const [result] = await pool.query(
      `
      INSERT INTO sos_alerts
      (user_id, latitude, longitude, medical_history, severity, nearest_ngo, status)
      VALUES (?, ?, ?, ?, ?, ?, 'open')
      `,
      [
        userId,
        lat,
        lng,
        medicalHistory || null,
        severity,
        nearestNGO?.name || "Unknown NGO"
      ]
    );

    const sosId = result.insertId;

    /* ---- Notify all doctors ---- */
    const [doctors] = await pool.query(
      "SELECT id FROM users WHERE LOWER(role) = 'doctor'"
    );

    for (const doctor of doctors) {
      const payload = JSON.stringify({
        sosId,
        userId,
        message: `SOS alert from user ${userId}`,
        severity,
        coordinates: { lat, lng }
      });

      await pool.query(
        `
        INSERT INTO notifications (user_id, type, payload, status, sos_id)
        VALUES (?, 'sos', ?, 'pending', ?)
        `,
        [doctor.id, payload, sosId]
      );
    }

    return res.status(201).json({
      message: "🚨 SOS Triggered Successfully",
      sosId,
      data: {
        userId,
        severity,
        nearestNGO: nearestNGO?.name || null
      }
    });

  } catch (error) {
    console.error("SOS ERROR:", error);
    res.status(500).json({ message: "Failed to trigger SOS" });
  }
};


/* ----------------------------------
   2️⃣ Doctor accepts SOS
----------------------------------- */
export const acceptSOSController = async (req, res) => {
  const connection = await pool.getConnection();

  try {
    const { sosId } = req.params;
    const doctorId = req.user.id;

    await connection.beginTransaction();

    // Check SOS still open
    const [rows] = await connection.query(
      "SELECT * FROM sos_alerts WHERE id = ? AND status = 'open' FOR UPDATE",
      [sosId]
    );

    if (rows.length === 0) {
      await connection.rollback();
      return res.status(400).json({ message: "SOS already accepted or not found" });
    }

    // Assign doctor
    await connection.query(
      `
      UPDATE sos_alerts
      SET status = 'in_progress',
          assigned_doctor_id = ?
      WHERE id = ?
      `,
      [doctorId, sosId]
    );

    // Accepting doctor
    await connection.query(
      `
      UPDATE notifications
      SET status = 'sent'
      WHERE user_id = ?
        AND type = 'sos'
        AND sos_id = ?
      `,
      [doctorId, sosId]
    );

    // Cancel others
    await connection.query(
      `
      UPDATE notifications
      SET status = 'cancelled'
      WHERE type = 'sos'
        AND sos_id = ?
        AND user_id != ?
      `,
      [sosId, doctorId]
    );

    await connection.commit();

    res.json({
      message: "✅ SOS case accepted",
      sosId,
      doctorId
    });

  } catch (error) {
    await connection.rollback();
    console.error("ACCEPT SOS ERROR:", error);
    res.status(500).json({ message: "Failed to accept SOS" });
  } finally {
    connection.release();
  }
};


/* ----------------------------------
   3️⃣ Get all SOS
----------------------------------- */
export const getAllSOSHistory = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT s.*, u.name AS patient_name, d.name AS doctor_name
      FROM sos_alerts s
      LEFT JOIN users u ON s.user_id = u.id
      LEFT JOIN users d ON s.assigned_doctor_id = d.id
      ORDER BY s.created_at DESC
    `);

    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch SOS history" });
  }
};

/* ----------------------------------
   4️⃣ Get user SOS history
----------------------------------- */
export const getUserSOSHistory = async (req, res) => {
  try {
    const userId = req.params.userId;

    const [rows] = await pool.query(
      "SELECT * FROM sos_alerts WHERE user_id = ? ORDER BY created_at DESC",
      [userId]
    );

    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch user's SOS history" });
  }
};
