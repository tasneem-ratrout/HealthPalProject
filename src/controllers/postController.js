import { pool } from '../db.js';

/* =========================================================
إضافة منشور جديد (Admin Only)
========================================================= */
export async function addPost(req, res) {
  try {
    // التحقق من صلاحيات الأدمن
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Only admin can add posts' });
    }

    const { title, content, category } = req.body;

    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content are required' });
    }
const [result] = await pool.query(
  'INSERT INTO health_guides (title, content, category, author_id) VALUES (?, ?, ?, ?)',
  [title, content, category || null, req.user.id]
);


    res.status(201).json({
      message: '✅ Post created successfully',
      post: { id: result.insertId, title, content, category },
    });
  } catch (err) {
    console.error('Error creating post:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
}

/* =========================================================
    تعديل منشور (Admin Only)
========================================================= */
export async function updatePost(req, res) {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Only admin can update posts' });
    }

    const { id } = req.params;
    const { title, content, category } = req.body;

    const [existing] = await pool.query('SELECT * FROM health_guides WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const updatedTitle = title || existing[0].title;
    const updatedContent = content || existing[0].content;
    const updatedCategory = category || existing[0].category;

    await pool.query(
      `UPDATE health_guides 
       SET title = ?, content = ?, category = ? 
       WHERE id = ?`,
      [updatedTitle, updatedContent, updatedCategory, id]
    );

    res.json({
      message: '📝 Post updated successfully',
      updated_post: { id, title: updatedTitle, content: updatedContent, category: updatedCategory },
    });
  } catch (err) {
    console.error('Error updating post:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
}

/* =========================================================
حذف منشور (Admin Only)
========================================================= */
export async function deletePost(req, res) {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Only admin can delete posts' });
    }

    const { id } = req.params;
    const [existing] = await pool.query('SELECT id FROM health_guides WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Post not found' });
    }

    await pool.query('DELETE FROM health_guides WHERE id = ?', [id]);
    res.json({ message: '🗑️ Post deleted successfully', deleted_id: id });
  } catch (err) {
    console.error('Error deleting post:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
}

/* =========================================================
 عرض جميع المنشورات (لكل المستخدمين)
========================================================= */
export async function getAllPosts(req, res) {
  try {
    const { category } = req.query;

    let query = `SELECT id, title, content, category, created_at 
                 FROM health_guides WHERE 1=1`;
    const params = [];

    if (category) {
      query += ' AND category = ?';
      params.push(category);
    }

    query += ' ORDER BY created_at DESC';

    const [rows] = await pool.query(query, params);
    res.json({ total: rows.length, posts: rows });
  } catch (err) {
    console.error('Error fetching posts:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
}

/* =========================================================
 البحث عن منشور (عام)
========================================================= */
export async function searchPosts(req, res) {
  try {
    const query = req.query.query || req.query.title || req.query.text;

    if (!query) return res.status(400).json({ error: 'Search query is required' });

    const [rows] = await pool.query(
      `SELECT id, title, content, category, created_at 
       FROM health_guides 
       WHERE title LIKE ? OR content LIKE ?`,
      [`%${query}%`, `%${query}%`]
    );

    res.json({ total: rows.length, posts: rows });
  } catch (err) {
    console.error('Error searching posts:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
}
