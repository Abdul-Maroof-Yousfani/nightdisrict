import express from 'express';
const router = express.Router();
import teamMember from '../controllers/teammember.js';

router.post('/', teamMember.store);
router.get('/:_id', teamMember.index);

export default router;