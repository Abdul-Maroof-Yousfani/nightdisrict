import mongoose from 'mongoose';

const subscriptiontype = new mongoose.Schema({
    title: {
        type: String,
        default  : ""
    },
    code: {
        type: String,
        default  : ""
    },
    isActive : {
        type : Boolean,
        default : true
    }
},{timestamps:true});
export default mongoose.model('subscriptiontypes', subscriptiontype);
