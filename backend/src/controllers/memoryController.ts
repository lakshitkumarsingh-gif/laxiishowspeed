import express, { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import logger from '../utils/logger';

const prisma = new PrismaClient();

interface AuthRequest extends Request {
  user?: any;
}

// Get user memories
export const getMemories = async (req: AuthRequest, res: Response) => {
  try {
    const memories = await prisma.memory.findMany({
      where: { userId: req.user.userId },
      orderBy: { importance: 'desc' }
    });

    res.json({
      memories,
      total: memories.length
    });
  } catch (error) {
    logger.error('Get memories error:', error);
    res.status(500).json({ error: 'Failed to get memories' });
  }
};

// Create memory
export const createMemory = async (req: AuthRequest, res: Response) => {
  try {
    const { type, content, importance } = req.body;

    if (!type || !content) {
      return res.status(400).json({ error: 'Type and content are required' });
    }

    const memory = await prisma.memory.create({
      data: {
        userId: req.user.userId,
        type,
        content,
        importance: importance || 5
      }
    });

    res.status(201).json(memory);
  } catch (error) {
    logger.error('Create memory error:', error);
    res.status(500).json({ error: 'Failed to create memory' });
  }
};

// Update memory
export const updateMemory = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { type, content, importance } = req.body;

    // Verify ownership
    const memory = await prisma.memory.findUnique({ where: { id } });
    if (!memory || memory.userId !== req.user.userId) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const updated = await prisma.memory.update({
      where: { id },
      data: {
        type: type || memory.type,
        content: content || memory.content,
        importance: importance !== undefined ? importance : memory.importance
      }
    });

    res.json(updated);
  } catch (error) {
    logger.error('Update memory error:', error);
    res.status(500).json({ error: 'Failed to update memory' });
  }
};

// Delete memory
export const deleteMemory = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    // Verify ownership
    const memory = await prisma.memory.findUnique({ where: { id } });
    if (!memory || memory.userId !== req.user.userId) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    await prisma.memory.delete({ where: { id } });

    res.json({ success: true, message: 'Memory deleted' });
  } catch (error) {
    logger.error('Delete memory error:', error);
    res.status(500).json({ error: 'Failed to delete memory' });
  }
};
