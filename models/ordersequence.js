import mongoose, { Mongoose } from "mongoose";
const ordersequence= new mongoose.Schema({
    bar: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'bars',
    },
    sequence: {
        type: Number,
        default: 1,
    },
    delivered: {
        type: Boolean,
        default: false,
    },
    orderId: {
        type: mongoose.Schema.Types.ObjectId, // Add order ID reference
        ref: 'orders', // Reference the orders collection
    },
    
},{timestamps:true})


export default mongoose.model("ordersequence", ordersequence)