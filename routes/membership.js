import express from 'express';
const router = express.Router();
import membership from '../controllers/membership.js';

router.post('/', membership.createMembership);
router.get('/', membership.index);



export default router;