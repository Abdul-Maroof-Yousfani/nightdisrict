import express from 'express';
const router = express.Router();
import notification from '../controllers/notification.js';
import helpers from '../utils/helpers.js';


router.get('/bartender-logs',notification.bartenderLogs);
router.get('/test-notifications',notification.testNotification);
router.post('/',notification.store);
router.get('/',helpers.verifyAuthToken,notification.all);
router.get('/:_id',helpers.verifyAuthToken,notification.getSingleNotification);


router.post('/v2',notification.iosWebhook); //webhook for ios
router.post('/v2/new',notification.newWebhook); //webhook for ios
router.post('/android',notification.androidWebhook); //webhook fo android


router.post('/webhookData',notification.webhookData); //webhook fo android


// test bartender logs



export default router;