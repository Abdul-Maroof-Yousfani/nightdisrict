import mongoose from 'mongoose';

const pourtype = new mongoose.Schema({
    name: {
        type: String
    },
    isActive : {
        type : Boolean,
        default : true
    },
    quantity:
    {
        type : Number,
        default : 0
    }
    
},{timestamps:true});
export default mongoose.model('pourtypes', pourtype);
