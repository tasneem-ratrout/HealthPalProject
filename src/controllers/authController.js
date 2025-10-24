import bcrypt from 'bcrypt';
import { pool } from '../db.js';
import jwt from 'jsonwebtoken';

// ===============================
// Register
// ===============================
export async function register(req, res) {
  try {
    const { name, email, password, role = 'patient', specialty_id } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(409).json({ error: 'Email already registered' });
    }


    const password_hash = await bcrypt.hash(password, 10);
 
    if (role === 'doctor' && !specialty_id) {
      return res.status(400).json({ error: 'Doctor must have a specialty_id' });
    }


    const [result] = await pool.query(
      'INSERT INTO users (name, email, password_hash, role, specialty_id) VALUES (?, ?, ?, ?, ?)',
      [name, email, password_hash, role, specialty_id || null]
    );

    
    res.status(201).json({
      message: 'User registered successfully',
      user: { id: result.insertId, name, email, role, specialty_id: specialty_id || null }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
}


// ===============================
//login
// ===============================
export async function login(req, res) {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const [rows] = await pool.query(
      'SELECT id, name, email, role, password_hash FROM users WHERE email = ? LIMIT 1',
      [email]
    );
    if (!rows.length) return res.status(401).json({ error: 'Invalid credentials' });

    const user = rows[0];
    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign(
      { id: user.id, role: user.role, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES || '7d' }
    );

    res.json({
      message: 'Logged in',
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
}

// ===============================
//personal account
// ===============================
export async function me(req, res) {
  try {
    const [rows] = await pool.query(
      'SELECT id, role, name, email, specialty_id, created_at FROM users WHERE id = ? LIMIT 1',
      [req.user.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'User not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
}
  

