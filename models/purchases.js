import mongoose from 'mongoose';

const purchases = new mongoose.Schema({
    originalTransactionId: {
        type: String,
        default : ''
    },
    transactionId:{
        type : String,
        default : ""
    },
    productId: {
        type : String,
        default : ""
    },
   
    userid : {
        type :mongoose.Types.ObjectId,
        ref : 'users'
        
    },
    type : {
        type :String,
        default : ''
    },
    date:{
        type: Date,
        default : Date.now()
    },
    platform : {
        type : String,
        default : "IOS"
    }
    
},{timestamps:true});

export default mongoose.model('purchases', purchases);
