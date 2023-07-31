const express = require('express');
const subscriptionController = require('../controllers/subscription.js');

const router = express.Router();

router.post('/', subscriptionController.createsubscription);

module.exports = router;