import mongoose from 'mongoose';

const promotion = new mongoose.Schema({
    title: {
        type: String
    },
    from : {
        type :Date,
        default : Date.now()
    },
    to : {
        type :Date,
        default : Date.now()
    },
    price:{
        type: Number,
        default : 0
    },
    repeat:{
        type : Boolean,
        default : false
    },
    category:{

        type : mongoose.Types.ObjectId,
        default : null
    },
    picture  :{
        type : String,
        default : ""
    },
    infinity:{
        type:Boolean,
        default:false
    },
    discount:{
        type:Number,
        default : 0
    },
    menu : [
        {
            item:  {
                type : mongoose.Types.ObjectId,
                default : null
            }

        },
        {
            default : []
        }
    ],
    bar:{

        type : mongoose.Types.ObjectId,
        ref : "bars",
        default : null
    },
},{timestamps:true});
export default mongoose.model('promotions', promotion);
