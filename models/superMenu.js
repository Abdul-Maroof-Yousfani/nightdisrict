import mongoose from 'mongoose';

const superMenu = new mongoose.Schema({
    bar : {
        type: mongoose.Schema.Types.ObjectId, ref: 'bars',
        default : null
    },
    user : {
        type: mongoose.Schema.Types.ObjectId, ref: 'users',
        default : null
    },
    userType :
    {
        type: mongoose.Schema.Types.ObjectId, ref: 'role',
        default : null

    },
    menu_name:{
        type : String,
        default : ""
    },

    description: {
        type : String,
        default : ""
    },
    category:
    {
        type: mongoose.Schema.Types.ObjectId, ref: 'menuCategory',
        default : null
    },
    subCategory:{
        type: mongoose.Schema.Types.ObjectId, ref: 'menuCategory',
        default : null
    },
    picture:{
        type: String,
        default : ""
    },
    pictures:[{
        type : String,
    },{
        default : []
    }],
    categories:[{
        type: mongoose.Schema.Types.ObjectId, ref: 'menuCategory'
    },{
        default : []
    }],
    subCategories:[{
        type: mongoose.Schema.Types.ObjectId, ref: 'menuCategory'
    },{
        default : []
    }],
    
},{timestamps:true});
export default mongoose.model('superMenu', superMenu);
