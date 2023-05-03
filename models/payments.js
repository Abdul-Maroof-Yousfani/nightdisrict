import mongoose from 'mongoose';

const payment = new mongoose.Schema({
    order: {
        type: mongoose.Types.ObjectId,
        ref:"orders",
        default:""
    },
    transactionId : {
        type:String,
        default:""
    },
    userId:
    {
        type: mongoose.Types.ObjectId,
        ref:"users"
    },
    amountPaid : {
        type:Number,
        default:0
    },
    paymentStatus:{
        type:String,
        default:"process"
    },
    paymentMethod:{
        type:String,
        default:"stripe"
    },
    invoiceUrl:{
        type:String,
        default:"stripe"
    }

},{timestamps:true});
export default mongoose.model('payments', payment);
