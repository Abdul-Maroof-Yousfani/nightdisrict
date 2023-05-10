import mongoose, { Mongoose, mongo } from 'mongoose';

const report = new mongoose.Schema({
    type: {
        type : String,
        default : "order"
    },
    orderid:{
        type: mongoose.Types.ObjectId,
        ref : "orders",
        default : null
    },

    reported_by:{
        type : mongoose.Types.ObjectId,
        ref : "users",
        default : null
    },
    bar:{
        type : mongoose.Types.ObjectId,
        ref : "bars",
        default : null
    },
    other:{
        type:Boolean,
        default:true
    },
    message:{
        type: String,
        default : ""
    }
});
export default mongoose.model('reports', report);
