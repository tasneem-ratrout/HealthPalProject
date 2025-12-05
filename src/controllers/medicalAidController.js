// src/controllers/inventoryController.js
import { pool } from '../db.js';

/* =========================================================
 إضافة مساعدة طبية جديدة (Admin / NGO)
========================================================= */
export async function addMedicalAid(req, res) {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'ngo') {
      return res.status(403).json({ error: 'Only Admin or NGO can add medical aid' });
    }

    const { item_name, category, quantity, unit, location, status } = req.body;

    if (!item_name || !quantity) {
      return res.status(400).json({ error: 'Item name and quantity are required' });
    }

    const ngoId = req.user.role === 'ngo' ? req.user.id : req.body.ngo_id || null;

    const [result] = await pool.query(
      `INSERT INTO medical_aid (ngo_id, item_name, category, quantity, unit, location, status)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [ngoId, item_name, category || 'medicine', quantity, unit || 'pcs', location || null, status || 'available']
    );

    res.status(201).json({
      message: '✅ Medical aid added successfully',
      aid: {
        id: result.insertId,
        ngo_id: ngoId,
        item_name,
        category,
        quantity,
        unit,
        location,
        status,
      },
    });
  } catch (err) {
    console.error('Error adding medical aid:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
}

/* =========================================================
  عرض كل المساعدات (مع فلترة حسب الفئة أو الحالة)
========================================================= */
export async function getAllMedicalAids(req, res) {
  try {
    const { category, status } = req.query;

    let query = `
      SELECT ma.id, ma.item_name, ma.category, ma.quantity, ma.unit, ma.location, ma.status, n.name AS ngo_name
      FROM medical_aid ma
      LEFT JOIN ngos n ON ma.ngo_id = n.id
      WHERE 1=1
    `;
    const params = [];

    if (category) {
      query += ' AND ma.category = ?';
      params.push(category);
    }

    if (status) {
      query += ' AND ma.status = ?';
      params.push(status);
    }

    const [rows] = await pool.query(query, params);
    res.json({ total: rows.length, medical_aids: rows });
  } catch (err) {
    console.error('Error fetching medical aids:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
}

/* =========================================================
   تحديث حالة أو كمية مساعدة طبية
========================================================= */
export async function updateMedicalAid(req, res) {
  try {
    const { id } = req.params;
    const { quantity, status } = req.body;

    const [existing] = await pool.query('SELECT * FROM medical_aid WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Medical aid not found' });
    }

    const updatedQuantity = quantity ?? existing[0].quantity;
    const updatedStatus = status ?? existing[0].status;

    await pool.query(
      'UPDATE medical_aid SET quantity = ?, status = ? WHERE id = ?',
      [updatedQuantity, updatedStatus, id]
    );

    res.json({
      message: '🔄 Medical aid updated successfully',
      id,
      new_status: updatedStatus,
      remaining_quantity: updatedQuantity,
    });
  } catch (err) {
    console.error('Error updating medical aid:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
}

/* =========================================================
   4️⃣ حذف مساعدة طبية
========================================================= */
export async function deleteMedicalAid(req, res) {
  try {
    const { id } = req.params;
    const [existing] = await pool.query('SELECT * FROM medical_aid WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Medical aid not found' });
    }

    await pool.query('DELETE FROM medical_aid WHERE id = ?', [id]);
    res.json({ message: '🗑️ Medical aid deleted successfully', deleted_id: id });
  } catch (err) {
    console.error('Error deleting medical aid:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
}
