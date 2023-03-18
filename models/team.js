import mongoose from 'mongoose';

const teamMember = new mongoose.Schema({
    bar: {
        type: mongoose.Types.ObjectId,
        ref : 'bar',
        default : null
    },
    type: {
        type: mongoose.Types.ObjectId,
        ref : 'role',
        default : null
    },
    user : {
        type: mongoose.Types.ObjectId,
        ref : 'users',
        default : null
    },
    created_by : {
        type: mongoose.Types.ObjectId,
        ref : 'users',
        default : null
    },
   
},{timestamps:true});
export default mongoose.model('teammembers', teamMember);
