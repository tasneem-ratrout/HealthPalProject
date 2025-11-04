import { pool } from '../db.js';

/* =========================================================
   إضافة منظمة جديدة (Admin Only)
========================================================= */
export async function addNGODetails(req, res) {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Only admin can add NGO details' });
    }

    const { id } = req.params; // نفس id من جدول users
    const { phone, address } = req.body;
    const [userCheck] = await pool.query('SELECT * FROM users WHERE id = ? AND role = "ngo"', [id]);
    if (userCheck.length === 0) {
      return res.status(404).json({ error: 'NGO user not found' });
    }

    const ngoName = userCheck[0].name;
    const ngoEmail = userCheck[0].email;
    const [existing] = await pool.query('SELECT * FROM ngos WHERE id = ?', [id]);
    if (existing.length > 0) {
      return res.status(409).json({ error: 'NGO details already exist' });
    }
    await pool.query(
      'INSERT INTO ngos (id, name, email, phone, address) VALUES (?, ?, ?, ?, ?)',
      [id, ngoName, ngoEmail, phone || null, address || null])

    if (!name) return res.status(400).json({ error: 'NGO name is required' });

    const [result] = await pool.query(
      'INSERT INTO ngos (name, email, phone, address) VALUES (?, ?, ?, ?)',
      [name, email || null, phone || null, address || null]
    );

    res.status(201).json({
      message: '✅ NGO details added successfully',
      ngo: { id, name: ngoName, email: ngoEmail, phone, address }
    });
  } catch (err) {
    console.error('Error adding NGO details:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
}

/* =========================================================
    تعديل بيانات منظمة (Admin Only)
========================================================= */
export async function updateNGO(req, res) {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Only admin can update NGOs' });
    }

    const { id } = req.params;
    const { name, email, phone, address } = req.body;

    const [existing] = await pool.query('SELECT * FROM ngos WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ error: 'NGO not found' });
    }

    const updatedName = name || existing[0].name;
    const updatedEmail = email || existing[0].email;
    const updatedPhone = phone || existing[0].phone;
    const updatedAddress = address || existing[0].address;

    await pool.query(
      'UPDATE ngos SET name = ?, email = ?, phone = ?, address = ? WHERE id = ?',
      [updatedName, updatedEmail, updatedPhone, updatedAddress, id]
    );

    res.json({
      message: '✅ NGO updated successfully',
      ngo: { id, name: updatedName, email: updatedEmail, phone: updatedPhone, address: updatedAddress },
    });
  } catch (err) {
    console.error('Error updating NGO:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
}

/* =========================================================
   🗑️ حذف منظمة (Admin Only)
========================================================= */
export async function deleteNGO(req, res) {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Only admin can delete NGOs' });
    }

    const { id } = req.params;

    const [existing] = await pool.query('SELECT * FROM ngos WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ error: 'NGO not found' });
    }

    await pool.query('DELETE FROM ngos WHERE id = ?', [id]);
    res.json({ message: '🗑️ NGO deleted successfully', deleted_ngo_id: id });
  } catch (err) {
    console.error('Error deleting NGO:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
}

/* =========================================================
   👀 عرض جميع المنظمات (Admin Only)
========================================================= */
export async function getAllNGOs(req, res) {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Only admin can view NGOs' });
    }

    const { is_verified } = req.query;
    let query = 'SELECT id, name, email, phone, address, is_verified FROM ngos WHERE 1=1';
    const params = [];

    if (is_verified !== undefined) {
      query += ' AND is_verified = ?';
      params.push(is_verified === 'true' ? 1 : 0);
    }

    const [rows] = await pool.query(query, params);
    res.json({ total: rows.length, ngos: rows });
  } catch (err) {
    console.error('Error fetching NGOs:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
}

/* =========================================================
   🔍 البحث عن منظمة (Admin Only)
========================================================= */
export async function searchNGOs(req, res) {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Only admin can search NGOs' });
    }

    const { name, email } = req.query;

    if (!name && !email) {
      return res.status(400).json({ error: 'Please provide name or email to search' });
    }

    let query = 'SELECT id, name, email, phone, address, is_verified FROM ngos WHERE 1=1';
    const params = [];

    if (name) {
      query += ' AND name LIKE ?';
      params.push(`%${name}%`);
    }

    if (email) {
      query += ' AND email LIKE ?';
      params.push(`%${email}%`);
    }

    const [rows] = await pool.query(query, params);

    if (rows.length === 0) {
      return res.status(404).json({ message: 'No NGOs found matching your search' });
    }

    res.json({ total: rows.length, ngos: rows });
  } catch (err) {
    console.error('Error searching NGOs:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }

}

