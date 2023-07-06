import express from 'express';
import inApp from '../controllers/inApp.js';
const router = express.Router();


router.post("/acknowledge",inApp.acknowledge);
router.get("/confirm",inApp.confirm);



export default router;
