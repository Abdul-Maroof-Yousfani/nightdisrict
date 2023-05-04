import express, { Router } from 'express';
import bartender from '../controllers/bartender/bartender.js';

const router = express.Router();

router.get('/orders',bartender.orders);


export default router;
