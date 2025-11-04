import { pool } from '../db.js';

/* =========================================================
   1️⃣ إرسال تنبيه جديد (Admin Only)
========================================================= */
export async function createNotification(req, res) {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Only admin can send notifications' });
    }

    const { title, message, target_role } = req.body;
    if (!title || !message) {
      return res.status(400).json({ error: 'Title and message are required' });
    }

    const [result] = await pool.query(
      'INSERT INTO admin_notifications (title, message, target_role, created_by) VALUES (?, ?, ?, ?)',
      [title, message, target_role || 'all', req.user.id]
    );

    res.status(201).json({
      message: '✅ Notification sent successfully',
      notification: {
        id: result.insertId,
        title,
        message,
        target_role: target_role || 'all',
      },
    });
  } catch (err) {
    console.error('Error creating notification:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
}

/* =========================================================
   2️⃣ عرض جميع التنبيهات (Admin Only)
========================================================= */
export async function getAllNotifications(req, res) {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Only admin can view notifications' });
    }

    const [rows] = await pool.query(
      `SELECT n.id, n.title, n.message, n.target_role, u.name AS created_by, n.created_at
       FROM admin_notifications n
       LEFT JOIN users u ON n.created_by = u.id
       ORDER BY n.created_at DESC`
    );

    res.json({ total: rows.length, admin_notifications: rows });
  } catch (err) {
    console.error('Error fetching notifications:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
}

/* =========================================================
   3️⃣ حذف تنبيه (Admin Only)
========================================================= */
export async function deleteNotification(req, res) {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Only admin can delete notifications' });
    }

    const { id } = req.params;

    const [existing] = await pool.query('SELECT id FROM admin_notifications WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    await pool.query('DELETE FROM notifications WHERE id = ?', [id]);
    res.json({ message: '🗑️ Notification deleted successfully', deleted_id: id });
  } catch (err) {
    console.error('Error deleting notification:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
}
