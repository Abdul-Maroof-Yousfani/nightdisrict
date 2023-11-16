const helper = require('../utils/helpers.js');
const express = require('express');
const userController = require('../controllers/users.js');
const tokenVerification = require('../middlewares/tokenVerification.js');

const router = express.Router();

router.post('/', userController.createEmail);

router.delete('/delete/:emailId', userController.deleteEmail);

router.get('/getUser', tokenVerification.protectedAuth, userController.getUserDetails);
router.get('/cronjob',userController.cronJob);
router.get('/delete-emails',userController.cronDeleteEmail);



router.post('/recivedEmail/:id', userController.recivedEmail);
router.get('/:id', userController.getEmailById);

router.post('/trackUser', userController.trackUser);

router.post('/createOrder', userController.createOrder);

router.post('/createPayment', userController.createPayment);

router.delete('/deleteEmail', userController.deleteEmails);

router.post('/recivedEmail', userController.recivedEmailDuplicate);

router.post('/creteAndDeleteEmails', userController.creteAndDeleteEmails);

router.put('/updateStatus', userController.updateReadStatus)


// router.get('/cronjob',userController.cronJob)

module.exports = router;