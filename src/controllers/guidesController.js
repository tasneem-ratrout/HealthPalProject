import { pool } from '../db.js';

const getGuides = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM health_guides ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getGuideById = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM health_guides WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Guide not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const createGuide = async (req, res) => {
  const { title, content, category, lang } = req.body;
  const userId = req.user.id;

  if (!title || !content)
    return res.status(400).json({ error: 'Title and content required' });

  try {
    const [result] = await pool.query(
      'INSERT INTO health_guides (title, content, category, lang, author_id) VALUES (?, ?, ?, ?, ?)',
      [title, content, category, lang, userId]
    );
    res.status(201).json({ message: 'Guide created', id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const updateGuide = async (req, res) => {
  const { title, content, category, lang } = req.body;
  try {
    await pool.query(
      'UPDATE health_guides SET title=?, content=?, category=?, lang=? WHERE id=?',
      [title, content, category, lang, req.params.id]
    );
    res.json({ message: 'Guide updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}; // ✅ أغلقي الدالة هنا

const deleteGuide = async (req, res) => {
  try {
    await pool.query('DELETE FROM health_guides WHERE id=?', [req.params.id]);
    res.json({ message: 'Guide deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export { getGuides, getGuideById, createGuide, updateGuide, deleteGuide };
