import { pool } from '../db.js';


/* =========================================================
   📋 2️⃣ عرض جميع الـ Feedback (Admin فقط)
========================================================= */
export async function getAllFeedback(req, res) {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Only admin can view feedback' });
    }

    const [rows] = await pool.query(`
      SELECT f.id, u.name AS patient_name, p.title AS case_title, f.feedback, f.created_at
      FROM feedback f
      JOIN users u ON f.patient_id = u.id
      JOIN patient_cases p ON f.case_id = p.id
      ORDER BY f.created_at DESC
    `);

    res.json({ total: rows.length, feedbacks: rows });
  } catch (err) {
    console.error('Error fetching feedback:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
}


/* =========================================================
   🗑️ 4️⃣ حذف Feedback (Admin فقط)
========================================================= */
export async function deleteFeedback(req, res) {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Only admins can delete feedback' });
    }

    const { id } = req.params;
    const [existing] = await pool.query('SELECT id FROM feedback WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Feedback not found' });
    }

    await pool.query('DELETE FROM feedback WHERE id = ?', [id]);
    res.json({ message: '🗑️ Feedback deleted successfully', deleted_id: id });
  } catch (err) {
    console.error('Error deleting feedback:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
}
