import express from 'express';
import { getSettings, updateSettings } from '../controllers/settingsController';
import { verifyJWT } from '../controllers/authController';

const router = express.Router();

router.use(verifyJWT);

router.get('/', getSettings);
router.put('/', updateSettings);

export default router;
