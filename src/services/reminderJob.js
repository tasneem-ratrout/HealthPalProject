// import cron from "node-cron";
// import { pool } from "../db.js";
// import nodemailer from "nodemailer";

// const transporter = nodemailer.createTransport({
//   service: "gmail",
//   auth: {
//     user: "shahdrawajabeh@gmail.com",
//     pass: "yjdlsvuonypudenv"
// }
// });

// cron.schedule("0 * * * *", async () => {
//   console.log("🔔 Checking for sessions happening in 24 hours...");

//   try {
//     const [rows] = await pool.query(`
//       SELECT 
//         s.id AS session_id,
//         s.date,
//         s.time,
//         u.email,
//         u.name,
//         t.name AS therapist_name
//       FROM sessions s
//       JOIN users u ON s.patient_id = u.id
//       JOIN users t ON s.therapist_id = t.id
//       JOIN specialist sp ON t.specialty_id = sp.id
//       WHERE sp.name = 'Mental Health'
    
//       AND TIMESTAMPDIFF(MINUTE, NOW(), CONCAT(w.date, ' ', w.time)) BETWEEN 0 AND 60

//     `);

//     if (rows.length === 0) {
//       console.log("✅ No reminders to send right now.");
//       return;
//     }

//     for (const row of rows) {
//       const mailOptions = {
//         from: '"HealthPal Sessions" <shahdrawajabeh@gmail.com>',
//         to: row.email,
//         subject: `⏰ Reminder: Session with ${row.therapist_name} in 24 hours`,
//         text: `Hi ${row.name},\n\nJust a reminder that your session with ${row.therapist_name} is scheduled in 24 hours.\nDate: ${row.date}\nTime: ${row.time}\n\n- HealthPal Team`
//       };

//       await transporter.sendMail(mailOptions);
//       console.log(`📨 Reminder sent to ${row.email} for session ${row.session_id}`);
//     }

//   } catch (err) {
//     console.error("❌ Error sending reminders:", err);
//   }
// });
import cron from "node-cron";
import { pool } from "../db.js";
import nodemailer from "nodemailer";

// إعداد البريد الإلكتروني
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "shahdrawajabeh@gmail.com", 
    pass: "yjdlsvuonypudenv"  
  },
});

cron.schedule("* * * * *", async () => { // هذا يفحص كل دقيقة
  console.log("🔔 Checking for sessions happening in the next 2 minutes...");

  try {
    const [rows] = await pool.query(`
      SELECT 
        s.id AS session_id,
        s.date,
        s.time,
        u.email,
        u.name,
        t.name AS therapist_name
      FROM sessions s
      JOIN users u ON s.patient_id = u.id
      JOIN users t ON s.therapist_id = t.id
      JOIN specialties sp ON t.specialty_id = sp.id
      WHERE sp.name = 'Mental Health'
      AND TIMESTAMPDIFF(MINUTE, NOW(), CONCAT(s.date, ' ', s.time)) BETWEEN 0 AND 60
    `);

    if (rows.length === 0) {
      console.log("✅ No reminders to send right now.");
      return;
    }

    for (const row of rows) {
      const mailOptions = {
        from: '"HealthPal Sessions" <shahdrawajabeh@gmail.com>',
        to: row.email,
        subject: `⏰ Reminder: Session with ${row.therapist_name} in 24 hours`,
        text: `Hi ${row.name},\n\nJust a reminder that your session with ${row.therapist_name} is scheduled very soon.\nDate: ${row.date}\nTime: ${row.time}\n\n- HealthPal Team`
      };

      await transporter.sendMail(mailOptions);
      console.log(`📨 Reminder sent to ${row.email} for session ${row.session_id}`);
    }

  } catch (err) {
    console.error("❌ Error sending reminders:", err);
  }
});
