import bcrypt from 'bcrypt';
import { pool } from '../db.js';
import jwt from 'jsonwebtoken';
import validator from 'validator';

// ===============================
// Register (only patients can self-register)
// ===============================
export async function register(req, res) {
  try {
    const { name, email, password, role = 'patient', specialty_id } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required.' });
    }

  
    if (name.length < 3) {
      return res.status(400).json({ error: 'Name must be at least 3 characters long.' });
    }

  
    if (!validator.isEmail(email)) {
      return res.status(400).json({ error: 'Invalid email format.' });
    }

    const strongPassword = validator.isStrongPassword(password, {
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1
    });

    if (!strongPassword) {
      return res.status(400).json({
        error:
          'Password must be at least 8 characters long and include uppercase, lowercase, number, and special symbol.'
      });
    }


    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(409).json({ error: 'This email is already registered. Please log in instead.' });
    }

    if (role !== 'patient') {
      return res.status(403).json({
        error: 'Only patients can self-register. Accounts for doctors, donors, and NGOs must be created by an admin.'
      });
    }

    const password_hash = await bcrypt.hash(password, 10);

    const [result] = await pool.query(
      'INSERT INTO users (name, email, password_hash, role, specialty_id) VALUES (?, ?, ?, ?, ?)',
      [name, email, password_hash, 'patient', null]
    );

    res.status(201).json({
      success: true,
      message: `Welcome ${name}! Your patient account has been created successfully.`,
      user: {
        id: result.insertId,
        name,
        email,
        role: 'patient'
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: 'Server error occurred while registering.',
      details: err.message
    });
  }
}

// ===============================
// Login
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

    if (!rows.length) return res.status(401).json({ error: 'Invalid email or password' });

    const user = rows[0];
    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(401).json({ error: 'Invalid email or password' });

    const token = jwt.sign(
      { id: user.id, role: user.role, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES || '7d' }
    );

    res.json({
      message: ` Welcome back, ${user.name}! You are logged in as ${user.role}.`,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error during login.' });
  }
}

// ===============================
// Personal Account Info
// ===============================
export async function me(req, res) {
  try {
    const [rows] = await pool.query(
      'SELECT id, role, name, email, specialty_id, created_at FROM users WHERE id = ? LIMIT 1',
      [req.user.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'User not found' });

    const profile = rows[0];
    profile.created_at = new Date(profile.created_at).toLocaleString('en-US');

    res.json({
      message: `Welcome ${profile.name}, here is your profile information.`,
      profile
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error while retrieving profile data.' });
  }
}
