import mongoose, { Mongoose } from 'mongoose';

const webhookLog = new mongoose.Schema(
    {
        notificationType:{
            type : String,
            default :""
        },
        notificationUUID:{
            type : String,
            default : ""
        },
        data : {
            type : String,
            default : ""
        },
        appAppleId:{
            type : String,
            default : ""
        },
        signedTransactionInfo:{
            type : String,
            default : ""
        },
        signedRenewalInfo: {
            type : String,
            default : ""
        },
        status : {
            type : String,
            default : ""
        },
        // decodedPayload : {
        //     type : String,
        //     default : null
        // },
        // decodedHeader : {
        //     type : String,
        //     default : null
        // },
        // signature : {
        //     type : String,
        //     default : null
        // },
        // err : {
        //     type : String,
        //     default : null
        // },
    },
    {
        timestamps :true
    }
);
export default mongoose.model('webhook', webhookLog);
