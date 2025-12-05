import { pool } from '../db.js';

/* =========================================================
    عرض جميع الحالات (مع فلترة حسب الحالة)
========================================================= */
export async function getAllCases(req, res) {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Only admin can view cases' });
    const { status } = req.query;
    let query = `
      SELECT c.id, u.name AS patient_name, c.title, c.diagnosis, 
      c.goal_amount, c.raised_amount, c.status, c.created_at
      FROM patient_cases c
      JOIN users u ON c.patient_id = u.id
      WHERE 1=1
      `
    ;
    const params = [];
    if (status) 
      {
      query += ' AND c.status = ?';
      params.push(status);
      }
    const [rows] = await pool.query(query, params);
    res.json({ total: rows.length, cases: rows });
  } catch (err) {
    console.error('Error fetching cases:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
}

/* =========================================================
    تعديل حالة مرضية
========================================================= */
export async function updateCaseStatus(req, res) {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Only admin can update cases' });
    const { id } = req.params;
    const { status } = req.body;
    if (!['open', 'funded', 'closed'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status value' });
    }

    const [caseRow] = await pool.query('SELECT * FROM patient_cases WHERE id = ?', [id]);
    if (caseRow.length === 0) return res.status(404).json({ error: 'Case not found' });

    await pool.query('UPDATE patient_cases SET status = ? WHERE id = ?', [status, id]);

    res.json({ message: '✅ Case status updated successfully', case_id: id, new_status: status });
  } catch (err) {
    console.error('Error updating case status:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
}

/* =========================================================
    حذف حالة مرضية
========================================================= */
export async function deleteCase(req, res) {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Only admin can delete cases' });

    const { id } = req.params;
    const [caseRow] = await pool.query('SELECT * FROM patient_cases WHERE id = ?', [id]);
    if (caseRow.length === 0) return res.status(404).json({ error: 'Case not found' });

    await pool.query('DELETE FROM patient_cases WHERE id = ?', [id]);
    res.json({ message: '🗑️ Case deleted successfully', deleted_case_id: id });
  } catch (err) {
    console.error('Error deleting case:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
}
