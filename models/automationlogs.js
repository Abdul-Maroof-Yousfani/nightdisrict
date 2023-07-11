import mongoose, { Mongoose } from 'mongoose';

const automationlogs = new mongoose.Schema({
    status : {
        type : String,
        default : ""
    }
},
{
    timestamps :true
});
export default mongoose.model('automationlog', automationlogs);
