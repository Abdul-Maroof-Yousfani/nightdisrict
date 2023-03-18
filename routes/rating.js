import express from 'express';
const router = express.Router();
import rating from '../controllers/rating.js';

router.post('/', rating.store);



export default router;