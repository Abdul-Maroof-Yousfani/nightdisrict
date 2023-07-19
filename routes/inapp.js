import express from 'express';
import inApp from '../controllers/inapp.js';
const router = express.Router();

// 



router.post("/acknowledge",inApp.acknowledge);
router.get("/confirm",inApp.confirm);
router.post("/view",inApp.view);
router.post("/serviceAccount",inApp.service);
router.get("/serviceAccount",inApp.listServiceAccounts);
router.get("/fcm",inApp.fcm);


export default router;
