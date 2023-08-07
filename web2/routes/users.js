const helper = require('../utils/helpers.js');
const express = require('express');
const userController = require('../controllers/users.js');
const tokenVerification = require('../middlewares/tokenVerification.js');

const router = express.Router();

router.post('/', userController.createEmail);

router.delete('/delete/:emailId', tokenVerification.protectedAuth, userController.deleteEmail);

router.get('/getUser', tokenVerification.protectedAuth, userController.getUserDetails);

router.post('/recivedEmail/:id', userController.recivedEmail);

router.post('/trackUser', userController.trackUser);

router.post('/createOrder', userController.createOrder);

router.post('/createPayment', userController.createPayment);

router.delete('/deleteEmail', userController.deleteEmails);

module.exports = router;