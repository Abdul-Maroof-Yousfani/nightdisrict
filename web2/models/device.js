const mongoose = require('mongoose');

const deviceSchema = new mongoose.Schema({
    deviceId: {
        type: String,
        unique: true
    },
    expireAt: {
        type: Date,
        default: new Date
    },
    emailID: {
        type: mongoose.Schema.Types.ObjectId,
    },
    premium: {
        type: Boolean,
        default: false
    },
    paymentStatus: {
        type: String,
        default: "unpaid"
    },
    mailBox: [
        {
            email: String,
        }
    ],
}, { timestamps: true }
);

module.exports = mongoose.model('device', deviceSchema);