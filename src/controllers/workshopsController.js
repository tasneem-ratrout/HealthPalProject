// src/controllers/workshopsController.js
import { pool } from '../db.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const toJson = v => {
  try { return v ? JSON.parse(v) : null; } catch { return null; }
};

const list = async (req, res) => {
  try {
    const { q, type, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;
    const where = [];
    const params = [];

    if (type) { where.push('type = ?'); params.push(type); }
    if (q) { where.push('(title LIKE ? OR description LIKE ? OR location LIKE ?)'); params.push(`%${q}%`, `%${q}%`, `%${q}%`); }

    const whereSql = where.length ? 'WHERE ' + where.join(' AND ') : '';
    const [rows] = await db.execute(`SELECT SQL_CALC_FOUND_ROWS * FROM workshops ${whereSql} ORDER BY start_datetime ASC LIMIT ? OFFSET ?`, [...params, parseInt(limit,10), parseInt(offset,10)]);
    const [totalRes] = await db.query('SELECT FOUND_ROWS() as total');
    const total = totalRes[0] ? totalRes[0].total : rows.length;

    rows.forEach(r => { r.materials_json = toJson(r.materials_json); });

    res.json({ page: parseInt(page,10), limit: parseInt(limit,10), total, data: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const getById = async (req, res) => {
  try {
    const id = req.params.id;
    const [rows] = await db.execute('SELECT * FROM workshops WHERE id = ?', [id]);
    if (!rows.length) return res.status(404).json({ message: 'Not found' });
    const w = rows[0];
    w.materials_json = toJson(w.materials_json);
    res.json(w);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const create = async (req, res) => {
  try {
    // expected body: title, description, type, start_datetime OR start_date+start_time, end_datetime, location, capacity, organizer_id/host_ngo_id
    let { title, description, type='workshop', start_datetime, end_datetime, start_date, start_time, location, capacity, organizer_id, host_ngo_id } = req.body;
    if (!title) return res.status(400).json({ message: 'title required' });

    if (!start_datetime && start_date && start_time) {
      start_datetime = `${start_date} ${start_time}`;
    }

    const organizer = organizer_id || host_ngo_id || (req.user && req.user.id) || null;

    const [result] = await db.execute(
      `INSERT INTO workshops (title, description, type, start_datetime, end_datetime, location, capacity, organizer_id, host_ngo_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [title, description || null, type, start_datetime || null, end_datetime || null, location || null, capacity || null, organizer, host_ngo_id || null]
    );
    const insertId = result.insertId;
    const [newRow] = await db.execute('SELECT * FROM workshops WHERE id = ?', [insertId]);
    newRow[0].materials_json = toJson(newRow[0].materials_json);
    res.status(201).json(newRow[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const update = async (req, res) => {
  try {
    const id = req.params.id;
    const allowed = ['title','description','type','start_datetime','end_datetime','location','capacity','organizer_id','host_ngo_id','cover_image'];
    const updates = [];
    const params = [];
    allowed.forEach(k => { if (req.body[k] !== undefined) { updates.push(`${k} = ?`); params.push(req.body[k]); }});
    if (!updates.length) return res.status(400).json({ message: 'No fields to update' });
    params.push(id);
    await db.execute(`UPDATE workshops SET ${updates.join(', ')} WHERE id = ?`, params);
    const [rows] = await db.execute('SELECT * FROM workshops WHERE id = ?', [id]);
    rows[0].materials_json = toJson(rows[0].materials_json);
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const remove = async (req, res) => {
  try {
    const id = req.params.id;
    await db.execute('DELETE FROM workshops WHERE id = ?', [id]);
    res.json({ message: 'deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const uploadMaterials = async (req, res) => {
  try {
    const id = req.params.id;
    if (!req.files || !req.files.length) return res.status(400).json({ message: 'No files' });
    const filesMeta = req.files.map(f => ({ filename: f.filename, original: f.originalname, path: f.path }));
    // read current
    const [rows] = await db.execute('SELECT materials_json FROM workshops WHERE id = ?', [id]);
    if (!rows.length) return res.status(404).json({ message: 'Workshop not found' });
    const current = toJson(rows[0].materials_json) || [];
    const merged = current.concat(filesMeta);
    await db.execute('UPDATE workshops SET materials_json = ? WHERE id = ?', [JSON.stringify(merged), id]);

    // also insert into workshop_materials if using that table
    for (const f of filesMeta) {
      await db.execute('INSERT INTO workshop_materials (workshop_id, filename, original_name, path) VALUES (?, ?, ?, ?)', [id, f.filename, f.original, f.path]);
    }

    res.json({ message: 'uploaded', files: filesMeta });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const register = async (req, res) => {
  try {
    const workshopId = req.params.id;
    const userId = req.user && req.user.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const [ws] = await db.execute('SELECT * FROM workshops WHERE id = ?', [workshopId]);
    if (!ws.length) return res.status(404).json({ message: 'Workshop not found' });
    const workshop = ws[0];

    if (workshop.capacity) {
      const [countRows] = await db.execute('SELECT COUNT(*) as cnt FROM registrations WHERE workshop_id = ? AND status = ?', [workshopId, 'registered']);
      if (countRows[0].cnt >= workshop.capacity) return res.status(400).json({ message: 'Full' });
    }

    try {
      await db.execute('INSERT INTO registrations (workshop_id, user_id, status) VALUES (?, ?, ?)', [workshopId, userId, 'registered']);
      return res.status(201).json({ message: 'registered' });
    } catch (e) {
      return res.status(400).json({ message: 'Already registered' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const cancelRegistration = async (req, res) => {
  try {
    const workshopId = req.params.id;
    const userId = req.user && req.user.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });
    await db.execute('UPDATE registrations SET status = ? WHERE workshop_id = ? AND user_id = ?', ['canceled', workshopId, userId]);
    res.json({ message: 'canceled' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const attendees = async (req, res) => {
  try {
    const workshopId = req.params.id;
    const [rows] = await db.execute(
      `SELECT r.id, r.user_id, r.status, r.registered_at, u.name AS user_name, u.email AS user_email
       FROM registrations r
       LEFT JOIN users u ON u.id = r.user_id
       WHERE r.workshop_id = ?`,
      [workshopId]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

export  default {
  list, getById, create, update, remove, uploadMaterials, register, cancelRegistration, attendees
};

