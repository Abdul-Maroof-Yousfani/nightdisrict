import express, { Router } from 'express';
import bartender from '../controllers/bartender/bartender.js';
import helpers from '../utils/helpers.js';
import report from '../controllers/report.js';

const router = express.Router();

router.get('/orders',helpers.verifyAuthToken,bartender.orders);
router.post('/orders',helpers.verifyAuthToken,bartender.prepare);
router.put('/status',helpers.verifyAuthToken,bartender.updateStatus);
router.get('/tips',helpers.verifyAuthToken,bartender.tips);



// Report an Order

router.post('/report/order',helpers.verifyAuthToken,report.store);


export default router;
