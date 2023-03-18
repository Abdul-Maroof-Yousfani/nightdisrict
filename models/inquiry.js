import mongoose from 'mongoose';

const barInquiries = new mongoose.Schema({
    name : {
        type: String,
        default : ""
    },
    email : {
        type: String,
        default : ""
    },
    message : {
        type: String,
        default : ""
    },
    bar: {
        type : mongoose.Types.ObjectId,
        default : null
    },
    picture : {
        type :String,
        default : ""
    }
},
{
    timestamps:true
});
export default mongoose.model('inquiries', barInquiries);
