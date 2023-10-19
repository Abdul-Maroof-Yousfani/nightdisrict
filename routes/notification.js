import express from 'express';
const router = express.Router();
import notification from '../controllers/notification.js';
import helpers from '../utils/helpers.js';

// router.get('/',notification.testNotification);
router.post('/',notification.store);
router.get('/',notification.all);

export default router;