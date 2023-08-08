import mongoose from 'mongoose';

const menu = new mongoose.Schema({
    barId: {
        type: mongoose.Schema.Types.ObjectId, ref: 'bars',
        default : null
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
    ]
   
});
export default mongoose.model('menu', menu);
