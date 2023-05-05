import express, { Router } from 'express';
import bartender from '../controllers/bartender/bartender.js';
import helpers from '../utils/helpers.js';

const router = express.Router();

router.get('/orders',helpers.verifyAuthToken,bartender.orders);
router.post('/orders',helpers.verifyAuthToken,bartender.prepare);
router.put('/status',helpers.verifyAuthToken,bartender.updateStatus);


export default router;
