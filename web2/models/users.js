const mongoose = require('mongoose');

const usersSchema = new mongoose.Schema({
    deviceId: {
        type: String,
        required: true,
        unique: true
    },
    fcmToken: {
        type: String
    },
    email: {
        type: String,
        unique: true
    },
    password: {
        type: String,
    },
    Premium: {
        type : Boolean,
        default: false
    },
    subscriptionId : {
        default : "",
    },
    expireAt : {
        default: ""
    },
    paymentStatus : {
        type: String,
        default: "unpaid"
    }
}, {timestamps: true}
);

module.exports = mongoose.model('users', usersSchema);