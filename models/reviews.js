import mongoose, { Mongoose, mongo } from 'mongoose';

const reviews = new mongoose.Schema({
    Order : {
        type : mongoose.Types.ObjectId,
        ref : "orders",
        default : null
    },
    customer: {
        type: mongoose.Types.ObjectId,
        ref : "customers",
        default : null
    },
    item: {
        type: mongoose.Types.ObjectId,
        ref : "menus",
        default : null
    },
    variation: {
        type: mongoose.Types.ObjectId,
        ref : "menus",
        default : null
    },
    rating:{
        type: Number,
        default : 0
    },
    bar : {
        type: mongoose.Types.ObjectId,
        ref : "bars",
        default : null
    },
    message : {
        type : String,
        default : ""
    },
    type : {
        type : String,
        default : "drinks"
    }
   
},
{
    timestamps : true
});

reviews.index({
    item: 1,
    bar : 1
})
export default mongoose.model('reviews', reviews);
