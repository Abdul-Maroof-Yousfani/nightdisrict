import mongoose, { Mongoose } from 'mongoose';

const webhooks = new mongoose.Schema(
    {
        notificationHeader:{
            type : String,
            default :""
        },
        notificationPayload:{
            type : String,
            default : ""
        },
        notificationCertificate : {
            type : String,
            default : ""
        },
    },
    {
        timestamps :true
    }
);
export default mongoose.model('webhooks', webhooks);
