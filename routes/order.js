import express from 'express';
const router = express.Router();
import helper from '../utils/helpers.js'; 
import order from '../controllers/order.js';

router.post('/', helper.verifyAuthToken , order.store);
router.get('/:_id',helper.verifyAuthToken,order.show);


// dsd
export default router;