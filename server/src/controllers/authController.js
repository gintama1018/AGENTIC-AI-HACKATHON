import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { getDb, saveDb } from '../config/db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'returnshield-secret-key-2026';

export const signup = async (req, res) => {
  try {
    const { name, email, password, company_name } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const db = getDb();
    const existing = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      return res.status(400).json({ message: 'An account with this email already exists' });
    }

    const password_hash = bcrypt.hashSync(password, 10);
    const newUser = {
      _id: uuidv4(),
      name: name || 'Operations Lead',
      email: email.toLowerCase(),
      password_hash,
      company_name: company_name || 'E-Commerce Store',
      role: 'Operations Lead',
      created_at: new Date().toISOString()
    };

    db.users.push(newUser);
    saveDb();

    const token = jwt.sign({ userId: newUser._id, email: newUser.email }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      token,
      user: {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        company_name: newUser.company_name,
        role: newUser.role
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const db = getDb();

    // If demo login button clicked with no explicit credentials
    if (!email && !password) {
      const demoUser = db.users[0] || {
        _id: 'user_demo_001',
        name: 'Sarah Jenkins',
        email: 'sarah@aurorafashion.com',
        company_name: 'Aurora Apparel & Goods',
        role: 'Operations Director'
      };
      const token = jwt.sign({ userId: demoUser._id, email: demoUser.email }, JWT_SECRET, { expiresIn: '7d' });
      return res.json({
        token,
        user: {
          _id: demoUser._id,
          name: demoUser.name,
          email: demoUser.email,
          company_name: demoUser.company_name,
          role: demoUser.role
        }
      });
    }

    const user = db.users.find(u => u.email.toLowerCase() === (email || '').toLowerCase());
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = bcrypt.compareSync(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = jwt.sign({ userId: user._id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        company_name: user.company_name,
        role: user.role
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getCurrentUser = async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Not authenticated' });
  }

  res.json({
    user: {
      _id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      company_name: req.user.company_name,
      role: req.user.role
    }
  });
};
