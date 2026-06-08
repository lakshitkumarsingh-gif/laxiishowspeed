import express, { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import logger from '../utils/logger';

const prisma = new PrismaClient();

interface AuthRequest extends Request {
  user?: any;
}

// Get settings
export const getSettings = async (req: AuthRequest, res: Response) => {
  try {
    const settings = await prisma.settings.findUnique({
      where: { userId: req.user.userId }
    });

    if (!settings) {
      return res.status(404).json({ error: 'Settings not found' });
    }

    res.json(settings);
  } catch (error) {
    logger.error('Get settings error:', error);
    res.status(500).json({ error: 'Failed to get settings' });
  }
};

// Update settings
export const updateSettings = async (req: AuthRequest, res: Response) => {
  try {
    const {
      theme,
      preferredModel,
      learningLevel,
      notificationsEnabled,
      soundEnabled
    } = req.body;

    const settings = await prisma.settings.update({
      where: { userId: req.user.userId },
      data: {
        theme: theme || undefined,
        preferredModel: preferredModel || undefined,
        learningLevel: learningLevel || undefined,
        notificationsEnabled: notificationsEnabled !== undefined ? notificationsEnabled : undefined,
        soundEnabled: soundEnabled !== undefined ? soundEnabled : undefined
      }
    });

    // Also update user theme/model for quick access
    if (theme || preferredModel) {
      await prisma.user.update({
        where: { id: req.user.userId },
        data: {
          theme: theme || undefined,
          preferredModel: preferredModel || undefined
        }
      });
    }

    res.json(settings);
  } catch (error) {
    logger.error('Update settings error:', error);
    res.status(500).json({ error: 'Failed to update settings' });
  }
};
