import bcrypt from 'bcrypt';
import { pool } from '../db.js';

/* =========================================================
   إنشاء مستخدم جديد (doctor / patient / donor / ngo / admin)
========================================================= */
export async function createUser(req, res) {
  try {
    // ✅ السماح فقط للإدمن بإنشاء المستخدمين
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Only admin can create users' });
    }

    const { name, email, password, role, specialty_id } = req.body;

    // 🔸 التحقق من الحقول الأساسية
    if (!name || !email || !password || !role) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // 🔸 التأكد من أن الإيميل غير مستخدم
    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(409).json({ error: 'Email already exists' });
    }

    // 🔸 تشفير كلمة المرور
    const password_hash = await bcrypt.hash(password, 10);

    // 🧠 معالجة كل نوع من المستخدمين
    if (role === 'doctor' && !specialty_id) {
      return res.status(400).json({ error: 'Doctor must have a specialty_id' });
    }

    // ✅ تنفيذ الإدخال في قاعدة البيانات
    const [result] = await pool.query(
      'INSERT INTO users (name, email, password_hash, role, specialty_id) VALUES (?, ?, ?, ?, ?)',
      [name, email, password_hash, role, specialty_id || null]
    );

    // 🔹 رسالة النجاح
    res.status(201).json({
      message: `✅ ${role.charAt(0).toUpperCase() + role.slice(1)} created successfully by Admin`,
      user: {
        id: result.insertId,
        name,
        email,
        role,
        specialty_id: specialty_id || null,
      },
    });

  } catch (err) {
    console.error('Error creating user:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
}




//delete

/* =========================================================
   حذف مستخدم (Admin only)
========================================================= */
export async function deleteUser(req, res) {
  try {
    // التحقق من أن المستخدم إدمن
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Only admin can delete users' });
    }

    const { id } = req.params;

    // التأكد إن المستخدم مش عم يحاول يحذف حاله
    if (req.user.id === Number(id)) {
      return res.status(400).json({ error: 'Admin cannot delete their own account' });
    }

    // التحقق من أن المستخدم موجود
    const [existing] = await pool.query('SELECT id FROM users WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    // تنفيذ الحذف
    await pool.query('DELETE FROM users WHERE id = ?', [id]);

    res.json({ message: '🗑️ User deleted successfully', deleted_user_id: id });
  } catch (err) {
    console.error('Error deleting user:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
}




//update
/* =========================================================
   تعديل بيانات المستخدم (Admin Only)
========================================================= */
export async function updateUser(req, res) {
  try {
    // ✅ التحقق من أن المستخدم الحالي هو أدمن
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Only admin can update users' });
    }

    const { id } = req.params;
    const { name, email, role, specialty_id } = req.body;

    // التحقق من وجود المستخدم
    const [existing] = await pool.query('SELECT * FROM users WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    // إعداد البيانات الجديدة
    const updatedName = name || existing[0].name;
    const updatedEmail = email || existing[0].email;
    const updatedRole = role || existing[0].role;
    const updatedSpecialty = specialty_id || existing[0].specialty_id;

    // تنفيذ التعديل
    await pool.query(
      'UPDATE users SET name = ?, email = ?, role = ?, specialty_id = ? WHERE id = ?',
      [updatedName, updatedEmail, updatedRole, updatedSpecialty, id]
    );

    res.json({
      message: '📝 User updated successfully',
      updated_user: { id, name: updatedName, email: updatedEmail, role: updatedRole, specialty_id: updatedSpecialty },
    });
  } catch (err) {
    console.error('Error updating user:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
}



/* =========================================================
   تفعيل / تعطيل المستخدم (Admin Only)
========================================================= */
export async function toggleUserStatus(req, res) {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Only admin can toggle user status' });
    }

    const { id } = req.params;

    const [existing] = await pool.query('SELECT * FROM users WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const newStatus = !existing[0].is_active;
    await pool.query('UPDATE users SET is_active = ? WHERE id = ?', [newStatus, id]);

    res.json({
      message: newStatus ? '✅ User activated' : '⛔ User deactivated',
      user_id: id,
      new_status: newStatus,
    });
  } catch (err) {
    console.error('Error toggling user status:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
}


/* =========================================================
   توثيق الطبيب (Admin Only)
========================================================= */

export async function verifyDoctor(req, res) {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Only admin can verify doctors' });
    }

    const { id } = req.params;

    const [existing] = await pool.query('SELECT * FROM users WHERE id = ? AND role = "doctor"', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Doctor not found' });
    }

    await pool.query('UPDATE users SET is_verified_doctor = TRUE WHERE id = ?', [id]);

    res.json({ message: '✅ Doctor verified successfully', doctor_id: id });
  } catch (err) {
    console.error('Error verifying doctor:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
}



/* =========================================================
   عرض جميع المستخدمين (Admin only)
========================================================= */
export async function getAllUsers(req, res) {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Only admin can view all users' });
    }

    const { role, is_active } = req.query;
    let query = 'SELECT id, name, email, role, is_active, created_at FROM users WHERE 1=1';
    const params = [];

    if (role) {
      query += ' AND role = ?';
      params.push(role);
    }

    if (is_active !== undefined) {
      query += ' AND is_active = ?';
      params.push(is_active === 'true' ? 1 : 0);
    }

    query += ' ORDER BY created_at DESC';

    const [rows] = await pool.query(query, params);
    res.json({ total: rows.length, users: rows });
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
}


/* =========================================================
   إعادة تعيين كلمة مرور المستخدم (Admin Only)
========================================================= */
export async function resetUserPassword(req, res) {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Only admin can reset user passwords' });
    }

    const { id } = req.params;
    const { new_password } = req.body;

    // التحقق من وجود كلمة مرور جديدة
    if (!new_password) {
      return res.status(400).json({ error: 'New password is required' });
    }

    // التحقق من أن المستخدم موجود
    const [user] = await pool.query('SELECT id FROM users WHERE id = ?', [id]);
    if (user.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    // تشفير كلمة المرور الجديدة
    const hashedPassword = await bcrypt.hash(new_password, 10);

    // تحديث كلمة المرور في قاعدة البيانات
    await pool.query('UPDATE users SET password_hash = ? WHERE id = ?', [hashedPassword, id]);

    res.json({ message: '🔑 Password reset successfully by Admin', user_id: id });
  } catch (err) {
    console.error('Error resetting password:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
}

/* =========================================================
   البحث عن مستخدم بالاسم أو الإيميل (Admin Only)
========================================================= */
export async function searchUsers(req, res) {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Only admin can search users' });
    }

    const { name, email } = req.query;

    if (!name && !email) {
      return res.status(400).json({ error: 'Please provide name or email to search' });
    }

    let query = 'SELECT id, name, email, role, is_active, created_at FROM users WHERE 1=1';
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
      return res.status(404).json({ message: 'No users found matching your search' });
    }

    res.json({ total: rows.length, users: rows });
  } catch (err) {
    console.error('Error searching users:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
}
