import mongoose from 'mongoose';

const hastag = new mongoose.Schema({
    name : {
        type: String,
        default : ""
    },
    type : {
        type : String,
        default : "bar"
    },
    isActive : {
        type : Boolean,
        default:true
    }
},
{
    timestamps:true
});

hastag.index({ name: 1, type: 1});

export default mongoose.model('hastags', hastag);
