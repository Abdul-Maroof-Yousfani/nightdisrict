import mongoose, { Mongoose } from 'mongoose';

const applicationLog = new mongoose.Schema({
    string : {
        type : String,
        default : ""
    },
    

},
{
    timestamps :true
});
export default mongoose.model('logs', applicationLog);
