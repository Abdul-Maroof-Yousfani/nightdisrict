import mongoose from 'mongoose';

const menuCategory = new mongoose.Schema({
    name: {
        type: String
    },
    user : {
        type: mongoose.Schema.Types.ObjectId, ref: 'users',
        default : null
    },
    description:{
        type: String
    },
    category_image:{
        type: String,
        default : "",
    },
    parent:{
        type: mongoose.Schema.Types.ObjectId, ref: 'menuCategory',
        default : null
    },
    parent2 : [
        {
            category : {
                type : mongoose.Types.ObjectId,
                default : null
            }
        }
    ],
    aliases: [
        {
            type: String,
        },
    ],
    mixture_name: {
        type: String,
    },
    mixture_aliases: [
        {
            type: String,
        },
    ],

},{timestamps:true});
export default mongoose.model('menuCategory', menuCategory);
