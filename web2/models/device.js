const mongoose = require('mongoose');

const deviceSchema = new mongoose.Schema({
    deviceId: {
        type: String,
    },
    expireAt: {
        type: Date
    },
    premium: {
        type : Boolean,
        default: false
    },
}, { timestamps: true }
);

module.exports = mongoose.model('device', deviceSchema);