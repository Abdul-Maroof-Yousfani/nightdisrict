import mongoose, { Mongoose } from 'mongoose';

const attendance = new mongoose.Schema({
    event : {
        type : String,
        default : ""
    },
    order : {
        type : mongoose.Types.ObjectId,
        ref : "orders"
    },
    bar : {
        type : mongoose.Types.ObjectId,
        ref  :"bars"
    },
    customer : {
        type : mongoose.Types.ObjectId,
        ref : "users"
    },
    bouncer : {
        type  : mongoose.Types.ObjectId,
        ref : "users"
    }


},
{
    timestamps :true
});
export default mongoose.model('attendance', attendance);
