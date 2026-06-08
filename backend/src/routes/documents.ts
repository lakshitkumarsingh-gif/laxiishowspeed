import express from 'express';
import {
  getDocuments,
  uploadDocument,
  deleteDocument,
  uploadMiddleware
} from '../controllers/documentController';
import { verifyJWT } from '../controllers/authController';

const router = express.Router();

router.use(verifyJWT);

router.get('/', getDocuments);
router.post('/upload', uploadMiddleware, uploadDocument);
router.delete('/:id', deleteDocument);

export default router;
