import { pool } from "../db.js";

//  Dangerous symptoms (to trigger doctor alert)
const dangerSymptoms = [
  "chest pain",
  "vomiting",
  "fainting",
  "shortness of breath",
  "difficulty breathing"
];

// Recommendation 
function generateRecommendations(log) {
  const recs = [];

  if (log.painLevel >= 7) recs.push("Pain level is high — consider taking prescribed painkillers or consulting a doctor.");
  if (log.sleepHours < 6) recs.push("Try to improve sleep quality — target 7–8 hours.");
  if (log.energyLevel <= 3) recs.push("Low energy — hydrate and maintain balanced meals.");
  if (log.symptoms?.includes("headache")) recs.push("Headache noted — consider reducing screen time and staying hydrated.");
  if (log.mood?.toLowerCase() === "tired") recs.push("Feeling tired — prioritize rest today.");
  if (log.mood?.toLowerCase() === "depressed") recs.push("Mood is low — consider reaching out to a mental health professional.");

  return recs.length ? recs : ["No concerns detected. Keep up the good habits!"];
}

// — Auto Doctor Alert
async function alertDoctorIfNeeded(userId, log) {
  const danger =
    log.painLevel >= 8 ||
    dangerSymptoms.some(sym => log.symptoms?.toLowerCase().includes(sym)) ||
    ["depressed", "panicking", "anxious"].includes(log.mood?.toLowerCase());

  if (!danger) return null;

  
  const specialityId = getSpecialityId(log);

  if (!specialityId) return null;

  
  const [doctors] = await pool.query(
    `
    SELECT id 
    FROM users 
    WHERE LOWER(role) = 'doctor'
      AND speciality_id = ?
    LIMIT 1
    `,
    [specialityId]
  );

  if (doctors.length === 0) return null;

  const doctorId = doctors[0].id;

  
  await pool.query(
    `INSERT INTO notifications (user_id, type, payload, status)
     VALUES (?, 'health_alert', ?, 'pending')`,
    [
      doctorId,
      JSON.stringify({
        message: "A patient logged dangerous health data.",
        patientId: userId,
        painLevel: log.painLevel,
        symptoms: log.symptoms,
        specialityId
      })
    ]
  );

  return doctorId;
}


//  Add daily log (UPGRADED)
export const addDailyHealthLog = async (req, res) => {
  try {
    const { userId, symptoms, mood, medications, painLevel, energyLevel, sleepHours, notes } = req.body;

    const [result] = await pool.query(
      `INSERT INTO daily_health_logs 
      (user_id, symptoms, mood, medications, pain_level, energy_level, sleep_hours, notes) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [userId, symptoms, mood, medications, painLevel, energyLevel, sleepHours, notes]
    );

    const log = { symptoms, mood, medications, painLevel, energyLevel, sleepHours };

    // Auto doctor alert
    const alertedDoctorId = await alertDoctorIfNeeded(userId, log);

    //  Recommendations
    const recommendations = generateRecommendations(log);

    res.status(201).json({
      message: "Daily log added successfully",
      logId: result.insertId,
      recommendations,
      doctorAlert: alertedDoctorId ? `Doctor ${alertedDoctorId} notified` : "No alert triggered"
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to add daily log", error: error.message });
  }
};

//  — Weekly Summary
export const getWeeklySummary = async (req, res) => {
  try {
    const { userId } = req.params;

    const [logs] = await pool.query(
      `SELECT symptoms, pain_level, sleep_hours, energy_level, created_at
       FROM daily_health_logs
       WHERE user_id = ?
       AND created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
       ORDER BY created_at DESC`,
      [userId]
    );

    if (logs.length === 0) {
      return res.json({
        userId,
        avgPain: 0,
        avgSleep: 0,
        avgEnergy: 0,
        mostCommonSymptom: null,
        totalLogs: 0,
      });
    }

    
    const parseNum = (v) => {
      if (v === null || v === undefined) return null;
      const num = Number(v);
      return isNaN(num) ? null : num;
    };

    
    const painValues = logs.map(l => parseNum(l.pain_level));
    const sleepValues = logs.map(l => parseNum(l.sleep_hours));
    const energyValues = logs.map(l => parseNum(l.energy_level));

    const avg = (arr) => {
      const filtered = arr.filter(v => v !== null);
      if (filtered.length === 0) return 0;
      return (filtered.reduce((a, b) => a + b, 0) / filtered.length).toFixed(1);
    };

    
    const symptomsCount = {};
    logs.forEach(log => {
      if (log.symptoms) {
        log.symptoms.split(",").forEach(sym => {
          const clean = sym.trim();
          if (clean.length > 0) {
            symptomsCount[clean] = (symptomsCount[clean] || 0) + 1;
          }
        });
      }
    });

    const mostCommonSymptom =
      Object.keys(symptomsCount).length === 0
        ? null
        : Object.entries(symptomsCount).sort((a, b) => b[1] - a[1])[0][0];

    res.json({
      userId,
      avgPain: avg(painValues),
      avgSleep: avg(sleepValues),
      avgEnergy: avg(energyValues),
      mostCommonSymptom,
      totalLogs: logs.length,
    });

  } catch (error) {
    console.error("Weekly Summary Error:", error);
    res.status(500).json({
      message: "Failed to retrieve summary",
      error: error.message
    });
  }
};



