import mongoose, { Mongoose } from 'mongoose';

const webhookLog = new mongoose.Schema(
    {
        decodedPayload : {
            type : Mixed,
            default : null
        },
        decodedHeader : {
            type : Mixed,
            default : null
        },
        signature : {
            type : Mixed,
            default : null
        },
        err : {
            type : Mixed,
            default : null
        },
    },
    {
        timestamps :true
    }
);
export default mongoose.model('webhook', webhookLog);
