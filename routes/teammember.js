import express from 'express';
const router = express.Router();
import teamMember from '../controllers/teammember.js';

router.post('/', teamMember.store);

export default router;