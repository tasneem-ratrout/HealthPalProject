// // // src/controllers/registrationsController.js
// // import { pool } from "../db.js";

// // export const registerForWorkshop = async (req, res) => {
// //   try {
// //     const { user_id, workshop_id } = req.body;

// //     if (!user_id || !workshop_id)
// //       return res.status(400).json({ message: "Missing data" });

// //     // نتحقق من دور المستخدم (لازم يكون patient)
// //     const [user] = await pool.query("SELECT role FROM users WHERE id = ?", [user_id]);
// //     if (user.length === 0)
// //       return res.status(404).json({ message: "User not found" });

// //     if (user[0].role !== "patient")
// //       return res.status(403).json({ message: "Only patients can register for workshops" });

// //     // نتحقق إنه مش مسجل مسبقًا
// //     const [existing] = await pool.query(
// //       "SELECT * FROM registrations WHERE user_id = ? AND workshop_id = ?",
// //       [user_id, workshop_id]
// //     );
// //     if (existing.length > 0)
// //       return res.status(400).json({ message: "Already registered" });

// //     // نضيف التسجيل
// //     await pool.query(
// //       "INSERT INTO registrations (user_id, workshop_id) VALUES (?, ?)",
// //       [user_id, workshop_id]
// //     );

// //     res.json({ message: "Registered successfully" });
// //   } catch (err) {
// //     console.error(err);
// //     res.status(500).json({ message: "Server error" });
// //   }
// // };
// //---------
// import { pool } from "../db.js";

// export const registerForWorkshop = async (req, res) => {
//   try {
//     const { workshop_id } = req.body;
//     const user_id = req.user.id; // ← ناخدها من التوكن

//     // نتحقق إنه المريض فعلاً patient
//     const [user] = await pool.query("SELECT role FROM users WHERE id = ?", [user_id]);
//     if (user.length === 0)
//       return res.status(404).json({ message: "User not found" });
//     if (user[0].role !== "patient")
//       return res.status(403).json({ message: "Only patients can register" });

//     const [existing] = await pool.query(
//       "SELECT * FROM registrations WHERE user_id = ? AND workshop_id = ?",
//       [user_id, workshop_id]
//     );
//     if (existing.length > 0)
//       return res.status(400).json({ message: "Already registered" });

//     await pool.query(
//       "INSERT INTO registrations (user_id, workshop_id) VALUES (?, ?)",
//       [user_id, workshop_id]
//     );

//     res.json({ message: "Registered successfully" });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Server error" });
//   }
// };
import { pool } from "../db.js";

export const registerForWorkshop = async (req, res) => {
  try {
    const { workshop_id } = req.body;
    const user_id = req.user.id;

    const [user] = await pool.query("SELECT role FROM users WHERE id = ?", [user_id]);
    if (user.length === 0)
      return res.status(404).json({ message: "User not found" });
    if (user[0].role !== "patient")
      return res.status(403).json({ message: "Only patients can register" });

    const [existing] = await pool.query(
      "SELECT * FROM registrations WHERE user_id = ? AND workshop_id = ?",
      [user_id, workshop_id]
    );
    if (existing.length > 0)
      return res.status(400).json({ message: "Already registered" });

    await pool.query(
      "INSERT INTO registrations (user_id, workshop_id) VALUES (?, ?)",
      [user_id, workshop_id]
    );

    res.json({ message: "Registered successfully" });
  } catch (err) {
    console.error("💥 Registration error:", err); // ← مهم جدًا
    res.status(500).json({ message: err.message }); // ← يعرض رسالة الخطأ الحقيقية
  }
};
