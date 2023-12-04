import express from 'express';
const router = express.Router();
import membership from '../controllers/membership.js';
import helper from '../utils/helpers.js'; 
import admin from '../middlewares/admin.js';

router.put('/:id', [helper.verifyAuthToken, helper.verifyAdminAuthToken ], membership.updateMembership);
router.post('/', membership.createMembership);
router.get('/', helper.verifyAuthToken, membership.index);
router.get('/users', helper.verifyAuthToken, membership.userMembership);
router.delete('/deleteMembership/:id', helper.verifyAuthToken, membership.deleteMembership);
export default router;