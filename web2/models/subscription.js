const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
    name: {
        type: String,
    },
    price : {
        type: Number
    },
    detail: {
        type: String,
    }
});

module.exports = mongoose.model('subscription', subscriptionSchema);