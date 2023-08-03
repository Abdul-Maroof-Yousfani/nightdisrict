import mongoose, { Mongoose } from 'mongoose';

const inAppSchema = new mongoose.Schema({
    productid: {
        type: String,
        default : ''
    },
    project_id : {
        type : String,
        default : ""
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
    },
    title : {
        type :String,
        default : ""
    },
    description : {
        type : String,
        default : ""
    },
    isVerify : {
        type : Boolean,
        default : false
    },
    price : {
        type : Number,
        default : 0
    },
    orderid : {
        type : String,
        default : ""
    }
    
},
{
    timestamps :true
});
export default mongoose.model('inApp', inAppSchema);
