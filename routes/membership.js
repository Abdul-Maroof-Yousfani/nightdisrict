import express from 'express';
const router = express.Router();
import membership from '../controllers/membership.js';
import helper from '../utils/helpers.js'; 

router.post('/', membership.createMembership);
router.get('/', helper.verifyAuthToken, membership.index);
router.get('/users', helper.verifyAuthToken, membership.userMembership);



export default router;