const mongoose = require('mongoose');
const orderSchema = new mongoose.Schema({
    paymentType: {
        type: String,
        default: ""
    },
    orderNo: {
        type: String,
        default: ""
    },
    items: [
        {
            item: {
                type: mongoose.Schema.Types.ObjectId,
                default: null
            },
            price: {
                type: Number,
                default: 0
            }
        }
    ],
    userId: {
        type: mongoose.Schema.Types.ObjectId,
    },
    cardId: {
        type: mongoose.Schema.Types.ObjectId,
        default: null
    }

}, { timestamps: true })

module.exports = mongoose.model("orders", orderSchema)