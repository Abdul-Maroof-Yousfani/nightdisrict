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
    type : {
        type : String,
        default : ""
    },
    picture : {
        type :String,
        default : ""
    },
    feedback:{
        type : String,
        default : ""
    },
    status:{
        type : String,
        default : 'created'
    }
},
{
    timestamps:true
});
export default mongoose.model('inquiries', barInquiries);
