import { pool } from "../db.js";

// Simple distance calculator
function getDistance(lat1, lon1, lat2, lon2) {
  const dx = lat1 - lat2;
  const dy = lon1 - lon2;
  return Math.sqrt(dx * dx + dy * dy);
}

export const triggerSOSController = async (req, res) => {
  try {
    console.log("Using DB:", process.env.DB_NAME);


    const [db] = await pool.query("SELECT DATABASE() AS db");
    console.log("🚨 CONNECTED TO DATABASE:", db[0].db);

    const { userId, coordinates, medicalHistory, severity = "high" } = req.body;

    if (!userId || !coordinates?.lat || !coordinates?.lng) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const { lat, lng } = coordinates;

    // 1️⃣ Get all NGOs
    const [ngos] = await pool.query("SELECT id, name, latitude, longitude FROM ngos");

    let nearestNGO = null;
    let minDist = Infinity;

    ngos.forEach((ngo) => {
      const dist = getDistance(lat, lng, ngo.latitude, ngo.longitude);
      if (dist < minDist) {
        minDist = dist;
        nearestNGO = ngo;
      }
    });

    // 2️⃣ Select any doctor (first doctor)
    const [doctors] = await pool.query(
      "SELECT id, name FROM users WHERE LOWER(role) = 'doctor'"
    );

    const assignedDoctor = doctors.length > 0 ? doctors[0] : null;

    // 3️⃣ Insert SOS alert
    const [result] = await pool.query(
  `INSERT INTO sos_alerts 
  (user_id, assigned_doctor_id, latitude, longitude, medical_history, severity, nearest_ngo, status)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
  [
    userId,
    assignedDoctor?.id || null,
    lat,
    lng,
    medicalHistory || null,
    severity,
    nearestNGO?.name || "Unknown NGO",
    "open"
  ]
);

    



    // 4️⃣ Create internal notification for doctor
    // 4️⃣ Create internal notification for doctor
    if (assignedDoctor) {
  const payloadMessage = JSON.stringify({
    message: `SOS alert from user ${userId}`,
    severity: severity,
    coordinates: { lat, lng }
  });

  await pool.query(
    `INSERT INTO notifications (user_id, type, payload, status) 
     VALUES (?, 'sos', ?, 'pending')`,
    [
      assignedDoctor.id,
      payloadMessage
    ]
  );
}



    return res.status(201).json({
      message: "🚨 SOS Triggered Successfully",
      sosId: result.insertId,
      data: {
        userId,
        coordinates,
        severity,
        nearestNGO: nearestNGO?.name,
        assignedDoctor: assignedDoctor?.name || null
      }
    });

  } catch (error) {
    console.error("SOS ERROR:", error);
    res.status(500).json({
      message: "Failed to trigger SOS",
      error: error.message
    });
  }
};

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

export const getUserSOSHistory = async (req, res) => {
  try {
    const userId = req.params.userId;
    const [rows] = await pool.query(
      `SELECT * FROM sos_alerts WHERE user_id = ? ORDER BY created_at DESC`,
      [userId]
    );

    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch user's SOS history" });
  }
};

