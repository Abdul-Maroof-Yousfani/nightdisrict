import express from 'express';
import helpers from '../utils/helpers.js';
import bouncer from '../controllers/bouncer.js';

const router = express.Router();

router.post('/attendance',helpers.verifyAuthToken,bouncer.attendance);
router.get('/attendance',helpers.verifyAuthToken,bouncer.tickets);
router.post('/forget',helpers.verifyAuthToken,bouncer.forget);



export default router;
