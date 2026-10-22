import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { query } from '../db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-taskboard-key-change-in-production-2026';

export async function signup(req, res) {
  try {
    const { name, email, password } = req.body;

    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({ error: 'Name is required' });
    }

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return res.status(400).json({ error: 'A valid email address is required' });
    }

    if (!password || typeof password !== 'string' || password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters long' });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Check if user exists
    const existing = await query('SELECT id FROM users WHERE email = ?', [cleanEmail]);
    if (existing && existing.length > 0) {
      return res.status(400).json({ error: 'An account with this email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = crypto.randomUUID();
    const cleanName = name.trim();

    await query(
      'INSERT INTO users (id, name, email, password) VALUES (?, ?, ?, ?)',
      [userId, cleanName, cleanEmail, hashedPassword]
    );

    const token = jwt.sign(
      { id: userId, email: cleanEmail, name: cleanName },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(201).json({
      message: 'Account created successfully',
      token,
      user: {
        id: userId,
        name: cleanName,
        email: cleanEmail
      }
    });
  } catch (err) {
    console.error('Signup error:', err);
    return res.status(500).json({ error: 'Internal server error during registration' });
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    const cleanEmail = email.trim().toLowerCase();

    const users = await query('SELECT * FROM users WHERE email = ?', [cleanEmail]);
    if (!users || users.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const user = users[0];
    const passwordValid = await bcrypt.compare(password, user.password);
    if (!passwordValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.json({
      message: 'Logged in successfully',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Internal server error during login' });
  }
}

export async function getMe(req, res) {
  try {
    const users = await query('SELECT id, name, email, created_at FROM users WHERE id = ?', [req.user.id]);
    if (!users || users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    return res.json({ user: users[0] });
  } catch (err) {
    console.error('GetMe error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
