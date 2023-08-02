const mongoose = require('mongoose');
const orderSchema = new mongoose.Schema({
    orderNo: {
        type: String,
        default: ""
    },
    item: {
        type: mongoose.Schema.Types.ObjectId,
        default: null
    },
    deviceId: {
        type: String,
    }
}, { timestamps: true })

module.exports = mongoose.model("orders", orderSchema)