import express from 'express';
const router = express.Router();
import notification from '../controllers/notification.js';
import helpers from '../utils/helpers.js';

router.get('/test-notifications',notification.testNotification);
router.post('/',notification.store);
router.get('/',helpers.verifyAuthToken,notification.all);

export default router;