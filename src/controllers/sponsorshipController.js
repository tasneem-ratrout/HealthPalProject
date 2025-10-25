import { pool } from '../db.js';

// ===============================
// إنشاء حالة طبية جديدة (patient case)
// ===============================
export async function createPatientCase(req, res) {
  try {
    if (req.user.role !== 'patient') {
      return res.status(403).json({ error: 'Only patients can create medical cases' });
    }

    const { title, diagnosis, treatment_type, goal_amount } = req.body;

    if (!title || !treatment_type || !goal_amount) {
      return res.status(400).json({ error: 'Title, treatment_type, and goal_amount are required' });
    }

    const [result] = await pool.query(
      `INSERT INTO patient_cases (patient_id, title, diagnosis, treatment_type, goal_amount)
       VALUES (?, ?, ?, ?, ?)`,
      [req.user.id, title, diagnosis || '', treatment_type, goal_amount]
    );

    res.status(201).json({
      message: 'Patient case created successfully',
      case: {
        id: result.insertId,
        title,
        treatment_type,
        goal_amount
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
}

// ===============================
// عرض جميع الحالات المفتوحة (للمتبرعين أو الجميع)
// ===============================
export async function getAllPatientCases(req, res) {
  try {
    const [rows] = await pool.query(`
      SELECT c.*, u.name AS patient_name
      FROM patient_cases c
      JOIN users u ON c.patient_id = u.id
      WHERE c.status = 'open'
      ORDER BY c.created_at DESC
    `);

    res.json({ count: rows.length, cases: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
}

// ===============================
//  إنشاء تبرع جديد
// ===============================
export async function createDonation(req, res) {
  try {
    if (req.user.role !== 'donor') {
      return res.status(403).json({ error: 'Only donors can create donations' });
    }

    const { patient_id, case_id, amount, note } = req.body;
    if (!patient_id || !case_id || !amount) {
      return res.status(400).json({ error: 'patient_id, case_id, and amount are required' });
    }

    await pool.query(
      `INSERT INTO donations (donor_id, patient_id, case_id, amount, note)
       VALUES (?, ?, ?, ?, ?)`,
      [req.user.id, patient_id, case_id, amount, note || null]
    );

    await pool.query(
      `UPDATE patient_cases
       SET raised_amount = raised_amount + ?
       WHERE id = ?`,
      [amount, case_id]
    );

    res.status(201).json({ message: 'Donation added successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
}

// ===============================
//  عرض تبرعات المستخدم الحالي (donor)
// ===============================
export async function getMyDonations(req, res) {
  try {
    if (req.user.role !== 'donor') {
      return res.status(403).json({ error: 'Only donors can view their donations' });
    }

    const [rows] = await pool.query(
      `SELECT d.*, u.name AS patient_name, c.title AS case_title
       FROM donations d
       JOIN users u ON d.patient_id = u.id
       JOIN patient_cases c ON d.case_id = c.id
       WHERE d.donor_id = ?
       ORDER BY d.created_at DESC`,
      [req.user.id]
    );

    res.json({ count: rows.length, donations: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
}

// ===============================
//  إضافة إيصال جديد (Receipt)
// ===============================
export async function addReceipt(req, res) {
  try {
  const { case_id, file_url, description, feedback } = req.body;

if (!case_id || !file_url) {
  return res.status(400).json({ error: 'case_id and file_url are required' });
}

const fullDescription = feedback
  ? `${description || ''} — Feedback: ${feedback}`
  : description || '';

await pool.query(
  `INSERT INTO receipts (case_id, file_url, description)
   VALUES (?, ?, ?)`,
  [case_id, file_url, fullDescription]
);

res.status(201).json({
  message: 'Receipt and feedback added successfully',
  receipt: { case_id, file_url, description: fullDescription }
});


 
} catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
}

// ===============================
//  عرض الإيصالات الخاصة بحالة معينة
// ===============================
export async function getReceiptsByCase(req, res) {
  try {
    const { case_id } = req.params;

    const [rows] = await pool.query(
      `SELECT * FROM receipts WHERE case_id = ? ORDER BY uploaded_at DESC`,
      [case_id]
    );

    const formatted = rows.map((r) => ({
  id: r.id,
  file_name: r.file_url ? r.file_url.split('/').pop() : 'No file name',
  description: r.description || 'No description provided',
  uploaded_at: r.uploaded_at
    }));

res.json({ count: formatted.length, receipts: formatted });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
}
