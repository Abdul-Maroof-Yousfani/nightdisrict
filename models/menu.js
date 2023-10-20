import mongoose from 'mongoose';
import { v4 } from 'uuid';

const menu = new mongoose.Schema({
    barId: {
        type: mongoose.Schema.Types.ObjectId, ref: 'bars',
        default : null
    },
    menu_name: {
        type : String,
        default : ""
    },
    description : {
        type : String,
        default : ""
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
    categories : [
        {
            category : {
                type : mongoose.Types.ObjectId,
                default : null
            }
        }
    ],

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

menu.index({ item: 1, barId: 1 , category :1 , subCategory : 1 });
export default mongoose.model('menu', menu);
