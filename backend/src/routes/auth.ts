import express from 'express';
import {
  googleAuthCallback,
  logout,
  getCurrentUser,
  verifyJWT
} from '../controllers/authController';

const router = express.Router();

router.post('/google', googleAuthCallback);
router.post('/logout', verifyJWT, logout);
router.get('/me', verifyJWT, getCurrentUser);

export default router;
