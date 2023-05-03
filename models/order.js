import mongoose from "mongoose";
const orderSchema = new mongoose.Schema({
    subscriptionType:{
        type: mongoose.Schema.Types.ObjectId,
        ref : "subscriptionTypes",
        default:{}
    },
    type:{
        type: mongoose.Schema.Types.ObjectId,
        ref : "menucategories",
        default:{}
    },
    orderNo:{
        type:String,
        default:""
    },
    items:[
        {
            item:{
                type : mongoose.Schema.Types.ObjectId,
                default:null
            },
            bar:{
                type : mongoose.Schema.Types.ObjectId,
                ref:"bars",
                default:null
            },
            price : {
                type : Number,
                default : 0
            },
            
            price:{
                type:Number,
                default:0
            },
            promotion : {
                type : mongoose.Schema.Types.ObjectId,
                ref:"promotions",
                default:null
            },
            status : {
                type : String,
                default : "processing"
            }
        }
    ],
    customer : {
        type:mongoose.Schema.Types.ObjectId,
        ref:"users"
    },
    bartender : {
        type:mongoose.Schema.Types.ObjectId,
        ref : "users",
        default : null
    },
    tip : {
        type:Number,
        default : 0
    },
    cardId :{
        type:mongoose.Schema.Types.ObjectId,
        default:null
    },
    orderStatus : {
        type : String,
        default : ""
    },
    customer: {
        type:mongoose.Schema.Types.ObjectId,
        ref : "users",
        default:null
    }

},{timestamps:true})
export default mongoose.model("orders", orderSchema)