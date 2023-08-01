const mongoose = require('mongoose');

const deviceSchema = new mongoose.Schema({
    deviceId: {
        type: String,
    }
}, { timestamps: true }
);

module.exports = mongoose.model('device', deviceSchema);