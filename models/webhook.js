import mongoose, { Mongoose } from 'mongoose';

const webhookLog = new mongoose.Schema(
    {
        decodedPayload : {
            type : String,
            default : null
        },
        decodedHeader : {
            type : String,
            default : null
        },
        signature : {
            type : String,
            default : null
        },
        err : {
            type : String,
            default : null
        },
    },
    {
        timestamps :true
    }
);
export default mongoose.model('webhook', webhookLog);
