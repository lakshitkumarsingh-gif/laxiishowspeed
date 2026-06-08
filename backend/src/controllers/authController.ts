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
  at_hash?: string;
  iat: number;
  exp: number;
  picture?: string;
  name?: string;
  given_name?: string;
  family_name?: string;
}

interface AuthRequest extends Request {
  user?: any;
  token?: string;
}

// Verify Google ID Token
export const verifyGoogleToken = async (token: string): Promise<GoogleTokenPayload> => {
  try {
    const response = await axios.get(
      `https://oauth2.googleapis.com/tokeninfo?id_token=${token}`,
      { timeout: 5000 }
    );
    
    if (response.data.email_verified === false) {
      throw new Error('Email not verified');
    }
    
    return response.data as GoogleTokenPayload;
  } catch (error: any) {
    logger.error('Google token verification failed:', error.message);
    throw new Error('Invalid or expired Google token');
  }
};

// Sign JWT
export const signJWT = (userId: string): string => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET || 'your-secret-key-change-in-production',
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// Verify JWT Middleware
export const verifyJWT = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ') 
      ? authHeader.slice(7) 
      : req.cookies.token;
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'your-secret-key-change-in-production'
    ) as any;
    
    req.user = decoded;
    req.token = token;
    next();
  } catch (error: any) {
    logger.error('JWT verification failed:', error.message);
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};

// Google OAuth Callback
export const googleAuthCallback = async (req: AuthRequest, res: Response) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ error: 'No token provided' });
    }

    logger.info('Processing Google OAuth...');

    // Verify Google token
    const googlePayload = await verifyGoogleToken(token);
    logger.info(`Google auth successful for ${googlePayload.email}`);

    // Find or create user
    let user = await prisma.user.findUnique({
      where: { email: googlePayload.email }
    });

    if (!user) {
      logger.info(`Creating new user: ${googlePayload.email}`);
      user = await prisma.user.create({
        data: {
          email: googlePayload.email,
          name: googlePayload.name || `${googlePayload.given_name} ${googlePayload.family_name}`.trim(),
          image: googlePayload.picture,
          googleId: googlePayload.sub,
          theme: 'light',
          preferredModel: 'claude',
          learningLevel: 'Beginner',
          settings: {
            create: {
              theme: 'light',
              preferredModel: 'claude',
              learningLevel: 'Beginner',
              notificationsEnabled: true,
              soundEnabled: true
            }
          }
        },
        include: { settings: true }
      });
    } else {
      logger.info(`Existing user logged in: ${user.email}`);
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
        preferredModel: user.preferredModel,
        learningLevel: user.learningLevel
      }
    });
  } catch (error: any) {
    logger.error('Google auth callback error:', error.message);
    res.status(500).json({ error: error.message || 'Authentication failed' });
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
  } catch (error: any) {
    logger.error('Get current user error:', error.message);
    res.status(500).json({ error: 'Failed to get user' });
  }
};
