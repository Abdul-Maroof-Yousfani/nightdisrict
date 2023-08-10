import mongoose, { mongo } from 'mongoose';

const ticket = new mongoose.Schema({
    event: {
        type: mongoose.Types.ObjectId,
        ref : 'evemts',
        default : null
    },
    user: {
        type: mongoose.Types.ObjectId,
        ref : 'users',
        default : null
    },
    qrcode : {
       type : String,
       default : ""
    },
    order : {
        type: mongoose.Types.ObjectId,
        ref : 'orders',
        default : null
    },
    price : {
        type : Number,
        default : 0
    }
},{timestamps:true});
export default mongoose.model('ticket', ticket);
