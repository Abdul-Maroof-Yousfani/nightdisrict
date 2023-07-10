import mongoose, { Mongoose } from 'mongoose';

const inAppSchema = new mongoose.Schema({
    productid: {
        type: String,
        default : ''
    },
    purchaseToken: {
        type: String,
        default : ''
    },
    fcm: {
        type: String,
        default : ""
    },
    developerPayload : {
        type : String,
        default : ""
    },
    isAcknowledged : {
        type : Boolean,
        default : false
    },
    isConfirm : {
        type : Boolean,
        default : false
    },
    updated:{
        type : Date
    },
    packageName:{
        type : String,
        default : ""
    }
    
},
{
    timestamps :true
});
export default mongoose.model('inApp', inAppSchema);
