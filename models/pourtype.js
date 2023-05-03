import mongoose from 'mongoose';

const pourtype = new mongoose.Schema({
    name: {
        type: String
    },
    isActive : {
        type : Boolean,
        default : true
    }
    
},{timestamps:true});
export default mongoose.model('pourtypes', pourtype);
