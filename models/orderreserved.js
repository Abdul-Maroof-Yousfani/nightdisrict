import mongoose from "mongoose";
const orderreserved = new mongoose.Schema({
    order:{
        type: mongoose.Schema.Types.ObjectId,
        ref : "orders",
        default:{}
    },
    customer:{
        type: mongoose.Schema.Types.ObjectId,
        ref : "users",
        default:{}
    },
    bar:{
        type: mongoose.Schema.Types.ObjectId,
        ref : "bars",
        default:{}
    },
    status :{
        type : String,
        default : ""
    }
    

},{timestamps:true})
export default mongoose.model("orderreserves", orderreserved)