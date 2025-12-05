import { pool } from '../db.js';

/* =========================================================
    إضافة بعثة طبية جديدة (Admin / NGO)
========================================================= */
export async function addMission(req, res) {
  try {
    const { id,ngo_id, mission_name, location, start_date, end_date, description } = req.body;
    if (req.user.role !== 'admin' && req.user.role !== 'ngo') {
      return res.status(403).json({ error: 'Only Admin or NGO can create missions' });
    }
    if (!mission_name || !location) {
      return res.status(400).json({ error: 'Mission name and location are required' });
    }
    const assignedNgoId = req.user.role === 'ngo' ? req.user.id : ngo_id || null;

    const [result] = await pool.query(
      `INSERT INTO medical_missions 
        (ngo_id, mission_name, location, start_date, end_date, description, status)
        VALUES (?, ?, ?, ?, ?, ?, 'upcoming')`,
      [assignedNgoId, mission_name, location, start_date, end_date, description]
    );

    res.status(201).json({
      message: '✅ Medical Mission created successfully',
      mission: {
        id: result.insertId,
        mission_name,
        location,
        start_date,
        end_date,
        description,
        ngo_id: assignedNgoId
      }
    });
  } catch (err) {
    console.error('Error creating mission:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
}

/* =========================================================
    تعديل بيانات بعثة طبية (Admin / NGO مالك البعثة)
========================================================= */
export async function updateMission(req, res) {
  try {
    const { id } = req.params;
    const { mission_name, location, start_date, end_date, description } = req.body;
    const [missions] = await pool.query('SELECT * FROM medical_missions WHERE id = ?', [id]);
    if (missions.length === 0) {
      return res.status(404).json({ error: 'Mission not found' });
    }

    const mission = missions[0];
    if (req.user.role !== 'admin' && req.user.id !== mission.ngo_id) {
      return res.status(403).json({ error: 'Not authorized to update this mission' });
    }

    const newName = mission_name || mission.mission_name;
    const newLocation = location || mission.location;
    const newStart = start_date || mission.start_date;
    const newEnd = end_date || mission.end_date;
    const newDesc = description || mission.description;

    await pool.query(
      `UPDATE medical_missions 
       SET mission_name = ?, location = ?, start_date = ?, end_date = ?, description = ?
       WHERE id = ?`,
      [newName, newLocation, newStart, newEnd, newDesc, id]
    );

    res.json({
      message: '📝 Mission updated successfully',
      updated_mission: {
        id,
        mission_name: newName,
        location: newLocation,
        start_date: newStart,
        end_date: newEnd,
        description: newDesc
      }
    });

  } catch (err) {
    console.error('Error updating mission:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
}
export async function deleteMission(req, res) {
  try {
    const { id } = req.params;
    const [rows] = await pool.query('SELECT * FROM medical_missions WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Mission not found' });
    }
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Only admin can delete missions' });
    }
    await pool.query('DELETE FROM medical_missions WHERE id = ?', [id]);

    res.json({ message: '🗑️ Mission deleted successfully', deleted_mission_id: id });
  } catch (err) {
    console.error('Error deleting mission:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
}/* =========================================================
    عرض جميع البعثات (Admin / NGO / Doctor)
========================================================= */
export async function getAllMissions(req, res) {
  try {
    const { status, location, ngo_id } = req.query;
    let query = 'SELECT * FROM medical_missions WHERE 1=1';
    const params = [];
    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }

    if (location) {
      query += ' AND location LIKE ?';
      params.push(`%${location}%`);
    }

    if (ngo_id) {
      query += ' AND ngo_id = ?';
      params.push(ngo_id);
    }

    if (req.user.role === 'ngo') {
      query += ' AND ngo_id = ?';
      params.push(req.user.id);
    }

    query += ' ORDER BY start_date DESC';

    const [missions] = await pool.query(query, params);

    if (missions.length === 0) {
      return res.json({ message: '⚠️ No missions found', total: 0 });
    }

    res.json({
      total: missions.length,
      missions
    });

  } catch (err) {
    console.error('Error fetching missions:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
}

/* =========================================================
    البحث عن بعثة حسب الاسم أو الموقع
========================================================= */
export async function searchMission(req, res) {
  try {
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    const [missions] = await pool.query(
      `SELECT * FROM medical_missions 
       WHERE mission_name LIKE ? OR location LIKE ?`,
      [`%${query}%`, `%${query}%`]
    );

    if (missions.length === 0) {
      return res.json({ message: '⚠️ No missions found', total: 0 });
    }

    res.json({
      total: missions.length,
      missions,
    });
  } catch (err) {
    console.error('Error searching missions:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
}
/* =========================================================
   6️⃣ تغيير حالة البعثة (Admin only)
========================================================= */
export async function changeMissionStatus(req, res) {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Only admin can change mission status' });
    }

    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['upcoming', 'active', 'completed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status value' });
    }

    const [existing] = await pool.query('SELECT * FROM medical_missions WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Mission not found' });
    }

    await pool.query('UPDATE medical_missions SET status = ? WHERE id = ?', [status, id]);

    res.json({
      message: `✅ Mission status updated to '${status}'`,
      mission_id: id,
      new_status: status,
    });
  } catch (err) {
    console.error('Error changing mission status:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
}

