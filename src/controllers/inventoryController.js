import { pool } from '../db.js';

/* =========================================================
 إضافة عنصر ذكي يتحقق من NGO موجود مسبقًا
========================================================= */
export async function addInventoryItem(req, res) {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'ngo') {
      return res.status(403).json({ error: 'Only Admin or NGO can add inventory items' });
    }

    const { ngo_id, item_name, category, quantity, unit, location, status } = req.body;
    if (!item_name || !quantity) {
      return res.status(400).json({ error: 'Item name and quantity are required' });
    }

    let ngoId = null;
    if (req.user.role === 'ngo') {
      ngoId = req.user.id;
    } else if (ngo_id) {
      const [ngoExists] = await pool.query('SELECT id FROM ngos WHERE id = ?', [ngo_id]);
      if (ngoExists.length === 0) {
        return res.status(400).json({ error: 'NGO not found in database' });
      }
      ngoId = ngo_id;
    }

    const [result] = await pool.query(
      `INSERT INTO inventory (ngo_id, item_name, category, quantity, unit, location, status)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [ngoId, item_name, category || 'medicine', quantity, unit || 'pcs', location || 'Unknown', status || 'available']
    );

    res.status(201).json({
      message: '✅ Item added successfully to inventory',
      item: {
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
    console.error('Error adding inventory item:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
}

/* =========================================================
 عرض جميع عناصر المخزون (مع فلترة ذكية)
========================================================= */
export async function getInventory(req, res) {
  try {
    const { category, status, search } = req.query;

    let query = `
      SELECT i.id, i.item_name, i.category, i.quantity, i.unit, i.location, i.status,
             COALESCE(n.name, 'Independent / General Stock') AS ngo_name
      FROM inventory i
      LEFT JOIN ngos n ON i.ngo_id = n.id
      WHERE 1=1
    `;
    const params = [];

    if (category) {
      query += ' AND i.category = ?';
      params.push(category);
    }

    if (status) {
      query += ' AND i.status = ?';
      params.push(status);
    }

    if (search) {
      query += ' AND i.item_name LIKE ?';
      params.push(`%${search}%`);
    }

    const [rows] = await pool.query(query, params);
    res.json({ total: rows.length, inventory: rows });
  } catch (err) {
    console.error('Error fetching inventory:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
}

/* =========================================================
  تحديث كمية أو حالة عنصر
========================================================= */
export async function updateInventory(req, res) {
  try {
    const { id } = req.params;
    const { quantity, status } = req.body;

    const [[item]] = await pool.query('SELECT * FROM inventory WHERE id = ?', [id]);
    if (!item) return res.status(404).json({ error: 'Item not found' });

    const newQty = quantity ?? item.quantity;
    const newStatus = status ?? item.status;

    await pool.query('UPDATE inventory SET quantity = ?, status = ? WHERE id = ?', [newQty, newStatus, id]);

    res.json({
      message: '✅ Inventory item updated successfully',
      id,
      newQty,
      newStatus,
    });
  } catch (err) {
    console.error('Error updating inventory:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
}

/* =========================================================
 تقرير استخدام المخزون في المساعدات الطبية
========================================================= */
export async function getInventoryUsageReport(req, res) {
  try {
    const [rows] = await pool.query(`
      SELECT 
        i.item_name,
        i.category,
        i.quantity AS remaining_quantity,
        COUNT(ma.id) AS used_in_aid_requests
      FROM inventory i
      LEFT JOIN medical_aid ma ON ma.item_id = i.id
      GROUP BY i.id
      ORDER BY used_in_aid_requests DESC
    `);

    res.json({ total: rows.length, report: rows });
  } catch (err) {
    console.error('Error generating usage report:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
}

/* =========================================================
  حذف عنصر من المخزون
========================================================= */
export async function deleteInventory(req, res) {
  try {
    const { id } = req.params;
    const [[item]] = await pool.query('SELECT * FROM inventory WHERE id = ?', [id]);
    if (!item) return res.status(404).json({ error: 'Item not found' });

    await pool.query('DELETE FROM inventory WHERE id = ?', [id]);
    res.json({ message: '🗑️ Inventory item deleted successfully', deleted_id: id });
  } catch (err) {
    console.error('Error deleting inventory:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
}
