import express from 'express';
const router = express.Router();
import teamMember from '../controllers/teammember.js';
import helpers from '../utils/helpers.js';

router.post('/', helpers.verifyAuthToken, teamMember.store);
router.delete('/remove', helpers.verifyAuthToken, teamMember.remove);
router.get('/:_id', teamMember.index);

export default router;