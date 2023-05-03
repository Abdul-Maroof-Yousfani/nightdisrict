import mongoose from 'mongoose';

const hastag = new mongoose.Schema({
    name : {
        type: String,
        default : ""
    },
    isActive : {
        type : Boolean,
        default:true
    }
},
{
    timestamps:true
});
export default mongoose.model('hastags', hastag);
