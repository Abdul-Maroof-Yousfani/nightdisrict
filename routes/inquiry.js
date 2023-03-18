import express from 'express';
import barInquiries from '../controllers/inquiries.js';
const router = express.Router();


router.post("/",barInquiries.store);



export default router;
