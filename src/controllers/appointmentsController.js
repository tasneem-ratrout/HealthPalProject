// import { pool } from "../db.js";

// export const getSmartSuggestions = async (req, res) => {
//     const doctorId = req.query.doctor_id;

//     if (!doctorId) {
//         return res.status(400).json({ error: "doctor_id is required" });
//     }

//     const patientId = 1; // تعديل لاحقًا حسب الـ JWT

//     try {
//         // 1️⃣ استرجاع مواعيد الطبيب والمريض (تاريخ + وقت)
//         const [doctorBusy] = await pool.query(
//             "SELECT appointment_date, appointment_time FROM appointments WHERE doctor_id = ?",
//             [doctorId]
//         );

//         const [patientBusy] = await pool.query(
//             "SELECT appointment_date, appointment_time FROM appointments WHERE patient_id = ?",
//             [patientId]
//         );

//         // 2️⃣ دمج التاريخ + الوقت لسهولة المقارنة
//         const busyTimes = new Set([
//             ...doctorBusy.map(t => `${t.appointment_date} ${t.appointment_time}`),
//             ...patientBusy.map(t => `${t.appointment_date} ${t.appointment_time}`)
//         ]);

//         // 3️⃣ إنشاء اقتراحات 5 مواعيد قادمة
//         let suggestions = [];
//         let current = new Date();
//         current.setMinutes(current.getMinutes() + 30); 

//         while (suggestions.length < 5) {
//             const timeString = current.toISOString().slice(0, 19).replace("T", " ");

//             if (!busyTimes.has(timeString)) {
//                 suggestions.push(timeString);
//             }

//             current.setMinutes(current.getMinutes() + 30);
//         }

//         return res.json({
//             doctor_id: doctorId,
//             patient_id: patientId,
//             suggestions
//         });

//     } catch (error) {
//         return res.status(500).json({ error });
//     }
// };


import { pool } from "../db.js";

export const getSmartSuggestions = async (req, res) => {
    const doctorId = req.query.doctor_id;

    if (!doctorId) {
        return res.status(400).json({ error: "doctor_id is required" });
    }

    const patientId = req.user.id; // جاي من التوكن

    try {
        const [doctorBusy] = await pool.query(
            "SELECT appointment_date, appointment_time FROM appointments WHERE doctor_id = ?",
            [doctorId]
        );

        const [patientBusy] = await pool.query(
            "SELECT appointment_date, appointment_time FROM appointments WHERE patient_id = ?",
            [patientId]
        );

        const busyTimes = new Set([
            ...doctorBusy.map(t => `${t.appointment_date} ${t.appointment_time}`),
            ...patientBusy.map(t => `${t.appointment_date} ${t.appointment_time}`)
        ]);

        let suggestions = [];
        let current = new Date();
        current.setMinutes(current.getMinutes() + 30);

        while (suggestions.length < 5) {
            const timeString = current.toISOString().slice(0, 19).replace("T", " ");

            if (!busyTimes.has(timeString)) {
                suggestions.push(timeString);
            }

            current.setMinutes(current.getMinutes() + 30);
        }

        return res.json({
            doctor_id: doctorId,
            patient_id: patientId,
            suggestions
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ error });
    }
};
