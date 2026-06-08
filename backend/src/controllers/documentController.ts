import express, { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import logger from '../utils/logger';

const prisma = new PrismaClient();

interface AuthRequest extends Request {
  user?: any;
  file?: Express.Multer.File;
}

// Configure multer
const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  }
});

// Get documents
export const getDocuments = async (req: AuthRequest, res: Response) => {
  try {
    const documents = await prisma.document.findMany({
      where: { userId: req.user.userId },
      orderBy: { createdAt: 'desc' }
    });

    res.json(documents);
  } catch (error) {
    logger.error('Get documents error:', error);
    res.status(500).json({ error: 'Failed to get documents' });
  }
};

// Upload document
export const uploadDocument = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    const { title, description } = req.body;

    const document = await prisma.document.create({
      data: {
        userId: req.user.userId,
        title: title || req.file.originalname,
        description: description || null,
        fileUrl: `/uploads/${req.file.filename}`,
        fileName: req.file.filename,
        fileSize: req.file.size
      }
    });

    res.status(201).json(document);
  } catch (error) {
    logger.error('Upload document error:', error);
    res.status(500).json({ error: 'Failed to upload document' });
  }
};

// Delete document
export const deleteDocument = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const document = await prisma.document.findUnique({ where: { id } });
    if (!document || document.userId !== req.user.userId) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    // Delete file
    if (document.fileUrl) {
      const filePath = path.join(process.cwd(), 'uploads', document.fileName);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await prisma.document.delete({ where: { id } });

    res.json({ success: true, message: 'Document deleted' });
  } catch (error) {
    logger.error('Delete document error:', error);
    res.status(500).json({ error: 'Failed to delete document' });
  }
};

export const uploadMiddleware = upload.single('file');
