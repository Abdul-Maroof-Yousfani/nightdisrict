import mongoose, { Mongoose } from "mongoose";
const orderSchema = new mongoose.Schema({
    subscriptionType:{
        type: mongoose.Schema.Types.ObjectId,
        ref : "subscriptionTypes",
    },
    type:{
        type: mongoose.Schema.Types.ObjectId,
        ref : "menucategories",
    },
    orderNo:{
        type:String,
        default:""
    },
    bar:{
        type : mongoose.Schema.Types.ObjectId,
        ref:"bars",
    },
    estimatedTime : {
        type : String,
        default : "10 Minutes"
    },
    items:[
        {
            item:{
                type : mongoose.Schema.Types.ObjectId,
                default:null
            },
            variant:{
                type : mongoose.Schema.Types.ObjectId,
                default:null
            },
            mixers : [{
                mixerName : {
                    type : String,
                    default : ""
                },
                item : {
                    type : mongoose.Types.ObjectId,
                    default  : null
                },
                price : {
                    type : Number,
                    default : 0
                }
            }],

            price : {
                type : Number,
                default : 0
            },
            
            qty:{
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
                default : "new"
            }
        }
    ],
    
    tip : {
        type:Number,
        default : 0
    },
    amount : {
        type : Number,
        default : 0
    },
    totalPrice : {
        type : Number,
        default : 0
    },
    totalQuantity : {
        type : Number,
        default : 0
    },
    cardId :{
        type:mongoose.Schema.Types.ObjectId,
        default:null
    },
    orderStatus : {
        type : String,
        default : "preparing"
    },
    customer: {
        type:mongoose.Schema.Types.ObjectId,
        ref : "users",
        default:null
    },
    bartender:{
        type: mongoose.Schema.Types.ObjectId,
        ref : "users",
    },
    instruction : {
        type : String,
        default : ""
    }

},{timestamps:true})
export default mongoose.model("orders", orderSchema)