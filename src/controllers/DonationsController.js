import { pool } from '../db.js';

/* =========================================================
    عرض جميع التبرعات
========================================================= */
export async function getAllDonations(req, res) {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Only admin can view donations' });

    const [rows] = await pool.query(`
      SELECT d.id, u1.name AS donor_name, u2.name AS patient_name,
             d.amount, d.note, d.created_at, d.case_id
      FROM donations d
      LEFT JOIN users u1 ON d.donor_id = u1.id
      LEFT JOIN users u2 ON d.patient_id = u2.id
      ORDER BY d.created_at DESC
    `);

    res.json({ total: rows.length, donations: rows });
  } catch (err) {
    console.error('Error fetching donations:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
}

/* =========================================================
    إضافة تبرع يدوي
========================================================= */
export async function addDonation(req, res) {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Only admin can add donations' });

    const { donor_id, patient_id, case_id, amount, note } = req.body;

    if (!amount || !case_id) {
      return res.status(400).json({ error: 'Amount and case_id are required' });
    }

    const [caseCheck] = await pool.query('SELECT * FROM patient_cases WHERE id = ?', [case_id]);
    if (caseCheck.length === 0) return res.status(404).json({ error: 'Case not found' });

    await pool.query(
      'INSERT INTO donations (donor_id, patient_id, case_id, amount, note) VALUES (?, ?, ?, ?, ?)',
      [donor_id || null, patient_id || caseCheck[0].patient_id, case_id, amount, note || null]
    );

    await pool.query('UPDATE patient_cases SET raised_amount = raised_amount + ? WHERE id = ?', [amount, case_id]);

    res.status(201).json({ message: '💰 Donation added successfully', case_id, amount });
  } catch (err) {
    console.error('Error adding donation:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
}

/* =========================================================
    حذف تبرع
========================================================= */
export async function deleteDonation(req, res) {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Only admin can delete donations' });

    const { id } = req.params;
    const [donation] = await pool.query('SELECT * FROM donations WHERE id = ?', [id]);
    if (donation.length === 0) return res.status(404).json({ error: 'Donation not found' });

    if (donation[0].case_id && donation[0].amount) {
      await pool.query('UPDATE patient_cases SET raised_amount = raised_amount - ? WHERE id = ?', [donation[0].amount, donation[0].case_id]);
    }

    await pool.query('DELETE FROM donations WHERE id = ?', [id]);
    res.json({ message: '🗑️ Donation deleted successfully', deleted_donation_id: id });
  } catch (err) {
    console.error('Error deleting donation:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
}

/* =========================================================
    عرض تبرعات حالة معينة
========================================================= */
export async function getDonationsByCase(req, res) {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Only admin can view case donations' });

    const { case_id } = req.params;
    const [rows] = await pool.query(`
      SELECT d.id, u.name AS donor_name, d.amount, d.note, d.created_at
      FROM donations d
      LEFT JOIN users u ON d.donor_id = u.id
      WHERE d.case_id = ?
      ORDER BY d.created_at DESC
    `, [case_id]);

    res.json({ total: rows.length, donations: rows });
  } catch (err) {
    console.error('Error fetching case donations:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
}
