// // // src/services/reminderCron.js
// // import cron from 'node-cron';
// // import db from '../db.js';
// // import nodemailer from 'nodemailer';
// // import dotenv from 'dotenv';
// // dotenv.config();

// // // إعداد SMTP من .env
// // const transporter = nodemailer.createTransport({
// //   host: process.env.SMTP_HOST,
// //   port: parseInt(process.env.SMTP_PORT || '587', 10),
// //   secure: false, // true لو تستخدمين 465
// //   auth: {
// //     user: process.env.SMTP_USER,
// //     pass: process.env.SMTP_PASS
// //   }
// // });

// // const sendReminder = async (to, subject, text) => {
// //   await transporter.sendMail({
// //     from: process.env.SMTP_FROM || process.env.SMTP_USER,
// //     to,
// //     subject,
// //     text
// //   });
// // };

// // // يشتغل كل ساعة (minute 0 of every hour)
// // cron.schedule('0 * * * *', async () => {
// //   console.log('[CRON] Checking for upcoming workshops...');

// //   try {
// //     // يبحث عن الورش التي تبدأ بعد 24 ساعة (±30 دقيقة)
// //     const [workshops] = await db.execute(`
// //       SELECT * FROM workshops
// //       WHERE start_datetime BETWEEN DATE_ADD(NOW(), INTERVAL 23 HOUR 30 MINUTE)
// //                               AND DATE_ADD(NOW(), INTERVAL 24 HOUR 30 MINUTE)
// //     `);

// //     if (workshops.length === 0) {
// //       console.log('[CRON] No workshops starting in 24 hours.');
// //       return;
// //     }

// //     for (const w of workshops) {
// //       // احصل على المستخدمين المسجلين
// //       const [users] = await db.execute(`
// //         SELECT u.email, u.name
// //         FROM registrations r
// //         JOIN users u ON u.id = r.user_id
// //         WHERE r.workshop_id = ? AND r.status = 'registered'
// //       `, [w.id]);

// //       console.log(`[CRON] Found ${users.length} users for workshop: ${w.title}`);

// //       for (const user of users) {
// //         const subject = `تذكير: ${w.title} يبدأ قريبًا`;
// //         const text = `
// // مرحبًا ${user.name || ''} 👋

// // هذا تذكير بأن الورشة "${w.title}" ستبدأ في ${new Date(w.start_datetime).toLocaleString()} في ${w.location || 'الموقع المحدد'}.

// // نتمنى لك حضورًا مفيدًا!
// // مع تحيات فريق HealthPal 💙
// // `;

// //         try {
// //           await sendReminder(user.email, subject, text);
// //           console.log(`[CRON] Email sent to ${user.email}`);
// //         } catch (err) {
// //           console.error(`[CRON] Failed to send to ${user.email}:`, err.message);
// //         }
// //       }
// //     }
// //   } catch (err) {
// //     console.error('[CRON] Error while checking workshops:', err);
// //   }
// // });
// // src/utils/reminderJob.js
// import cron from "node-cron";
// import { pool } from "../db.js";
// import nodemailer from "nodemailer";

// // 1️⃣ إعداد البريد الإلكتروني (استخدمي حساب Gmail للتجربة)
// const transporter = nodemailer.createTransport({
//   service: "gmail",
//   auth: {
//     user: "shahdrawajabeh@gmail.com", // ← اكتبي إيميلك هون
//     pass: "yjdlsvuonypudenv"     // ← كلمة مرور التطبيق (وليس الباسوورد العادي)
//   },
// });

// // 2️⃣ وظيفة بتشتغل كل ساعة (يعني 24 مرة باليوم)
// cron.schedule("0 * * * *", async () => {
//   console.log("🔔 Checking for workshops happening in 24 hours...");

//   try {
//     // نجيب الورش اللي موعدها بعد 24 ساعة من الآن
//     const [rows] = await pool.query(`
//       SELECT 
//         w.id AS workshop_id,
//         w.title,
//         w.date,
//         w.time,
//         u.email,
//         u.name
//       FROM workshops w
//       JOIN registrations r ON w.id = r.workshop_id
//       JOIN users u ON u.id = r.user_id
//       WHERE u.role = 'patient'
//       AND TIMESTAMPDIFF(HOUR, NOW(), CONCAT(w.date, ' ', w.time)) = 24
//     `);

//     if (rows.length === 0) {
//       console.log("✅ No reminders to send right now.");
//       return;
//     }

//     // نبعث التذكيرات لكل مريض مسجل
//     for (const row of rows) {
//       const mailOptions = {
//         from: '"HealthPal Workshops" <your_email@gmail.com>',
//         to: row.email,
//         subject: `⏰ Reminder: ${row.title} is in 24 hours`,
//         text: `
// Hi ${row.name},

// Just a friendly reminder that your workshop "${row.title}" will start in 24 hours.

// 🗓️ Date: ${row.date}
// 🕙 Time: ${row.time}

// Don't forget to attend on time!
// - HealthPal Team
//         `,
//       };

//       await transporter.sendMail(mailOptions);
//       console.log(`📨 Reminder sent to ${row.email} for "${row.title}"`);
//     }

//   } catch (err) {
//     console.error("❌ Error sending reminders:", err);
//   }
// });
import { pool } from "../db.js";
import nodemailer from "nodemailer";

// إعداد البريد الإلكتروني
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "shahdrawajabeh@gmail.com",
    pass: "yjdlsvuonypudenv"
  }
});

// دالة ترسل التذكيرات
export async function sendReminders() {
  console.log("🔔 Checking for workshops happening in 24 hours...");

  try {
    const [rows] = await pool.query(`
      SELECT 
        w.id AS workshop_id,
        w.title,
        w.date,
        w.time,
        u.email,
        u.name
      FROM workshops w
      JOIN registrations r ON w.id = r.workshop_id
      JOIN users u ON u.id = r.user_id
WHERE u.role = 'patient'
AND TIMESTAMPDIFF(MINUTE, NOW(), CONCAT(w.date, ' ', w.time)) BETWEEN 0 AND 60
    `);

    if (rows.length === 0) {
      console.log("✅ No reminders to send right now.");
      return;
    }

    for (const row of rows) {
      const mailOptions = {
        from: '"HealthPal Workshops" <your_email@gmail.com>',
        to: row.email,
        subject: `⏰ Reminder: ${row.title} is in 24 hours`,
        text: `Hi ${row.name},\n\nYour workshop "${row.title}" will start in 24 hours.\nDate: ${row.date}\nTime: ${row.time}`
      };

      await transporter.sendMail(mailOptions);
      console.log(`📨 Reminder sent to ${row.email} for "${row.title}"`);
    }

  } catch (err) {
    console.error("❌ Error sending reminders:", err);
  }
}

// تشغيل الوظيفة مباشرة للتجربة
sendReminders();
