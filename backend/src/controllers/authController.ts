import express, { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import axios from 'axios';
import logger from '../utils/logger';

const prisma = new PrismaClient();

interface GoogleTokenPayload {
  iss: string;
  azp: string;
  aud: string;
  sub: string;
  email: string;
  email_verified: boolean;
  at_hash: string;
  iat: number;
  exp: number;
  picture?: string;
  name?: string;
}

interface AuthRequest extends Request {
  user?: any;
  token?: string;
}

// Verify Google ID Token
export const verifyGoogleToken = async (token: string): Promise<GoogleTokenPayload> => {
  try {
    const response = await axios.get(
      `https://oauth2.googleapis.com/tokeninfo?id_token=${token}`
    );
    return response.data;
  } catch (error) {
    logger.error('Google token verification failed:', error);
    throw new Error('Invalid Google token');
  }
};

// Sign JWT
export const signJWT = (userId: string): string => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// Verify JWT Middleware
export const verifyJWT = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.split(' ')[1] || req.cookies.token;
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'your-secret-key'
    ) as any;
    
    req.user = decoded;
    req.token = token;
    next();
  } catch (error) {
    logger.error('JWT verification failed:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Google OAuth Callback
export const googleAuthCallback = async (req: AuthRequest, res: Response) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ error: 'No token provided' });
    }

    // Verify Google token
    const googlePayload = await verifyGoogleToken(token);

    // Find or create user
    let user = await prisma.user.findUnique({
      where: { email: googlePayload.email }
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: googlePayload.email,
          name: googlePayload.name,
          image: googlePayload.picture,
          googleId: googlePayload.sub,
          theme: 'light',
          preferredModel: 'claude',
          settings: {
            create: {
              theme: 'light',
              preferredModel: 'claude',
              learningLevel: 'Beginner'
            }
          }
        },
        include: { settings: true }
      });
    }

    // Create JWT
    const jwtToken = signJWT(user.id);

    res.json({
      success: true,
      token: jwtToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        image: user.image,
        theme: user.theme,
        preferredModel: user.preferredModel
      }
    });
  } catch (error) {
    logger.error('Google auth callback error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
};

// Logout
export const logout = (req: AuthRequest, res: Response) => {
  res.clearCookie('token');
  res.json({ success: true, message: 'Logged out successfully' });
};

// Get current user
export const getCurrentUser = async (req: AuthRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      include: { settings: true }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      id: user.id,
      email: user.email,
      name: user.name,
      image: user.image,
      theme: user.theme,
      preferredModel: user.preferredModel,
      learningLevel: user.learningLevel,
      settings: user.settings
    });
  } catch (error) {
    logger.error('Get current user error:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
};
