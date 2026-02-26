import express from 'express';
import { verifyAuth } from '../controllers/auth.controller';

const router = express.Router();

router.get('/:companycode/verify', verifyAuth);

export default router;
