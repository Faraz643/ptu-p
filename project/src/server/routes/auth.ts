import { Router } from 'express';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import { db } from '../db';
import { validateRequest } from '../middleware/validateRequest';
import { randomUUID } from 'crypto';
import * as jose from 'jose';

const secret_key =  new TextEncoder().encode('secret')
const router = Router();
const client = new OAuth2Client(
  "772993112256-7h9249ganirq97a54e3t97ovja85lftt.apps.googleusercontent.com",
  "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"
);

const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

const googleAuthSchema = z.object({
  credential: z.string()
});

router.post('/google', validateRequest(googleAuthSchema), async (req, res) => {
  try {
    const { credential } = req.body;

    const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${credential}`,  // Use the access token here
      },
    });
    
    const userInfo = await userInfoResponse.json();
    if (!userInfo.email) {
      throw new Error('No email returned from Google');
    }

    const { email, name, picture, sub: googleId } = userInfo;

    let user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);

    if (!user) {
      const userId = randomUUID();
      db.prepare(`
        INSERT INTO users (id, email, name, google_id, picture)
        VALUES (?, ?, ?, ?, ?)
      `).run(userId, email, name, googleId, picture);

      user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
    }

    // const token = jwt.sign({ userId: user.email }, process.env.JWT_SECRET || 'secret',{ algorithm: 'HS256' }, {
    //   expiresIn: '7d'
    // });
    const payload = { userId: user.email }
    const token = await new jose.SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .sign(secret_key);

    res.json({
      success: true,
      token,
      name: user.name,
      email: user.email,
      picture: user.picture
    });
  } catch (error) {
    console.error('Google auth error:', error);
    res.status(401).json({
      success: false,
      message: 'Google authentication failed'
    });
  }
});

router.post('/register', validateRequest(registerSchema), async (req, res) => {
  try {
    const { email, password, name } = req.body;

    const existingUser = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    if (existingUser) {
      return res.status(400).json({ 
        success: false,
        message: 'An account with this email already exists' 
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = randomUUID();

    db.prepare(`
      INSERT INTO users (id, email, password, name)
      VALUES (?, ?, ?, ?)
    `).run(userId, email, hashedPassword, name);

    const token = jwt.sign({ userId }, process.env.JWT_SECRET || 'secret', {
      expiresIn: '7d'
    });

    res.json({
      success: true,
      message: 'Registration successful',
      token,
      name
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Registration failed. Please try again later.'
    });
  }
});

router.post('/login', validateRequest(loginSchema), async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    if (!user) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid email or password' 
      });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid email or password' 
      });
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET || 'secret', {
      expiresIn: '7d'
    });

    res.json({
      success: true,
      message: 'Login successful',
      token,
      name: user.name
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Login failed. Please try again later.'
    });
  }
});

export { router as authRouter };