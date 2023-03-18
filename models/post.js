import mongoose from 'mongoose';

const post = new mongoose.Schema({
    title: {
        type: String
    },
    description : {
        type :String,
        default : ""
    },
    hastags:[{
        type: mongoose.Types.ObjectId,
        default : []
    },
    {
        default : []
    }

    ],
    bar : {
        type : mongoose.Types.ObjectId,
        ref : 'bars',
        default : null
    },
    isActive : {
        type : Boolean,
        default : true
    }
    
},{timestamps:true});
export default mongoose.model('posts', post);
