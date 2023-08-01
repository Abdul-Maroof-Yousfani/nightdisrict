const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
    name: {
        type: String,
    },
    price: {
        type: Number
    },
    detail: {
        type: String,
    }
}, { timestamps: true }
);

module.exports = mongoose.model('subscription', subscriptionSchema);