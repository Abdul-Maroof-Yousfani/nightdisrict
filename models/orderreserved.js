import mongoose from "mongoose";
const orderreserved = new mongoose.Schema({
    orderid:{
        type: mongoose.Schema.Types.ObjectId,
        ref : "orders"
    },
    customer:{
        type: mongoose.Schema.Types.ObjectId,
        ref : "users"
    },
    bar:{
        type: mongoose.Schema.Types.ObjectId,
        ref : "bars"
    },
    orderStatus :{
        type : String,
        default : ""
    }
    

},{timestamps:true})
export default mongoose.model("orderreserves", orderreserved)