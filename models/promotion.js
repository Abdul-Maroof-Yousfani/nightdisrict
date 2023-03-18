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
    menu : [
        {
            item:  {
                type : mongoose.Types.ObjectId,
                default : null
            },
            category:{
                type : mongoose.Types.ObjectId,
                default : null
            }

        },
        {
            default : []
        }
    ]
},{timestamps:true});
export default mongoose.model('promotions', promotion);
