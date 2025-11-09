import { pool } from '../db.js';

// CREATE group (admin)
export const createGroup = async (req, res) => {
  try {
    const { name, description, topic, moderator_id } = req.body;
    const [result] = await pool.query(
      `INSERT INTO support_groups (name, description, topic, moderator_id)
       VALUES (?, ?, ?, ?)`,
      [name, description || null, topic || 'general', moderator_id || null]
    );
    // if moderator_id provided, also add to group_members as moderator
    if (moderator_id) {
      await pool.query(
        `INSERT IGNORE INTO group_members (group_id, user_id, role) VALUES (?, ?, 'moderator')`,
        [result.insertId, moderator_id]
      );
    }
    res.status(201).json({ id: result.insertId, message: 'Group created' });
  } catch (err) {
    console.error('createGroup error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// LIST groups (paged optional)
export const listGroups = async (req, res) => {
  try {
    const page = parseInt(req.query.page || '1', 10);
    const limit = parseInt(req.query.limit || '20', 10);
    const offset = (page - 1) * limit;

    const [rows] = await pool.query(
      `SELECT g.*, u.name AS moderator_name
       FROM support_groups g
       LEFT JOIN users u ON g.moderator_id = u.id
       ORDER BY g.created_at DESC
       LIMIT ? OFFSET ?`,
      [limit, offset]
    );
    res.json(rows);
  } catch (err) {
    console.error('listGroups error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getGroup = async (req, res) => {
  try {
    const groupId = req.params.id;
    const [[group]] = await pool.query(`SELECT g.*, u.name AS moderator_name FROM support_groups g LEFT JOIN users u ON g.moderator_id = u.id WHERE g.id = ?`, [groupId]);
    if (!group) return res.status(404).json({ message: 'Group not found' });
    res.json(group);
  } catch (err) {
    console.error('getGroup error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Join group
export const joinGroup = async (req, res) => {
  try {
    const groupId = req.params.id;
    const userId = req.user.id;

    // check exists
    const [[grp]] = await pool.query(`SELECT id FROM support_groups WHERE id = ?`, [groupId]);
    if (!grp) return res.status(404).json({ message: 'Group not found' });

    await pool.query(
      `INSERT IGNORE INTO group_members (group_id, user_id, role) VALUES (?, ?, 'member')`,
      [groupId, userId]
    );

    res.json({ message: 'Joined group' });
  } catch (err) {
    console.error('joinGroup error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Leave group
export const leaveGroup = async (req, res) => {
  try {
    const groupId = req.params.id;
    const userId = req.user.id;

    await pool.query(`DELETE FROM group_members WHERE group_id = ? AND user_id = ?`, [groupId, userId]);
    res.json({ message: 'Left group' });
  } catch (err) {
    console.error('leaveGroup error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get members (only members or moderator/admin)
export const getMembers = async (req, res) => {
  try {
    const groupId = req.params.id;
    const userId = req.user.id;
    const role = req.user.role;

    // if not admin, verify membership
    if (role !== 'admin') {
      const [isMember] = await pool.query(`SELECT * FROM group_members WHERE group_id = ? AND user_id = ?`, [groupId, userId]);
      if (isMember.length === 0) return res.status(403).json({ message: 'Access denied' });
    }

    const [members] = await pool.query(
      `SELECT gm.user_id, u.name, gm.role, gm.joined_at
       FROM group_members gm
       JOIN users u ON gm.user_id = u.id
       WHERE gm.group_id = ?`,
      [groupId]
    );
    res.json(members);
  } catch (err) {
    console.error('getMembers error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Post message (must be member)
export const postMessage = async (req, res) => {
  try {
    const groupId = req.params.id;
    const userId = req.user.id;
    const { message } = req.body;
    if (!message || message.trim() === '') return res.status(400).json({ message: 'Message cannot be empty' });

    // check membership
    const [isMember] = await pool.query(`SELECT * FROM group_members WHERE group_id = ? AND user_id = ?`, [groupId, userId]);
    if (isMember.length === 0) return res.status(403).json({ message: 'You must join the group to send messages' });

    const [result] = await pool.query(
      `INSERT INTO group_messages (group_id, sender_id, message) VALUES (?, ?, ?)`,
      [groupId, userId, message]
    );

    // Optionally: publish to socket room here (if socket server running)
    // e.g., io.to(`group_${groupId}`).emit('new_message', { id: result.insertId, group_id: groupId, sender_id: userId, message, created_at: new Date() });

    res.status(201).json({ id: result.insertId, message: 'Message posted' });
  } catch (err) {
    console.error('postMessage error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get messages (only members)
export const getMessages = async (req, res) => {
  try {
    const groupId = req.params.id;
    const userId = req.user.id;
    const role = req.user.role;

    // admin can view all
    if (role !== 'admin') {
      const [isMember] = await pool.query(`SELECT * FROM group_members WHERE group_id = ? AND user_id = ?`, [groupId, userId]);
      if (isMember.length === 0) return res.status(403).json({ message: 'Access denied' });
    }

    const [messages] = await pool.query(
      `SELECT m.id, m.message, m.created_at, m.sender_id, u.name AS sender_name
       FROM group_messages m
       JOIN users u ON m.sender_id = u.id
       WHERE m.group_id = ?
       ORDER BY m.created_at ASC
       LIMIT 100`,
      [groupId]
    );

    res.json(messages);
  } catch (err) {
    console.error('getMessages error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Admin/Moderator: delete message
export const deleteMessage = async (req, res) => {
  try {
    const { groupId, messageId } = req.params;
    const userId = req.user.id;
    const role = req.user.role;

    // check moderator or admin
    if (role !== 'admin') {
      const [mod] = await pool.query(`SELECT * FROM group_members WHERE group_id = ? AND user_id = ? AND role = 'moderator'`, [groupId, userId]);
      if (mod.length === 0) return res.status(403).json({ message: 'Only moderator/admin can delete messages' });
    }

    await pool.query(`DELETE FROM group_messages WHERE id = ? AND group_id = ?`, [messageId, groupId]);
    res.json({ message: 'Message deleted' });
  } catch (err) {
    console.error('deleteMessage error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Admin/Moderator: remove member
export const removeMember = async (req, res) => {
  try {
    const groupId = req.params.groupId;
    const memberId = req.params.memberId;
    const userId = req.user.id;
    const role = req.user.role;

    // only moderator/admin
    if (role !== 'admin') {
      const [mod] = await pool.query(`SELECT * FROM group_members WHERE group_id = ? AND user_id = ? AND role = 'moderator'`, [groupId, userId]);
      if (mod.length === 0) return res.status(403).json({ message: 'Only moderator/admin can remove members' });
    }

    await pool.query(`DELETE FROM group_members WHERE id = ? AND group_id = ?`, [memberId, groupId]);
    res.json({ message: 'Member removed' });
  } catch (err) {
    console.error('removeMember error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
