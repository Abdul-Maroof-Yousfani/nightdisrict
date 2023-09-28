import express from 'express';
const router = express.Router();
import notification from '../controllers/notification.js';

router.get('/',notification.testNotification);

export default router;