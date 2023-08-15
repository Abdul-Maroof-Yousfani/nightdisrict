import mongoose from 'mongoose';

const page = new mongoose.Schema({
    title : {
        type: String,
        default : ""
    },
    slug : {
        type : String,
        default:""
    },
    description : {
        type : String,
        default:""
    }
},
{
    timestamps:""
});
export default mongoose.model('page', page);
