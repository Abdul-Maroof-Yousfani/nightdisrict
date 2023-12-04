import mongoose, { Mongoose } from 'mongoose';

const financial = new mongoose.Schema({
    type: {
        type: String,
        default : 'nightly'
    },
    bar: {
        type: mongoose.Types.ObjectId,
        default : null,
        ref : "bars"
    },
    url : {
        type : String,
        default : ""
    }
},
{
    timestamps :true
});

export default mongoose.model('financials', financial);
