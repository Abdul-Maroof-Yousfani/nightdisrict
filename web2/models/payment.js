const mongoose = require('mongoose');

const payment = new mongoose.Schema({
    order: {
        type: mongoose.Types.ObjectId,
        default:""
    },
    transactionId : {
        type:String,
        default:""
    },
    userId:
    {
        type: mongoose.Types.ObjectId,
    },
    amountPaid : {
        type:Number,
        default:0
    },
    paymentStatus:{
        type:String,
        default:"process"
    }

},{timestamps:true});
module.exports = mongoose.model('payments', payment);
