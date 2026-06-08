import express from 'express';
import {
  getMemories,
  createMemory,
  updateMemory,
  deleteMemory
} from '../controllers/memoryController';
import { verifyJWT } from '../controllers/authController';

const router = express.Router();

router.use(verifyJWT);

router.get('/', getMemories);
router.post('/', createMemory);
router.put('/:id', updateMemory);
router.delete('/:id', deleteMemory);

export default router;
