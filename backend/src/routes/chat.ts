import express from 'express';
import {
  getConversations,
  createConversation,
  getConversation,
  sendMessage,
  deleteConversation
} from '../controllers/chatController';
import { verifyJWT } from '../controllers/authController';

const router = express.Router();

router.use(verifyJWT);

router.get('/', getConversations);
router.post('/', createConversation);
router.get('/:id', getConversation);
router.post('/:id/messages', sendMessage);
router.delete('/:id', deleteConversation);

export default router;
