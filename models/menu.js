import mongoose from 'mongoose';
import { v4 } from 'uuid';

const menu = new mongoose.Schema({
    barId: {
        type: mongoose.Schema.Types.ObjectId, ref: 'bars',
        default : null
    },
    itemcode : {
        type : String,
        default : Date.now() - Math.floor(Math.random() * 10000)
    },
    item : {
        type: mongoose.Schema.Types.ObjectId, ref: 'supermenus',
        default : null
    },
    category : {
        type : mongoose.Types.ObjectId,
        ref : "menuCategories",
        default : null
    },
    subCategory : {
        type : mongoose.Types.ObjectId,
        ref : "menuCategories",
        default : null
    },

    variation : [
        {
            variant :{
                type : mongoose.Schema.Types.ObjectId, ref: 'pourtypes',
                default : null
            },
            price : {
                type : Number,
                default : 0
            }
        }
    ],
    reviews:[{
        customer : {
            type : String,
            ref : "users",
            default : null
        },
        review : {
            type : String,
            default : null,
            ref : "reviews"

        }
    }]
   
});
export default mongoose.model('menu', menu);
